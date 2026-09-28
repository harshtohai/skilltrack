import express from 'express';
import { db } from './db.ts';
import {
  getCohortPaths,
  sustainCurve,
  calculateGroupLdi,
  computeLeaderboard,
  computeStatewideRetentionMix,
  classify
} from './durability.ts';
import { evaluateDurabilityActions } from './durabilityActions.ts';
import { generateDurabilityInsights } from './ai.ts';

const router = express.Router();

// 1. GET /api/durability/curve
router.get('/curve', (req, res) => {
  try {
    const groupBy = (req.query.group_by as string) || 'state';
    const id = req.query.id as string | undefined;
    const cohort = (req.query.cohort as string) || 'all';

    const allPaths = getCohortPaths(cohort);
    const benchmarkPoints = sustainCurve(allPaths);
    const dbState = db.getState();

    const providerMap = new Map(dbState.providers.map(p => [p.id, p]));
    const courseMap = new Map(dbState.courses.map(c => [c.id, c]));
    const districtMap = new Map(dbState.districts.map(d => [d.id, d]));

    const stateMix = computeStatewideRetentionMix(allPaths);

    // If specific ID is requested
    if (id) {
      let filtered = allPaths;
      let name = id;
      let type: any = 'provider';

      if (providerMap.has(id)) {
        filtered = allPaths.filter(p => p.providerId === id);
        name = providerMap.get(id)!.name;
        type = 'provider';
      } else if (courseMap.has(id)) {
        filtered = allPaths.filter(p => p.courseId === id);
        name = courseMap.get(id)!.name;
        type = 'course';
      } else if (districtMap.has(id)) {
        filtered = allPaths.filter(p => p.districtId === id);
        name = districtMap.get(id)!.name;
        type = 'district';
      } else {
        // Maybe provider type
        filtered = allPaths.filter(p => p.providerType.toLowerCase() === id.toLowerCase());
        name = id;
        type = 'provider_type';
      }

      const ldiData = calculateGroupLdi(filtered, stateMix);
      const benchObj = {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        points: benchmarkPoints
      };
      return res.json({
        curves: [{
          id,
          name,
          type,
          points: ldiData.curve,
          reliability: ldiData.reliability,
          note: ldiData.reliability === 'Low sample' ? 'Small cohort: interpretive caution advised' : undefined,
          sample_size: ldiData.n,
          coverage: ldiData.coverage,
          ldi: ldiData.ldi,
          band: ldiData.band
        }],
        benchmark: benchObj,
        state_benchmark: benchObj
      });
    }

    // If group_by == 'state'
    if (groupBy === 'state') {
      const stateLdi = calculateGroupLdi(allPaths, stateMix);
      const benchObj = {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        points: benchmarkPoints
      };
      return res.json({
        curves: [{
          id: 'state',
          name: 'Maharashtra State Benchmark',
          type: 'state',
          points: benchmarkPoints,
          reliability: stateLdi.reliability,
          sample_size: stateLdi.n,
          coverage: stateLdi.coverage,
          ldi: stateLdi.ldi,
          band: stateLdi.band
        }],
        benchmark: benchObj,
        state_benchmark: benchObj
      });
    }

    // Group by provider_type
    if (groupBy === 'provider_type') {
      const types = ['ITI', 'PMKVY Centre', 'NSDC Partner', 'Private Training Partner'];
      const curves = types.map(t => {
        const pathsForType = allPaths.filter(p => p.providerType === t);
        const ldiData = calculateGroupLdi(pathsForType, stateMix);
        return {
          id: t,
          name: t,
          type: 'provider_type' as const,
          points: ldiData.curve,
          reliability: ldiData.reliability,
          sample_size: ldiData.n,
          coverage: ldiData.coverage,
          ldi: ldiData.ldi,
          band: ldiData.band
        };
      });

      const benchObj = {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        points: benchmarkPoints
      };
      return res.json({
        curves,
        benchmark: benchObj,
        state_benchmark: benchObj
      });
    }

    // Group by provider
    if (groupBy === 'provider') {
      const curves = dbState.providers.map(prov => {
        const paths = allPaths.filter(p => p.providerId === prov.id);
        const ldiData = calculateGroupLdi(paths, stateMix);
        return {
          id: prov.id,
          name: prov.name,
          type: 'provider' as const,
          points: ldiData.curve,
          reliability: ldiData.reliability,
          sample_size: ldiData.n,
          coverage: ldiData.coverage,
          ldi: ldiData.ldi,
          band: ldiData.band
        };
      });

      const benchObj = {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        points: benchmarkPoints
      };
      return res.json({
        curves,
        benchmark: benchObj,
        state_benchmark: benchObj
      });
    }

    // Group by course
    if (groupBy === 'course') {
      const curves = dbState.courses.map(crs => {
        const paths = allPaths.filter(p => p.courseId === crs.id);
        const ldiData = calculateGroupLdi(paths, stateMix);
        return {
          id: crs.id,
          name: crs.name,
          type: 'course' as const,
          points: ldiData.curve,
          reliability: ldiData.reliability,
          sample_size: ldiData.n,
          coverage: ldiData.coverage,
          ldi: ldiData.ldi,
          band: ldiData.band
        };
      });

      const benchObj = {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        points: benchmarkPoints
      };
      return res.json({
        curves,
        benchmark: benchObj,
        state_benchmark: benchObj
      });
    }

    // Group by district
    if (groupBy === 'district') {
      const curves = dbState.districts.map(dist => {
        const paths = allPaths.filter(p => p.districtId === dist.id);
        const ldiData = calculateGroupLdi(paths, stateMix);
        return {
          id: dist.id,
          name: dist.name,
          type: 'district' as const,
          points: ldiData.curve,
          reliability: ldiData.reliability,
          sample_size: ldiData.n,
          coverage: ldiData.coverage,
          ldi: ldiData.ldi,
          band: ldiData.band
        };
      });

      const benchObj = {
        id: 'state',
        name: 'Maharashtra State Benchmark',
        points: benchmarkPoints
      };
      return res.json({
        curves,
        benchmark: benchObj,
        state_benchmark: benchObj
      });
    }

    return res.status(400).json({ error: `Unknown group_by value: ${groupBy}` });
  } catch (err: any) {
    console.error('Error in /api/durability/curve:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. GET /api/durability/leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const groupBy = (req.query.group_by as any) || 'provider';
    const cohort = (req.query.cohort as string) || 'all';
    const minSample = parseInt((req.query.min_sample as string) || '0', 10);
    const sortBy = (req.query.sort_by as any) || 'ldi';

    const result = computeLeaderboard(groupBy, cohort, minSample, sortBy);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/durability/leaderboard:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 3. GET /api/durability/trainee-path/:id
router.get('/trainee-path/:id', (req, res) => {
  try {
    const paramId = req.params.id;
    const dbState = db.getState();

    const trainee = dbState.trainees.find(
      t => t.id === paramId || t.skill_id.toLowerCase() === paramId.toLowerCase()
    );

    if (!trainee) {
      return res.status(404).json({ error: 'Trainee not found' });
    }

    const enrolments = dbState.enrolments.filter(e => e.trainee_id === trainee.id);
    const enrolment = enrolments[0];
    const batch = enrolment ? dbState.batches.find(b => b.id === enrolment.batch_id) : undefined;
    const course = batch ? dbState.courses.find(c => c.id === batch.course_id) : undefined;
    const provider = batch ? dbState.providers.find(p => p.id === batch.provider_id) : undefined;
    const district = dbState.districts.find(d => d.id === trainee.district_id);

    const outcomes = dbState.outcomes.filter(o => o.trainee_id === trainee.id);

    const outcome3 = outcomes.find(o => String(o.checkpoint_month) === '3');
    const bStatus = outcome3?.status;
    const bWage = outcome3?.monthly_wage ?? outcome3?.business_earnings;

    const baseline = outcome3 ? {
      month: 3,
      status: bStatus || 'Unemployed',
      income: bWage,
      income_is_band: outcome3.income_is_band || false,
      income_band_index: outcome3.income_band_index ?? null
    } : null;

    const checkpoints = [3, 6, 12, 18, 24];
    const points: any[] = [];
    let currentState = 'Unknown';

    for (const m of checkpoints) {
      const out = outcomes.find(o => String(o.checkpoint_month) === String(m));
      if (!out) {
        // Not due or missing
        points.push({
          month: m,
          status: 'Not Due',
          state: 'NotDue',
          wage: undefined,
          confidence: 'Low'
        });
      } else {
        const isWorking = out.status === 'Wage Employed' || out.status === 'Self-Employed';
        const isKnown = (out.status as string) !== 'Not Reachable' && (out.status as string) !== 'Unverified';
        const currentWage = out.monthly_wage ?? out.business_earnings ?? out.stipend ?? null;
        const state = classify(
          baseline?.income || 15000,
          currentWage,
          isWorking,
          isKnown,
          baseline?.income_band_index,
          out.income_band_index
        );
        if (state !== 'NotDue') {
          currentState = state;
        }
        points.push({
          month: m,
          status: out.status,
          state,
          wage: out.monthly_wage ?? out.business_earnings ?? out.stipend,
          confidence: out.confidence,
          income_is_band: out.income_is_band,
          income_band_index: out.income_band_index,
          employer_name: out.employer_id ? dbState.employers.find(e => e.id === out.employer_id)?.name : undefined,
          source: out.source,
          recorded_on: out.recorded_on
        });
      }
    }

    // Summary sentence
    let summarySentence = `${trainee.full_name} (${trainee.skill_id}) is enrolled in ${course?.name || 'Vocational Training'}.`;
    if (currentState === 'Progressed') {
      summarySentence = `Sustained and progressed over 24 months, increasing monthly earnings from ₹${(baseline?.income || 12000).toLocaleString('en-IN')} to ₹${(points[points.length - 1]?.wage || 18000).toLocaleString('en-IN')}.`;
    } else if (currentState === 'Sustained') {
      summarySentence = `Maintained steady employment at ₹${(baseline?.income || 14000).toLocaleString('en-IN')} per month across evaluated milestones.`;
    } else if (currentState === 'Downgraded') {
      summarySentence = `Remains employed but experienced nominal wage reduction below baseline earnings.`;
    } else if (currentState === 'Exited') {
      summarySentence = `Separated from employment after initial placement; currently in follow-up transition.`;
    }

    return res.json({
      trainee: {
        id: trainee.id,
        name: trainee.full_name,
        skill_id: trainee.skill_id,
        gender: trainee.gender,
        district: district?.name || 'Maharashtra',
        provider: provider?.name || 'Training Partner',
        provider_type: provider?.type || 'ITI',
        course: course?.name || 'Vocational Course',
        batch_code: batch?.batch_code || 'MH-BATCH'
      },
      baseline,
      points,
      current_state: currentState,
      summary_sentence: summarySentence
    });
  } catch (err: any) {
    console.error('Error in /api/durability/trainee-path:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 4. GET /api/durability/actions
router.get('/actions', (req, res) => {
  try {
    const { severity, entity_type, entity_id } = req.query;
    let actions = evaluateDurabilityActions();

    if (severity) {
      actions = actions.filter(a => a.severity.toLowerCase() === (severity as string).toLowerCase());
    }
    if (entity_type) {
      actions = actions.filter(a => a.entity_type === entity_type);
    }
    if (entity_id) {
      actions = actions.filter(a => a.entity_id === entity_id);
    }

    return res.json({ actions });
  } catch (err: any) {
    console.error('Error in /api/durability/actions:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 5. POST /api/durability/actions/:id/acknowledge
router.post('/actions/:id/acknowledge', (req, res) => {
  try {
    const actionId = req.params.id;
    const { note, user } = req.body;

    const alert = db.getState().alerts.find(a => a.id === actionId);
    if (alert) {
      db.update('alerts', actionId, {
        status: 'Acknowledged',
        acknowledged_by: user || 'Official',
        acknowledged_at: new Date().toISOString(),
        acknowledged_note: note
      });
    }

    return res.json({
      success: true,
      id: actionId,
      status: 'Acknowledged',
      acknowledged_at: new Date().toISOString(),
      note: note || 'Acknowledged by official'
    });
  } catch (err: any) {
    console.error('Error in acknowledge action:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 6. POST /api/ai/durability-insights
router.post('/insights', async (req, res) => {
  try {
    const { entity_type, entity_id, period } = req.body;
    const allPaths = getCohortPaths(period || 'all');
    const mix = computeStatewideRetentionMix(allPaths);
    const stateLdi = calculateGroupLdi(allPaths, mix);
    const dbState = db.getState();

    let targetPaths = allPaths;
    let entityName = 'Maharashtra State Aggregate';
    const type = entity_type || 'state';

    if (entity_type === 'provider' && entity_id) {
      targetPaths = allPaths.filter(p => p.providerId === entity_id);
      entityName = dbState.providers.find(p => p.id === entity_id)?.name || entity_id;
    } else if (entity_type === 'course' && entity_id) {
      targetPaths = allPaths.filter(p => p.courseId === entity_id);
      entityName = dbState.courses.find(c => c.id === entity_id)?.name || entity_id;
    } else if (entity_type === 'provider_type' && entity_id) {
      targetPaths = allPaths.filter(p => p.providerType.toLowerCase() === entity_id.toLowerCase());
      entityName = entity_id;
    } else if (entity_type === 'district' && entity_id) {
      targetPaths = allPaths.filter(p => p.districtId === entity_id);
      entityName = dbState.districts.find(d => d.id === entity_id)?.name || entity_id;
    }

    const ldiData = calculateGroupLdi(targetPaths, mix);

    // Find active action triggers
    const actions = evaluateDurabilityActions(targetPaths);
    const activeRules = Array.from(new Set(actions.map(a => a.rule)));

    const insight = await generateDurabilityInsights({
      entityName,
      entityType: type,
      sampleSize: ldiData.n,
      ldi: ldiData.ldi,
      band: ldiData.band,
      sustain12: ldiData.sustain12,
      progression12: ldiData.progression12,
      stateSustain12: stateLdi.sustain12,
      stateProgression12: stateLdi.progression12,
      activeRules
    });

    return res.json({
      insight,
      metrics: {
        entity_name: entityName,
        sample_size: ldiData.n,
        ldi: ldiData.ldi,
        band: ldiData.band,
        sustain12: ldiData.sustain12,
        progression12: ldiData.progression12,
        state_sustain12: stateLdi.sustain12,
        state_progression12: stateLdi.progression12,
        active_rules: activeRules
      }
    });
  } catch (err: any) {
    console.error('Error in /api/ai/durability-insights:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
