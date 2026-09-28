export type UserRole = 'government' | 'provider' | 'employer' | 'trainee';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  provider_id?: string;
  employer_id?: string;
  trainee_id?: string;
  language: 'en' | 'mr';
}

export interface District {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export interface Provider {
  id: string;
  name: string;
  code?: string;
  district_id: string;
  type: 'ITI' | 'PMKVY Centre' | 'NSDC Partner' | 'Private Training Partner';
  registered_on: string;
  contact_email: string;
}

export interface Course {
  id: string;
  name: string;
  sector: string;
  duration_weeks: number;
  nsqf_level: number;
  cost_per_trainee: number;
  skills_taught: string[];
}

export interface Batch {
  id: string;
  course_id: string;
  provider_id: string;
  batch_code: string;
  start_date: string;
  end_date: string;
  capacity: number;
}

export interface Trainee {
  id: string;
  skill_id: string;
  full_name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  disability: boolean;
  area_type: 'Rural' | 'Urban';
  district_id: string;
  phone_hash: string;
  aadhaar_last4_hash: string;
  education_level: string;
  created_on: string;
}

export interface ConsentPurposes {
  employment_tracking: boolean;
  wage_tracking: boolean;
  follow_up_contact: boolean;
}

export interface Consent {
  id: string;
  trainee_id: string;
  version: string;
  purposes: ConsentPurposes;
  status: 'granted' | 'withdrawn' | 'pending';
  granted_on?: string;
  withdrawn_on?: string;
}

export interface Enrolment {
  id: string;
  trainee_id: string;
  batch_id: string;
  attendance_pct: number;
  assessment_score: number;
  certified: boolean;
  certified_on?: string;
}

export interface Employer {
  id: string;
  name: string;
  gstin: string;
  udyam?: string;
  sector: string;
  district_id: string;
  verification_status: 'Verified' | 'Pending' | 'Flagged';
  registered_on: string;
}

export type OutcomeStatus =
  | 'Wage Employed'
  | 'Self-Employed'
  | 'Apprenticeship'
  | 'Further Study'
  | 'Unemployed'
  | 'Not Reachable';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface Outcome {
  id: string;
  trainee_id: string;
  enrolment_id: string;
  checkpoint_month: '3' | '6' | '12' | '18' | '24';
  status: OutcomeStatus;
  employer_id?: string;
  job_role?: string;
  monthly_wage?: number;
  still_employed?: boolean;
  left_reason?: string;
  business_type?: string;
  business_earnings?: number;
  persons_employed?: number;
  scheme_used?: string;
  stipend?: number;
  non_placement_reason?: string;
  non_placement_text?: string;
  income_is_band?: boolean;
  income_band_index?: number | null;
  satisfaction?: string;
  training_relevance?: string;
  skill_gaps?: string[];
  suggested_courses?: string[];
  career_goals?: string;
  biggest_challenge?: string;
  survey_channel?: 'WhatsApp-Kapso' | 'Web-Portal' | 'Assisted';
  phone_used?: string;
  trainee_confirmed: boolean;
  employer_confirmed: boolean;
  confidence: ConfidenceLevel;
  source: 'Self-Report' | 'Employer' | 'Provider-Assisted' | 'Auto-Follow-up';
  recorded_on: string;
}

export interface WhatsAppSurveyResponse {
  trainee_id?: string;
  phone: string;
  consent: boolean;
  employment_status: string;
  employer_name?: string;
  job_role?: string;
  salary_range?: string;
  job_satisfaction?: string;
  training_relevance?: string;
  skill_gaps?: string[];
  suggested_courses?: string[];
  career_goals?: string;
  biggest_challenge?: string;
}

export interface Followup {
  id: string;
  trainee_id: string;
  checkpoint_month: '3' | '6' | '12' | '18' | '24';
  channel: 'SMS/WhatsApp' | 'IVR' | 'Assisted';
  status:
    | 'Scheduled'
    | 'Sent'
    | 'Responded'
    | 'No Response'
    | 'Escalated to Assisted'
    | 'Not Reachable';
  attempts: number;
  scheduled_on: string;
  last_attempt_on?: string;
}

export interface EmployerDemand {
  id: string;
  employer_id: string;
  skill_tags: string[];
  job_role: string;
  openings: number;
  district_id: string;
  wage_min: number;
  wage_max: number;
  posted_on: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'High' | 'Medium' | 'Low';
  entity_type: 'provider' | 'district' | 'course';
  entity_id: string;
  message: string;
  suggested_action: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  created_on: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  timestamp: string;
}

export interface FilterParams {
  district?: string;
  sector?: string;
  provider?: string;
  gender?: string;
  category?: string;
  year?: string;
  includeUnverified?: boolean;
}

export interface SummaryMetrics {
  totalCertifiedConsented: number;
  placementRate: number;
  selfEmploymentRate: number;
  apprenticeshipRate: number;
  retention6m: number;
  retention12m: number;
  avgWage: number;
  wageGrowthPct: number;
  followupResponseRate: number;
  dataCompleteness: number;
  verifiedEmploymentRate12m: number;
  highConfidencePct: number;
  mediumConfidencePct: number;
  lowConfidencePct: number;
  publicValueRatio?: number;
  breakdown?: {
    wageEmployed: number;
    selfEmployed: number;
    apprenticeship: number;
    furtherStudy: number;
    unemployed: number;
    notReachable: number;
  };
}

export interface ProviderScorecard {
  provider: Provider;
  districtName: string;
  totalTrainees: number;
  placementRate: number;
  retention6m: number;
  avgWage: number;
  dataCompleteness: number;
  followupResponseRate: number;
  score: number;
  band: 'A' | 'B' | 'C' | 'Needs Improvement';
  rank: number;
}

export interface WageProgressionPoint {
  checkpoint: string;
  wage?: number;
  avgWage?: number;
  all?: number;
  itSector?: number;
  mfgSector?: number;
  targetWage?: number;
  count?: number;
}

export interface RetentionCurvePoint {
  checkpoint?: string;
  interval?: string;
  rate?: number;
  retention?: number;
  retentionPct?: number;
  targetPct?: number;
  count?: number;
}

export interface NonPlacementReasonStat {
  reason: string;
  count: number;
  percentage: number;
}

export interface SkillGapItem {
  skill: string;
  sector: string;
  curriculumCourse: string;
  employerDemandPct: number;
  taughtInCurriculum: boolean;
  gapScore: number;
  impactedTrainees: number;
  recommendation?: string;
  trade?: string;
  demandCount?: number;
  trainedCount?: number;
  deficitCount?: number;
  avgWageOffered?: number;
  topSkillsNeeded?: string[];
}

export interface AlertItem {
  id: string;
  type: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  entity_type: string;
  entity_id: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  triggered_on: string;
}

export interface CourseAnalyticsItem {
  id: string;
  courseName: string;
  code: string;
  sector: string;
  nsqfLevel: number;
  durationHours: number;
  completionRate: number;
  placementRate: number;
  avgWage: number;
}

export interface DistrictAnalyticsItem {
  districtId: string;
  districtName: string;
  region: string;
  isTribal: boolean;
  traineeCount: number;
  placementRate: number;
  retentionRate: number;
  femaleShare: number;
  avgWage: number;
}

export interface DemographicGapItem {
  segment: string;
  placementRate: number;
  retentionRate: number;
}

export interface PublicValueRatio {
  totalTrainees: number;
  placedCount: number;
  avgMonthlyWage: number;
  ratio: number;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  timestamp: string;
  details?: string;
}

// LDI & Durability Types
export type DurabilityState = 'Progressed' | 'Sustained' | 'Downgraded' | 'Exited' | 'Unknown' | 'NotDue';

export interface DurabilityPoint {
  month: number;
  retained: number;
  lower: number;
  upper: number;
  n: number;
  bestCase?: number;
  worstCase?: number;
}

export interface DurabilityCurveGroup {
  group: string;
  points: DurabilityPoint[];
  reliability: 'Reliable' | 'Low sample' | 'Insufficient';
  coverage: number;
  sampleSize: number;
  sustain12?: number;
  progression12?: number;
  ldi?: number | null;
  band?: string;
}

export interface DurabilityStatesCheckpoint {
  month: number;
  Progressed: number;
  Sustained: number;
  Downgraded: number;
  Exited: number;
  Unknown: number;
  total: number;
}

export interface LdiLeaderboardItem {
  rank: number;
  group: string;
  groupId?: string;
  providerType?: string;
  district?: string;
  ldi: number | null;
  band: 'A' | 'B' | 'C' | 'Needs attention' | 'Insufficient';
  adjustedRatio: number;
  shrunkRatio: number;
  sustain12: number;
  progression12: number;
  n: number;
  coverage: number;
  reliability: 'Reliable' | 'Low sample' | 'Insufficient';
}

export interface DurabilityAction {
  id: string;
  rule: 'Early drop-off' | 'Wage stagnation' | 'Downgrade cluster' | 'Late decay' | 'Data gap' | 'Replicate';
  title: string;
  evidence: string;
  recommendation: string;
  group: string;
  entity_type: 'provider' | 'course' | 'district';
  entity_id: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  triggered_on: string;
}

export interface ProviderDurabilityBenchmark {
  providerId: string;
  providerName: string;
  providerType: string;
  ldi: number | null;
  band: string;
  reliability: 'Reliable' | 'Low sample' | 'Insufficient';
  coverage: number;
  n: number;
  curve: DurabilityPoint[];
  states: DurabilityStatesCheckpoint[];
  actions: DurabilityAction[];
  benchmark: {
    stateAverageCurve: DurabilityPoint[];
    sameTypeMedianCurve: DurabilityPoint[];
    sameTypeQ1Curve: DurabilityPoint[];
    sameTypeQ3Curve: DurabilityPoint[];
    stateAvg12m: number;
    sameTypeMedian12m: number;
  };
  atRiskTrainees: {
    traineeId: string;
    fullName: string;
    skillId: string;
    courseName: string;
    batchCode: string;
    lastCheckpoint: number;
    state: DurabilityState;
    baselineWage: number;
    currentWage: number | null;
    status: OutcomeStatus;
    phoneHash: string;
  }[];
}

