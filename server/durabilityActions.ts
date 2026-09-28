import { db } from './db.ts';
import {
  TraineePath,
  sustainCurve,
  calculateGroupLdi,
  computeStatewideRetentionMix,
  getCohortPaths
} from './durability.ts';
import { DurabilityAction, Alert } from '../src/types.ts';

export function evaluateDurabilityActions(paths?: TraineePath[]): DurabilityAction[] {
  const allPaths = paths || getCohortPaths();
  const mix = computeStatewideRetentionMix(allPaths);
  const dbState = db.getState();

  const providerMap = new Map(dbState.providers.map(p => [p.id, p]));
  const courseMap = new Map(dbState.courses.map(c => [c.id, c]));

  // Group paths by provider
  const pathsByProvider = new Map<string, TraineePath[]>();
  for (const p of allPaths) {
    if (!pathsByProvider.has(p.providerId)) {
      pathsByProvider.set(p.providerId, []);
    }
    pathsByProvider.get(p.providerId)!.push(p);
  }

  // Group paths by course
  const pathsByCourse = new Map<string, TraineePath[]>();
  for (const p of allPaths) {
    if (!pathsByCourse.has(p.courseId)) {
      pathsByCourse.set(p.courseId, []);
    }
    pathsByCourse.get(p.courseId)!.push(p);
  }

  const actions: DurabilityAction[] = [];
  let actionCounter = 1;

  // Statewide 6m curve point
  const stateCurve = sustainCurve(allPaths);
  const stateP6 = stateCurve.find(p => p.month === 6)?.retained ?? 0.82;
  const stateP12 = stateCurve.find(p => p.month === 12)?.retained ?? 0.65;

  // 1. Evaluate Providers
  for (const [providerId, pList] of pathsByProvider.entries()) {
    const prov = providerMap.get(providerId);
    const provName = prov?.name || providerId;
    const ldiData = calculateGroupLdi(pList, mix);
    const curve = ldiData.curve;
    const p6 = curve.find(p => p.month === 6);
    const p12 = curve.find(p => p.month === 12);
    const p24 = curve.find(p => p.month === 24);

    const isReliable = ldiData.reliability === 'Reliable';

    // Rule: Data gap (Coverage under 60%)
    if (ldiData.coverage < 60) {
      actions.push({
        id: `act-dur-${actionCounter++}`,
        rule: 'Data gap',
        title: `Low Follow-up Coverage (${ldiData.coverage}%) - ${provName}`,
        evidence: `Only ${ldiData.coverage}% of 12-month cohort completed follow-up (${ldiData.n} effective trainees). Benchmark threshold is 60%.`,
        recommendation: `Do not judge the provider yet; improve follow-up response (link to the follow-up queue).`,
        group: provName,
        entity_type: 'provider',
        entity_id: providerId,
        severity: 'Medium',
        status: 'Open',
        triggered_on: '2026-09-21T08:00:00Z'
      });
    }

    if (!isReliable) continue;

    // Rule: Early drop-off
    // Retained at 6 months is at least 10 points below the state average and the interval excludes it
    if (p6) {
      const dropOffPoints = (stateP6 - p6.retained) * 100;
      const intervalExcludes = p6.upper < stateP6;
      if (dropOffPoints >= 10 && intervalExcludes) {
        actions.push({
          id: `act-dur-${actionCounter++}`,
          rule: 'Early drop-off',
          title: `Severe Early Attrition at 6 Months - ${provName}`,
          evidence: `6-month retention is ${Math.round(p6.retained * 100)}% (95% CI: ${Math.round(p6.lower * 100)}%–${Math.round(p6.upper * 100)}%), which is ${Math.round(dropOffPoints)} pts below state benchmark (${Math.round(stateP6 * 100)}%).`,
          recommendation: `Add post-placement mentoring and an employer check-in in the second month.`,
          group: provName,
          entity_type: 'provider',
          entity_id: providerId,
          severity: 'High',
          status: 'Open',
          triggered_on: '2026-09-21T08:00:00Z'
        });
      }
    }

    // Rule: Wage stagnation
    // 12-month retention at or above state average but Progressed share below 10%
    if (p12 && p12.retained >= stateP12 && ldiData.progression12 < 10) {
      actions.push({
        id: `act-dur-${actionCounter++}`,
        rule: 'Wage stagnation',
        title: `Wage Stagnation (<10% Promoted) - ${provName}`,
        evidence: `12-month retention is healthy at ${ldiData.sustain12}%, but only ${ldiData.progression12}% achieved a 10%+ wage increase after 1 year.`,
        recommendation: `Add an upskilling or advanced module to the course; link trainees to higher-paying employers.`,
        group: provName,
        entity_type: 'provider',
        entity_id: providerId,
        severity: 'Medium',
        status: 'Open',
        triggered_on: '2026-09-21T08:00:00Z'
      });
    }

    // Rule: Late decay
    // Retention falls by 15 points or more between 12 and 24 months
    if (p12 && p24 && p24.n >= 15) {
      const drop12to24 = (p12.retained - p24.retained) * 100;
      if (drop12to24 >= 15) {
        actions.push({
          id: `act-dur-${actionCounter++}`,
          rule: 'Late decay',
          title: `Late Retention Decay (-${Math.round(drop12to24)} pts) - ${provName}`,
          evidence: `Retention collapses from ${Math.round(p12.retained * 100)}% at 12m to ${Math.round(p24.retained * 100)}% at 24m (${Math.round(drop12to24)} pts loss).`,
          recommendation: `Start an alumni support programme with refresher training.`,
          group: provName,
          entity_type: 'provider',
          entity_id: providerId,
          severity: 'High',
          status: 'Open',
          triggered_on: '2026-09-21T08:00:00Z'
        });
      }
    }

    // Rule: Replicate
    // LDI band A with a Reliable sample
    if (ldiData.band === 'A' && isReliable) {
      actions.push({
        id: `act-dur-${actionCounter++}`,
        rule: 'Replicate',
        title: `Model Centre of Excellence (LDI ${ldiData.ldi}) - ${provName}`,
        evidence: `Exemplary LDI score of ${ldiData.ldi}/100 with ${ldiData.sustain12}% 12m retention and ${ldiData.progression12}% wage promotion across ${ldiData.n} trainees.`,
        recommendation: `Document this provider's practice as a case study for other providers.`,
        group: provName,
        entity_type: 'provider',
        entity_id: providerId,
        severity: 'Low',
        status: 'Open',
        triggered_on: '2026-09-21T08:00:00Z'
      });
    }
  }

  // 2. Evaluate Courses for Downgrade cluster
  // Downgrade cluster: Downgraded share above 15% in a course or sector
  for (const [courseId, cList] of pathsByCourse.entries()) {
    const course = courseMap.get(courseId);
    const courseName = course?.name || courseId;

    let downgradedCount = 0;
    let totalEvaluated = 0;

    for (const p of cList) {
      const s12 = p.states[12];
      if (s12 && s12 !== 'NotDue' && s12 !== 'Unknown') {
        totalEvaluated++;
        if (s12 === 'Downgraded') downgradedCount++;
      }
    }

    if (totalEvaluated >= 20) {
      const downgradePct = Math.round((downgradedCount / totalEvaluated) * 100);
      if (downgradePct > 15) {
        actions.push({
          id: `act-dur-${actionCounter++}`,
          rule: 'Downgrade cluster',
          title: `High Wage Downgrades (${downgradePct}%) - ${courseName}`,
          evidence: `${downgradePct}% of active trainees in ${courseName} suffered nominal wage cuts below their 3-month baseline (${downgradedCount} of ${totalEvaluated} trainees).`,
          recommendation: `Review job-role matching and employer quality for that course.`,
          group: courseName,
          entity_type: 'course',
          entity_id: courseId,
          severity: 'High',
          status: 'Open',
          triggered_on: '2026-09-21T08:00:00Z'
        });
      }
    }
  }

  // Synchronize with DB alerts table (type = 'durability')
  syncActionsWithAlerts(actions);

  return actions;
}

/**
 * Synchronize generated actions with existing alerts table so they show in alerts page and right rail.
 */
function syncActionsWithAlerts(actions: DurabilityAction[]) {
  const existingAlerts = db.getState().alerts;
  const nonDurabilityAlerts = existingAlerts.filter(a => a.type !== 'durability');

  const durabilityAlerts: Alert[] = actions.map(act => {
    // Check if there is already an alert with this id or matching entity
    const existing = existingAlerts.find(a => a.id === act.id);
    return {
      id: act.id,
      type: 'durability',
      severity: act.severity,
      entity_type: act.entity_type,
      entity_id: act.entity_id,
      message: `${act.title}: ${act.evidence}`,
      suggested_action: act.recommendation,
      status: existing ? existing.status : act.status,
      created_on: act.triggered_on
    };
  });

  db.setTable('alerts', [...nonDurabilityAlerts, ...durabilityAlerts]);
}
