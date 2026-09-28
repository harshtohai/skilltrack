import { Outcome, ConfidenceLevel, Trainee, Enrolment, Batch, Course, Provider, Alert } from '../src/types.ts';
import { db } from './db.ts';

export type State = 'Progressed' | 'Sustained' | 'Downgraded' | 'Exited' | 'Unknown' | 'NotDue';

export const CONFIG = {
  tolerance: 0.05,        // 5% below baseline counts as Sustained
  promotion: 0.10,        // 10% above baseline counts as Progressed
  shrinkK: 30,            // Empirical Bayes shrinkage parameter
  minN: 30,               // Threshold for 'Reliable' sample size
  insufficientN: 10,      // Threshold below which data is 'Insufficient'
  z: 1.96,                // 95% confidence interval multiplier
  sustainScale: 0.65,     // State target/scaling denominator for 12m retention
  progressionScale: 0.30, // 30% progression earns 1.0 progression score
  sustainWeight: 0.6,     // LDI weight for retention
  progressionWeight: 0.4  // LDI weight for wage progression
};

export const CHECKPOINTS = [6, 12, 18, 24]; // month 3 is baseline

// Income bands (0 to 6)
export const INCOME_BANDS = [
  { index: 0, label: '< ₹8,000', min: 0, max: 8000, mid: 6500 },
  { index: 1, label: '₹8,000 - ₹12,000', min: 8001, max: 12000, mid: 10000 },
  { index: 2, label: '₹12,001 - ₹15,000', min: 12001, max: 15000, mid: 13500 },
  { index: 3, label: '₹15,001 - ₹18,000', min: 15001, max: 18000, mid: 16500 },
  { index: 4, label: '₹18,001 - ₹22,000', min: 18001, max: 22000, mid: 20000 },
  { index: 5, label: '₹22,001 - ₹28,000', min: 22001, max: 28000, mid: 25000 },
  { index: 6, label: '> ₹28,000', min: 28001, max: 100000, mid: 32000 }
];

export function getBandIndexFromAmount(amount: number): number {
  for (const b of INCOME_BANDS) {
    if (amount <= b.max) return b.index;
  }
  return 6;
}

/**
 * Classify a trainee's state at a single checkpoint relative to month-3 baseline.
 * Follows exact precision rules:
 * - If band-only at either baseline or current:
 *   - Move up by one full band -> Progressed
 *   - Move down by one full band -> Downgraded
 *   - Same band -> Sustained
 */
export function classify(
  baseline: number,
  current: number | null,
  working: boolean,
  known: boolean,
  baselineBand?: number | null,
  currentBand?: number | null
): State {
  if (!known) return 'Unknown'; // not reachable, further study, or missing
  if (!working || (current == null && currentBand == null)) return 'Exited';

  if (baselineBand != null || currentBand != null) {
    const bBand = baselineBand != null ? baselineBand : getBandIndexFromAmount(baseline);
    const cBand = currentBand != null ? currentBand : (current != null ? getBandIndexFromAmount(current) : null);
    if (cBand == null) return 'Exited';
    if (cBand > bBand) return 'Progressed';
    if (cBand === bBand) return 'Sustained';
    return 'Downgraded';
  }

  if (current! >= baseline * (1 + CONFIG.promotion)) return 'Progressed';
  if (current! >= baseline * (1 - CONFIG.tolerance)) return 'Sustained';
  return 'Downgraded';
}

export interface TraineePath {
  traineeId: string;
  states: Partial<Record<number, State>>;
  wages: Partial<Record<number, number>>;
  isBand: Partial<Record<number, boolean>>;
  confidence: Partial<Record<number, ConfidenceLevel>>;
  courseId: string;
  providerId: string;
  providerType: string;
  districtId: string;
  gender: string;
  category: string;
  areaType: 'Urban' | 'Rural';
  year: string;
}

export type UnknownMode = 'censor' | 'retained' | 'failed'; // 'retained'/'failed' = best/worst case

/**
 * Life-table (actuarial) survival estimator with Greenwood 95% confidence intervals.
 */
export function sustainCurve(paths: { states: Partial<Record<number, State>> }[], unknownMode: UnknownMode = 'censor') {
  let atRisk = paths.slice(); // everyone in cohort is retained at month 3
  let survival = 1;
  let greenwood = 0;
  const points = [{ month: 3, retained: 1, lower: 1, upper: 1, n: paths.length }];

  for (const m of CHECKPOINTS) {
    let failed = 0;
    let censored = 0;
    const stillRetained: { states: Partial<Record<number, State>> }[] = [];

    for (const p of atRisk) {
      let s: State = p.states[m] ?? 'NotDue';
      if (s === 'Unknown' && unknownMode === 'retained') s = 'Sustained';
      if (s === 'Unknown' && unknownMode === 'failed') s = 'Exited';

      if (s === 'Downgraded' || s === 'Exited') {
        failed++;
      } else if (s === 'Unknown' || s === 'NotDue') {
        censored++; // leaves the risk set
      } else {
        stillRetained.push(p); // Progressed or Sustained
      }
    }

    const nEff = atRisk.length - censored / 2; // actuarial adjustment
    if (nEff <= 0) break; // nobody left to observe

    survival *= 1 - failed / nEff;
    if (nEff > failed && (nEff - failed) > 0) {
      greenwood += failed / (nEff * (nEff - failed));
    }
    const se = survival * Math.sqrt(greenwood);

    points.push({
      month: m,
      retained: Number(survival.toFixed(3)),
      lower: Number(Math.max(0, survival - CONFIG.z * se).toFixed(3)),
      upper: Number(Math.min(1, survival + CONFIG.z * se).toFixed(3)),
      n: Math.round(nEff)
    });
    atRisk = stillRetained;
  }
  return points;
}

/**
 * Small-sample smoothing (shrinkage)
 * Pulls small samples toward statewide peer benchmark (ratio = 1).
 */
export function shrink(ratio: number, nEff: number): number {
  return (nEff * ratio + CONFIG.shrinkK * 1) / (nEff + CONFIG.shrinkK);
}

/**
 * Reliability label
 */
export function reliability(nEff: number, coverage: number): 'Reliable' | 'Low sample' | 'Insufficient' {
  if (nEff < CONFIG.insufficientN || coverage < 0.4) return 'Insufficient';
  if (nEff < CONFIG.minN || coverage < 0.6) return 'Low sample';
  return 'Reliable';
}

/**
 * Self-verification test of known-answer values
 */
export function verifyKnownAnswerTest(): boolean {
  // 100 trainees in cohort.
  // Month 6: 10 Downgraded/Exited, 10 Unknown, 80 retained
  // Month 12: of 80 retained: 8 fail, 4 Unknown, 68 retained
  const mockPaths: { states: Partial<Record<number, State>> }[] = [];
  for (let i = 0; i < 100; i++) {
    if (i < 10) {
      mockPaths.push({ states: { 6: 'Exited' } });
    } else if (i < 20) {
      mockPaths.push({ states: { 6: 'Unknown' } });
    } else if (i < 28) {
      // Failed at 12
      mockPaths.push({ states: { 6: 'Sustained', 12: 'Exited' } });
    } else if (i < 32) {
      // Unknown at 12
      mockPaths.push({ states: { 6: 'Sustained', 12: 'Unknown' } });
    } else {
      // 68 retained
      mockPaths.push({ states: { 6: 'Sustained', 12: 'Sustained' } });
    }
  }

  const result = sustainCurve(mockPaths);
  const p6 = result.find(p => p.month === 6);
  const p12 = result.find(p => p.month === 12);

  if (!p6 || !p12) return false;

  const m6Match = p6.n === 95 && Math.abs(p6.retained - 0.895) <= 0.002;
  const m12Match = p12.n === 78 && Math.abs(p12.retained - 0.803) <= 0.002;
  const intervalMatch = p12.lower >= 0.719 && p12.lower <= 0.723 && p12.upper >= 0.883 && p12.upper <= 0.887;

  return m6Match && m12Match && intervalMatch;
}

// ---------------------------------------------------------------------------
// CACHED DATA PIPELINE FOR LIVE DATABASE
// ---------------------------------------------------------------------------

let cachedCohortPaths: TraineePath[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateDurabilityCache() {
  cachedCohortPaths = null;
  lastCacheTime = 0;
}

const REFERENCE_DATE = new Date('2026-09-21T00:00:00Z');

/**
 * Builds the full cohort paths from the database for consented trainees.
 */
export function getCohortPaths(cohortOrForce?: string | boolean, forceRefresh = false): TraineePath[] {
  const now = Date.now();
  let cohortFilter: string | undefined = undefined;
  let shouldForce = forceRefresh;

  if (typeof cohortOrForce === 'boolean') {
    shouldForce = cohortOrForce;
  } else if (typeof cohortOrForce === 'string') {
    cohortFilter = cohortOrForce;
  }

  if (cachedCohortPaths && !shouldForce && (now - lastCacheTime < CACHE_TTL_MS)) {
    if (cohortFilter && cohortFilter !== 'all') {
      return cachedCohortPaths.filter(p => p.year === cohortFilter);
    }
    return cachedCohortPaths;
  }

  const dbState = db.getState();
  const consentedTraineeIds = new Set(
    dbState.consents.filter(c => c.status === 'granted').map(c => c.trainee_id)
  );

  const traineeMap = new Map(dbState.trainees.map(t => [t.id, t]));
  const batchMap = new Map(dbState.batches.map(b => [b.id, b]));
  const providerMap = new Map(dbState.providers.map(p => [p.id, p]));
  const enrolmentMap = new Map(dbState.enrolments.map(e => [e.id, e]));

  // Outcomes grouped by trainee_id
  const outcomesByTrainee = new Map<string, Outcome[]>();
  for (const o of dbState.outcomes) {
    if (!outcomesByTrainee.has(o.trainee_id)) {
      outcomesByTrainee.set(o.trainee_id, []);
    }
    outcomesByTrainee.get(o.trainee_id)!.push(o);
  }

  const paths: TraineePath[] = [];

  for (const traineeId of consentedTraineeIds) {
    const trainee = traineeMap.get(traineeId);
    if (!trainee) continue;

    const traineeOutcomes = outcomesByTrainee.get(traineeId) || [];
    const baselineOutcome = traineeOutcomes.find(o => o.checkpoint_month === '3');

    // Rule: Baseline must be month 3, Wage Employed or Self-Employed, with numeric income or band
    if (!baselineOutcome) continue;
    if (baselineOutcome.status !== 'Wage Employed' && baselineOutcome.status !== 'Self-Employed') continue;

    const baselineIncome = baselineOutcome.monthly_wage ?? baselineOutcome.business_earnings;
    const baselineBand = baselineOutcome.income_band_index;

    if (baselineIncome == null && baselineBand == null) continue;
    const numericBaseline = baselineIncome != null ? baselineIncome : (baselineBand != null ? INCOME_BANDS[baselineBand].mid : 15000);

    // Find batch and provider
    const enrolment = dbState.enrolments.find(e => e.trainee_id === traineeId && e.certified);
    if (!enrolment) continue;
    const batch = batchMap.get(enrolment.batch_id);
    if (!batch) continue;
    const provider = providerMap.get(batch.provider_id);
    if (!provider) continue;

    const batchEndDate = new Date(batch.end_date);
    const batchYear = batchEndDate.getFullYear().toString();

    const states: Partial<Record<number, State>> = {};
    const wages: Partial<Record<number, number>> = { 3: numericBaseline };
    const isBand: Partial<Record<number, boolean>> = { 3: !!baselineOutcome.income_is_band };
    const confidences: Partial<Record<number, ConfidenceLevel>> = { 3: baselineOutcome.confidence };

    let hasFailedAlready = false;

    for (const m of CHECKPOINTS) {
      // Calculate due date for checkpoint m (m months after batch end date)
      const dueDate = new Date(batchEndDate);
      dueDate.setMonth(dueDate.getMonth() + m);

      if (dueDate > REFERENCE_DATE) {
        states[m] = 'NotDue';
        continue;
      }

      // Conservative life-table: once failed, stays failed in the survival curve
      if (hasFailedAlready) {
        states[m] = 'Exited';
        continue;
      }

      const outcome = traineeOutcomes.find(o => o.checkpoint_month === String(m) as any);
      if (!outcome) {
        states[m] = 'Unknown';
        continue;
      }

      confidences[m] = outcome.confidence;
      isBand[m] = !!outcome.income_is_band;

      const working = (outcome.status === 'Wage Employed' || outcome.status === 'Self-Employed') && outcome.still_employed !== false;
      const known = outcome.status !== 'Not Reachable' && outcome.status !== 'Further Study';

      const currentIncome = outcome.monthly_wage ?? outcome.business_earnings ?? null;
      const currentBand = outcome.income_band_index ?? null;

      if (currentIncome != null) wages[m] = currentIncome;
      else if (currentBand != null) wages[m] = INCOME_BANDS[currentBand].mid;

      const state = classify(numericBaseline, currentIncome, working, known, baselineBand, currentBand);
      states[m] = state;

      if (state === 'Downgraded' || state === 'Exited') {
        hasFailedAlready = true;
      }
    }

    paths.push({
      traineeId,
      states,
      wages,
      isBand,
      confidence: confidences,
      courseId: batch.course_id,
      providerId: provider.id,
      providerType: provider.type,
      districtId: trainee.district_id,
      gender: trainee.gender,
      category: trainee.category,
      areaType: trainee.area_type,
      year: batchYear
    });
  }

  cachedCohortPaths = paths;
  lastCacheTime = now;

  if (cohortFilter && cohortFilter !== 'all') {
    return paths.filter(p => p.year === cohortFilter);
  }

  return paths;
}

/**
 * Filter paths according to request query parameters.
 */
export function filterPaths(
  paths: TraineePath[],
  filters: {
    providerType?: string;
    provider?: string;
    course?: string;
    district?: string;
    gender?: string;
    category?: string;
    year?: string;
    includeUnverified?: boolean;
  }
): TraineePath[] {
  return paths.filter(p => {
    if (filters.providerType && filters.providerType !== 'all' && p.providerType !== filters.providerType) return false;
    if (filters.provider && filters.provider !== 'all' && p.providerId !== filters.provider) return false;
    if (filters.course && filters.course !== 'all' && p.courseId !== filters.course) return false;
    if (filters.district && filters.district !== 'all' && p.districtId !== filters.district) return false;
    if (filters.gender && filters.gender !== 'all' && p.gender !== filters.gender) return false;
    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.year && filters.year !== 'all' && p.year !== filters.year) return false;

    // Confidence filter: default is High or Medium only
    if (!filters.includeUnverified) {
      const conf3 = p.confidence[3];
      if (conf3 === 'Low') return false;
    }
    return true;
  });
}

/**
 * Compute Statewide expected 12-month retention rates for mix adjustment.
 */
export function computeStatewideRetentionMix(paths: TraineePath[]) {
  // Group by (courseId, areaType)
  const peerGroups = new Map<string, { total: number; retained: number }>();
  const courseGroups = new Map<string, { total: number; retained: number }>();

  let overall12mTotal = 0;
  let overall12mRetained = 0;
  let overallProgressionCount = 0;

  for (const p of paths) {
    const s12 = p.states[12];
    if (!s12 || s12 === 'NotDue') continue;

    const isRetained = s12 === 'Progressed' || s12 === 'Sustained';
    const isProgressed = s12 === 'Progressed';

    overall12mTotal++;
    if (isRetained) overall12mRetained++;
    if (isProgressed) overallProgressionCount++;

    const peerKey = `${p.courseId}_${p.areaType}`;
    if (!peerGroups.has(peerKey)) peerGroups.set(peerKey, { total: 0, retained: 0 });
    peerGroups.get(peerKey)!.total++;
    if (isRetained) peerGroups.get(peerKey)!.retained++;

    if (!courseGroups.has(p.courseId)) courseGroups.set(p.courseId, { total: 0, retained: 0 });
    courseGroups.get(p.courseId)!.total++;
    if (isRetained) courseGroups.get(p.courseId)!.retained++;
  }

  const stateAvg12m = overall12mTotal > 0 ? overall12mRetained / overall12mTotal : 0.65;
  const stateAvgProgression = overall12mTotal > 0 ? overallProgressionCount / overall12mTotal : 0.18;

  return {
    peerGroups,
    courseGroups,
    stateAvg12m,
    stateAvgProgression,
    getExpectedRetention: (courseId: string, areaType: 'Urban' | 'Rural'): number => {
      const peerKey = `${courseId}_${areaType}`;
      const pg = peerGroups.get(peerKey);
      if (pg && pg.total >= 20) {
        return pg.total > 0 ? pg.retained / pg.total : stateAvg12m;
      }
      const cg = courseGroups.get(courseId);
      if (cg && cg.total >= 10) {
        return cg.total > 0 ? cg.retained / cg.total : stateAvg12m;
      }
      return stateAvg12m;
    }
  };
}

/**
 * Calculates LDI and metrics for a given subset of paths.
 */
export function calculateGroupLdi(
  groupPaths: TraineePath[],
  mix: ReturnType<typeof computeStatewideRetentionMix>
) {
  const curve = sustainCurve(groupPaths);
  const p12 = curve.find(p => p.month === 12);
  const nEff12 = p12 ? p12.n : Math.round(groupPaths.length * 0.8);

  // Observed 12m retention from curve
  const observed12 = p12 ? p12.retained : 0;

  // Expected retention across this group's trainees
  let expectedSum = 0;
  let countWithExpectation = 0;
  let progressedCount = 0;
  let knownCount12 = 0;
  let totalDue12 = 0;

  for (const p of groupPaths) {
    const s12 = p.states[12];
    if (!s12 || s12 === 'NotDue') continue;
    totalDue12++;
    if (s12 !== 'Unknown') knownCount12++;
    if (s12 === 'Progressed') progressedCount++;

    const expected = mix.getExpectedRetention(p.courseId, p.areaType);
    expectedSum += expected;
    countWithExpectation++;
  }

  const expected12 = countWithExpectation > 0 ? expectedSum / countWithExpectation : mix.stateAvg12m;
  const adjustedRatio = Number((observed12 / Math.max(0.01, expected12)).toFixed(2));
  const shrunkRatio = Number(shrink(adjustedRatio, nEff12).toFixed(2));

  // Coverage at 12m (or latest available checkpoint)
  const coverage = totalDue12 > 0 ? Number((knownCount12 / totalDue12).toFixed(2)) : 0.85;
  const rel = reliability(nEff12, coverage);

  // Progression share at 12m
  const observedProgression = totalDue12 > 0 ? progressedCount / totalDue12 : 0;
  const shrunkProgression = (nEff12 * observedProgression + CONFIG.shrinkK * mix.stateAvgProgression) / (nEff12 + CONFIG.shrinkK);

  // LDI Score
  // sustainScore: scaled so state average is 0.65
  const sustainScore = Math.max(0, Math.min(1, (shrunkRatio * mix.stateAvg12m) / CONFIG.sustainScale));
  // progressionScore: scaled so 30% or more scores 1.0
  const progressionScore = Math.max(0, Math.min(1, shrunkProgression / CONFIG.progressionScale));

  let ldi: number | null = Math.round(100 * (CONFIG.sustainWeight * sustainScore + CONFIG.progressionWeight * progressionScore));
  if (rel === 'Insufficient') {
    ldi = null;
  }

  let band: 'A' | 'B' | 'C' | 'Needs attention' | 'Insufficient' = 'Insufficient';
  if (ldi != null) {
    if (ldi >= 75) band = 'A';
    else if (ldi >= 60) band = 'B';
    else if (ldi >= 45) band = 'C';
    else band = 'Needs attention';
  }

  return {
    ldi,
    band,
    adjustedRatio,
    shrunkRatio,
    sustain12: Math.round(observed12 * 100),
    progression12: Math.round(observedProgression * 100),
    n: nEff12,
    coverage: Math.round(coverage * 100),
    reliability: rel,
    curve
  };
}

/**
 * Calculates recovery rate across paths:
 * Failed trainees (Downgraded or Exited at 6m) who later return to Sustained or Progressed at 12m/18m/24m.
 */
export function calculateRecoveryRate(paths: TraineePath[]): number {
  let everFailed = 0;
  let laterRecovered = 0;

  for (const p of paths) {
    const s6 = p.states[6];
    if (s6 === 'Downgraded' || s6 === 'Exited') {
      everFailed++;
      const laterStates = [p.states[12], p.states[18], p.states[24]];
      if (laterStates.some(s => s === 'Progressed' || s === 'Sustained')) {
        laterRecovered++;
      }
    }
  }

  if (everFailed === 0) return 0;
  return Math.round((laterRecovered / everFailed) * 100);
}

/**
 * Computes LDI leaderboard across providers, provider types, courses, or districts.
 */
export function computeLeaderboard(
  groupBy: 'provider' | 'provider_type' | 'course' | 'district' = 'provider',
  cohort = 'all',
  minSample = 0,
  sortBy: 'ldi' | 'sustain12' | 'progression12' | 'trainees' = 'ldi'
) {
  const allPaths = getCohortPaths(cohort);
  const mix = computeStatewideRetentionMix(allPaths);
  const stateLdi = calculateGroupLdi(allPaths, mix);
  const dbState = db.getState();

  const providerMap = new Map(dbState.providers.map(p => [p.id, p]));
  const courseMap = new Map(dbState.courses.map(c => [c.id, c]));
  const districtMap = new Map(dbState.districts.map(d => [d.id, d]));

  // Group paths
  const groups = new Map<string, { id: string; name: string; type?: string; paths: TraineePath[] }>();

  for (const p of allPaths) {
    let key = '';
    let name = '';
    let type: string | undefined;

    if (groupBy === 'provider') {
      key = p.providerId;
      const prov = providerMap.get(p.providerId);
      name = prov?.name || p.providerId;
      type = prov?.type;
    } else if (groupBy === 'provider_type') {
      key = p.providerType;
      name = p.providerType;
      type = p.providerType;
    } else if (groupBy === 'course') {
      key = p.courseId;
      const crs = courseMap.get(p.courseId);
      name = crs?.name || p.courseId;
      type = crs?.sector;
    } else if (groupBy === 'district') {
      key = p.districtId;
      const dist = districtMap.get(p.districtId);
      name = dist?.name || p.districtId;
      type = dist?.region;
    }

    if (!groups.has(key)) {
      groups.set(key, { id: key, name, type, paths: [] });
    }
    groups.get(key)!.paths.push(p);
  }

  // Calculate LDI for each group
  const items = Array.from(groups.values()).map(g => {
    const ldiData = calculateGroupLdi(g.paths, mix);

    const flags: string[] = [];
    if (ldiData.coverage < 60) flags.push('Low follow-up coverage');
    if (ldiData.reliability === 'Low sample') flags.push('Small sample');
    if (ldiData.sustain12 < stateLdi.sustain12 - 10) flags.push('Early drop-off');
    if (ldiData.progression12 < 10 && ldiData.sustain12 >= stateLdi.sustain12) flags.push('Wage stagnation');

    // Expected sustain 12
    const expectedSustain = Math.round((mix.stateAvg12m) * 100);

    return {
      id: g.id,
      name: g.name,
      type: g.type,
      n: ldiData.n,
      ldi: ldiData.ldi,
      band: ldiData.band,
      sustain12: ldiData.sustain12,
      progression12: ldiData.progression12,
      expectedSustain12: expectedSustain,
      shrunkRatio: ldiData.shrunkRatio,
      reliability: ldiData.reliability,
      coverage: ldiData.coverage,
      flags
    };
  });

  // Filter minSample
  const filtered = minSample > 0 ? items.filter(it => it.n >= minSample) : items;

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'sustain12') return b.sustain12 - a.sustain12;
    if (sortBy === 'progression12') return b.progression12 - a.progression12;
    if (sortBy === 'trainees') return b.n - a.n;
    // default ldi
    const aVal = a.ldi != null ? a.ldi : -1;
    const bVal = b.ldi != null ? b.ldi : -1;
    return bVal - aVal;
  });

  return {
    items: filtered,
    state_average: {
      ldi: stateLdi.ldi,
      sustain12: stateLdi.sustain12,
      progression12: stateLdi.progression12
    }
  };
}

