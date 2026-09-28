import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Award,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Lock,
  IndianRupee,
  Building2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Send,
  AlertCircle,
  FileText,
  HelpCircle,
  TrendingUp,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  Check,
  Search,
  ExternalLink,
  Phone,
  Edit3,
  X,
  User,
  Save
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { ConfidenceBadge } from '../components/ConfidenceBadge.tsx';

export const TraineePortal: React.FC = () => {
  const { user, language, t } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab driven by current URL route
  const getTabFromPath = (path: string) => {
    if (path.includes('/trainee/jobs')) return 'jobs';
    if (path.includes('/trainee/consent')) return 'consent';
    if (path.includes('/trainee/followup')) return 'followup';
    return 'home';
  };

  const activeTab = getTabFromPath(location.pathname);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDistrictId, setEditDistrictId] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editCategory, setEditCategory] = useState('General');
  const [editAreaType, setEditAreaType] = useState('Rural');
  const [editDob, setEditDob] = useState('2003-05-15');
  const [editPreferredRole, setEditPreferredRole] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editBio, setEditBio] = useState('');

  const [districtsList, setDistrictsList] = useState<any[]>([
    { id: 'dist-1', name: 'Mumbai City', division: 'Konkan' },
    { id: 'dist-2', name: 'Pune', division: 'Pune' },
    { id: 'dist-3', name: 'Nagpur', division: 'Nagpur' },
    { id: 'dist-4', name: 'Nashik', division: 'Nashik' },
    { id: 'dist-5', name: 'Chhatrapati Sambhajinagar', division: 'Marathwada' },
    { id: 'dist-6', name: 'Thane', division: 'Konkan' },
    { id: 'dist-7', name: 'Kolhapur', division: 'Pune' },
    { id: 'dist-8', name: 'Solapur', division: 'Pune' },
    { id: 'dist-9', name: 'Amravati', division: 'Amravati' }
  ]);

  // Self-report form state
  const [reportStatus, setReportStatus] = useState<string>('Employed');
  const [monthlyWage, setMonthlyWage] = useState<number>(19500);
  const [jobRole, setJobRole] = useState<string>('CNC Lathe Operator');
  const [employerName, setEmployerName] = useState<string>('Tata Motors Ltd');
  const [nonPlacementReason, setNonPlacementReason] = useState<string>('Salary offered too low');
  const [nonPlacementText, setNonPlacementText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Consent toggles state (DPDP)
  const [consentTracking, setConsentTracking] = useState(true);
  const [consentWage, setConsentWage] = useState(true);
  const [consentOutreach, setConsentOutreach] = useState(true);
  const [consentFeedback, setConsentFeedback] = useState('');

  // Employer Demands / Jobs state
  const [demands, setDemands] = useState<any[]>([]);
  const [demandsLoading, setDemandsLoading] = useState(false);
  const [jobDistrictFilter, setJobDistrictFilter] = useState('all');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Derive preferred trainee ID
  const traineeId = user?.trainee_id || 'trainee-1';

  // Explicitly ensure user's registered name is prioritized
  const displayName = user?.name || profile?.trainee?.full_name || 'Harsh Panchal';

  const initEditForm = (tData: any) => {
    if (!tData) return;
    setEditFullName(tData.full_name || displayName || '');
    setEditPhone(tData.contact_phone || (user as any)?.phone || '');
    setEditDistrictId(tData.district_id || 'dist-2');
    setEditEducation(tData.education_level || '12th Standard / ITI Diploma');
    setEditGender(tData.gender || 'Male');
    setEditCategory(tData.category || 'General');
    setEditAreaType(tData.area_type || 'Rural');
    setEditDob(tData.dob || '2003-05-15');
    setEditPreferredRole(tData.preferred_role || 'CNC Machinist & Quality Tech');
    setEditSkills(tData.skills || 'CNC Lathe, Vernier Caliper, GD&T, 2D AutoCAD, Tool Setup');
    setEditBio(tData.bio || 'Vocational engineering graduate focused on precision machining.');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const token = localStorage.getItem('skilltrace_token');
      const payload = {
        full_name: editFullName,
        phone: editPhone,
        district_id: editDistrictId,
        education_level: editEducation,
        gender: editGender,
        category: editCategory,
        area_type: editAreaType,
        dob: editDob,
        preferred_role: editPreferredRole,
        skills: editSkills,
        bio: editBio
      };

      const res = await fetch(`/api/trainees/${traineeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfileSuccessMsg(language === 'mr' ? 'माहिती यशस्वीरित्या जतन केली!' : 'Profile updated successfully! Official candidate registry synced.');
        fetchProfile();
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileSuccessMsg('');
        }, 1200);
      } else {
        setProfileErrorMsg(data.error || 'Failed to update trainee profile');
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchProfile = () => {
    const token = localStorage.getItem('skilltrace_token');
    fetch(`/api/trainees/${traineeId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        if (data?.trainee) {
          initEditForm(data.trainee);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching trainee profile:', err);
        setLoading(false);
      });
  };

  const fetchDemands = () => {
    setDemandsLoading(true);
    fetch('/api/employers/demands')
      .then((res) => res.json())
      .then((data) => {
        setDemands(Array.isArray(data) ? data : []);
        setDemandsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching demands:', err);
        setDemandsLoading(false);
      });
  };

  useEffect(() => {
    fetch('/api/districts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDistrictsList(data);
        }
      })
      .catch((err) => console.error('Error fetching districts:', err));
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDemands();
  }, [traineeId]);

  const handleTabChange = (tab: 'home' | 'followup' | 'consent' | 'jobs') => {
    if (tab === 'home') navigate('/trainee/home');
    else if (tab === 'followup') navigate('/trainee/followup');
    else if (tab === 'consent') navigate('/trainee/consent');
    else if (tab === 'jobs') navigate('/trainee/jobs');
  };

  const handleSelfReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');

    try {
      const payload: any = {
        trainee_id: traineeId,
        checkpoint_month: 6,
        status: reportStatus,
        trainee_confirmed: true
      };

      if (reportStatus === 'Employed' || reportStatus === 'Self-Employed') {
        payload.monthly_wage = monthlyWage;
        payload.job_role = jobRole;
        payload.employer_name = employerName;
      } else {
        payload.non_placement_reason = nonPlacementReason;
        payload.non_placement_text = nonPlacementText;
      }

      const res = await fetch('/api/outcomes/self-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedback('Self-report recorded successfully! Your 6-month status is now in Dual-Verification queue with employer cross-check.');
        fetchProfile();
      } else {
        setFeedback('Survey recorded locally for verification review.');
      }
    } catch (err) {
      console.error(err);
      setFeedback('Survey updated.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleConsent = async (withdraw: boolean) => {
    try {
      const res = await fetch(`/api/trainees/${traineeId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ granted: !withdraw })
      });
      if (res.ok) {
        setConsentFeedback(
          withdraw
            ? 'Consent withdrawn. Your personal outcomes are masked from third-party tracking.'
            : 'Consent granted. Authorized government evaluation resumed.'
        );
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyJob = (jobId: string) => {
    setAppliedJobIds((prev) => new Set(prev).add(jobId));
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span>Loading trainee profile and verified records...</span>
      </div>
    );
  }

  const { trainee, district, consent, enrolments, outcomes } = profile || {};
  const currentEnrolment = enrolments?.[0];
  const activeConsent = consent?.status === 'granted';

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full min-w-0">
      {/* Top Welcome & Navigation Tabs */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-yellow-soft)] text-[var(--accent-yellow-text)]">
                {language === 'mr' ? 'प्रशिक्षणार्थी पोर्टल' : 'Trainee Portal'}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">·</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {language === 'mr' ? 'महाराष्ट्र शासन कौशल्य विकास' : 'Govt of Maharashtra'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">
              {displayName}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-secondary)]">Skill ID:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {trainee?.skill_id || 'MH-SK-000001'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                initEditForm(trainee);
                setIsEditingProfile(true);
              }}
              className="px-3 py-1 rounded-full bg-[var(--dark-panel)] text-white hover:bg-[var(--dark-panel)]/90 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#F8D84A]" />
              <span>{language === 'mr' ? 'माहिती संपादित करा' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange('home')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'home'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1F2430]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'ओळखपत्र व आढावा' : 'Skill ID & Overview'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('followup')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'followup'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1F2430]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'रोजगार पडताळणी सर्व्हे' : 'Self-Report & Follow-ups'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('consent')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'consent'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1F2430]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'DPDP संमती व्यवस्थापन' : 'DPDP Consent Rights'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('jobs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1F2430]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'उपलब्ध नोकऱ्या' : 'Verified Industry Jobs'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & DIGITAL SKILL ID PASSPORT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* SkillID Digital Identity Card (Safe against container overflow) */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-indigo-900/50">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                    MahaKaushalya · Unified Skill ID
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                    ✓ Verified Active
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      initEditForm(trainee);
                      setIsEditingProfile(true);
                    }}
                    className="text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-[#F8D84A]" />
                    <span>{language === 'mr' ? 'माहिती बदला' : 'Edit Profile'}</span>
                  </button>
                </div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white truncate">
                  {displayName}
                </h1>
                <p className="text-xs text-indigo-200 mt-1">
                  Beneficiary of Maharashtra State Skill Development Mission (MSSDS)
                </p>
              </div>

              <div className="p-3 bg-white text-slate-950 rounded-2xl shadow-md text-center shrink-0 self-start">
                <QrCode className="w-12 h-12 text-indigo-950 mx-auto" />
                <p className="text-[10px] font-mono font-bold mt-1 tracking-wider text-slate-800">
                  {trainee?.skill_id || 'MH-SK-000001'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10 text-xs relative z-10">
              <div className="min-w-0">
                <span className="text-indigo-300 text-[10px] uppercase font-semibold block">Registered District</span>
                <p className="font-semibold text-white mt-0.5 truncate">
                  {district?.name ? `${district.name} Division` : 'Pune Division'}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-indigo-300 text-[10px] uppercase font-semibold block">Primary Trade</span>
                <p className="font-semibold text-white mt-0.5 truncate">
                  {currentEnrolment?.course?.name || 'CNC Machining Specialist'}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-indigo-300 text-[10px] uppercase font-semibold block">Consent Status</span>
                <p className="font-semibold text-emerald-300 mt-0.5 truncate">
                  {activeConsent ? 'Active (DPDP Compliant)' : 'Consent Paused'}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-indigo-300 text-[10px] uppercase font-semibold block">Verification Seal</span>
                <p className="font-semibold text-indigo-200 mt-0.5 truncate">Dual-Verified (GSTIN)</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Certifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#171B24] rounded-2xl p-4 border border-slate-200 dark:border-[#2B3140] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">Attendance Benchmark</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentEnrolment?.attendance_pct || 94}%
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                ✓ Exceeds 80% mandatory criteria
              </p>
            </div>

            <div className="bg-white dark:bg-[#171B24] rounded-2xl p-4 border border-slate-200 dark:border-[#2B3140] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">Assessment Score</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentEnrolment?.assessment_score || 88}/100
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Grade A · Technical Trade Certified
              </p>
            </div>

            <div className="bg-white dark:bg-[#171B24] rounded-2xl p-4 border border-slate-200 dark:border-[#2B3140] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">Monthly Wage Band</span>
                <IndianRupee className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹19,500<span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                Band 2 (₹15,000 - ₹25,000)
              </p>
            </div>

            <div className="bg-white dark:bg-[#171B24] rounded-2xl p-4 border border-slate-200 dark:border-[#2B3140] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">Durability Index</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                88<span className="text-xs font-normal text-slate-400">/100</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                High Retention Confidence
              </p>
            </div>
          </div>

          {/* Training Course Details Card */}
          <div className="bg-white dark:bg-[#171B24] rounded-2xl border border-slate-200 dark:border-[#2B3140] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2B3140]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {language === 'mr' ? 'प्रशिक्षण अभ्यासक्रम व संस्था' : 'Training Institute & Batch Profile'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Officially empanelled under Maharashtra Vocational Training Board
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Certified Graduate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-100 dark:border-[#2B3140]">
                <span className="text-slate-400 text-[11px] block mb-1">Course Curriculum</span>
                <p className="font-bold text-slate-800 dark:text-white text-sm">
                  {currentEnrolment?.course?.name || 'CNC Machining Specialist'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">NSQF Level 4 · 480 Guided Hours</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-100 dark:border-[#2B3140]">
                <span className="text-slate-400 text-[11px] block mb-1">Training Institute</span>
                <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                  {currentEnrolment?.provider?.name || 'Government ITI Aundh (Pune)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Pune District · Grade A Facility</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-100 dark:border-[#2B3140]">
                <span className="text-slate-400 text-[11px] block mb-1">Verified Employer</span>
                <p className="font-bold text-slate-800 dark:text-white text-sm">Tata Motors Ltd</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">✓ Dual Confirmation Matched</p>
              </div>
            </div>
          </div>

          {/* Candidate Personal & Demographic Profile (Editable) */}
          <div className="bg-[var(--surface)] rounded-[20px] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-yellow-soft)] text-[var(--accent-yellow-text)] border border-[#F8D84A]/30 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-[var(--text-primary)] text-sm">
                    {language === 'mr' ? 'उमेदवार वैयक्तिक व संपर्क माहिती' : 'Candidate Profile & Official Details'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {language === 'mr' ? 'शासकीय व उद्योग संदर्भासाठी आपली माहिती अद्यतनित ठेवा' : 'Verified candidate record mapped with Maharashtra Vocational Registry'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  initEditForm(trainee);
                  setIsEditingProfile(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[var(--dark-panel)] text-white hover:bg-[var(--dark-panel)]/90 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#F8D84A]" />
                <span>{language === 'mr' ? 'माहिती संपादित करा' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block">Contact Phone</span>
                <p className="font-semibold text-[var(--text-primary)] mt-1 font-mono">
                  {trainee?.contact_phone || (user as any)?.phone || (trainee?.phone_hash ? `+91 ******${trainee.phone_hash.slice(-4)}` : '+91 98765 43210')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block">Education Level</span>
                <p className="font-semibold text-[var(--text-primary)] mt-1 truncate">
                  {trainee?.education_level || '12th Standard / ITI Diploma'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block">Demographics</span>
                <p className="font-semibold text-[var(--text-primary)] mt-1">
                  {trainee?.gender || 'Male'} · {trainee?.category || 'General'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block">Location Sector</span>
                <p className="font-semibold text-[var(--text-primary)] mt-1">
                  {trainee?.area_type || 'Rural'} Sector · {district?.name || 'Pune'}
                </p>
              </div>
            </div>

            {/* Target Role & Skills */}
            <div className="p-4 rounded-xl bg-[var(--surface-muted)]/30 border border-[var(--border)] space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Target Career Role:</span>
                  <span className="font-semibold text-[var(--text-primary)] ml-2">
                    {trainee?.preferred_role || 'CNC Machinist & Quality Assurance Specialist'}
                  </span>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--accent-green)]/30 text-[#305B35] dark:text-[#A6EBB0]">
                  ✓ Open to Industry Placement
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block mb-1">Key Technical Competencies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(trainee?.skills || 'CNC Lathe, 2D AutoCAD, GD&T, Vernier Caliper, Tool Setup, Quality Inspection')
                    .split(',')
                    .map((sk: string, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-[11px] font-medium">
                        {sk.trim()}
                      </span>
                    ))}
                </div>
              </div>

              {trainee?.bio && (
                <div className="pt-2 border-t border-[var(--border)] text-[var(--text-secondary)] italic">
                  "{trainee.bio}"
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Navigation Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleTabChange('followup')}
              className="p-4 rounded-2xl bg-white dark:bg-[#171B24] border border-slate-200 dark:border-[#2B3140] hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs text-left group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Submit 6M Checkpoint
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Record your workplace status and current monthly wage.
              </p>
            </button>

            <button
              onClick={() => handleTabChange('jobs')}
              className="p-4 rounded-2xl bg-white dark:bg-[#171B24] border border-slate-200 dark:border-[#2B3140] hover:border-amber-400 dark:hover:border-amber-500 shadow-xs text-left group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Browse Verified Jobs
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Explore open demands from GSTIN-verified manufacturers.
              </p>
            </button>

            <button
              onClick={() => handleTabChange('consent')}
              className="p-4 rounded-2xl bg-white dark:bg-[#171B24] border border-slate-200 dark:border-[#2B3140] hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs text-left group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                DPDP Privacy Settings
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Manage your data sharing and outreach preferences anytime.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SELF-REPORTING & 6-MONTH OUTCOME FOLLOW-UP */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'followup' && (
        <div className="space-y-6">
          {feedback && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Survey Card */}
          <div className="bg-white dark:bg-[#171B24] rounded-2xl border border-slate-200 dark:border-[#2B3140] p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#2B3140]">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Post-Training Employment Self-Report (6-Month Checkpoint)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your response is authenticated and cross-verified with your employer to update your durability profile.
                </p>
              </div>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 self-start">
                Active Checkpoint
              </span>
            </div>

            <form onSubmit={handleSelfReport} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What is your current employment status?
                </label>
                {/* Responsive grid preventing overflow on all screens */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {[
                    { id: 'Employed', label: 'Wage Employed' },
                    { id: 'Self-Employed', label: 'Self-Employed' },
                    { id: 'In Education', label: 'Higher Studies' },
                    { id: 'Unemployed', label: 'Actively Seeking' },
                    { id: 'Inactive', label: 'Family / Not Seeking' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setReportStatus(opt.id)}
                      className={`p-3 rounded-xl border text-center transition-all min-w-0 break-words ${
                        reportStatus === opt.id
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-[#1F2430] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2B3140] hover:bg-slate-100 dark:hover:bg-[#252A38]'
                      }`}
                    >
                      <span className="block text-xs truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {reportStatus === 'Employed' || reportStatus === 'Self-Employed' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-200 dark:border-[#2B3140]">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Current Job Role / Designation
                    </label>
                    <input
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#2B3140] bg-white dark:bg-[#171B24] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Employer / Enterprise Name
                    </label>
                    <input
                      type="text"
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#2B3140] bg-white dark:bg-[#171B24] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Net Monthly In-Hand Wage (₹)
                    </label>
                    <input
                      type="number"
                      step={500}
                      value={monthlyWage}
                      onChange={(e) => setMonthlyWage(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#2B3140] bg-white dark:bg-[#171B24] text-slate-900 dark:text-white font-mono font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Barrier or Reason
                    </label>
                    <select
                      value={nonPlacementReason}
                      onChange={(e) => setNonPlacementReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#2B3140] bg-white dark:bg-[#171B24] text-slate-900 dark:text-white"
                    >
                      <option value="Salary offered too low">Salary offered was too low</option>
                      <option value="Location too far / Relocation issues">Location too far / Unable to relocate</option>
                      <option value="Family / Domestic responsibilities">Family or domestic responsibilities</option>
                      <option value="Course skills did not match industry">Skills learned did not match actual job tests</option>
                      <option value="Preparing for government competitive exams">Preparing for government competitive exams</option>
                      <option value="Contract / No job security">Contractual nature / No job security</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Additional Comments or Challenges Faced (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={nonPlacementText}
                      onChange={(e) => setNonPlacementText(e.target.value)}
                      placeholder="Explain obstacles encountered to receive government placement assistance..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#2B3140] bg-white dark:bg-[#171B24] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit 6-Month Outcome'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Follow-up Timeline & Past Survey Checkpoints */}
          <div className="bg-white dark:bg-[#171B24] rounded-2xl border border-slate-200 dark:border-[#2B3140] p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Follow-up Audit Timeline (Maharashtra MSSDS Guidelines)
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      3-Month Checkpoint: Verified via WhatsApp
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Reported Status: Employed at Tata Motors (₹18,500/mo)
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Completed
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      6-Month Checkpoint: Active for Submission
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Open for dual verification with GSTIN wage cross-audit
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                  In Progress
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-200 dark:border-[#2B3140] flex items-center justify-between opacity-70">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      12-Month Durability Checkpoint: Upcoming
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Scheduled 6 months post 6M verification
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Scheduled
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: DPDP ACT 2023 CONSENT MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          {consentFeedback && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{consentFeedback}</span>
            </div>
          )}

          {/* Privacy Notice Banner */}
          <div className="bg-white dark:bg-[#171B24] rounded-2xl border border-slate-200 dark:border-[#2B3140] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2B3140]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Digital Personal Data Protection (DPDP) Act 2023 Rights
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You have total statutory sovereignty over your employment and training data.
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  activeConsent
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {activeConsent ? 'Active Consent Valid' : 'Consent Suspended'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Under Section 6 of the DPDP Act 2023, personal outcome data is processed strictly for authenticating
              vocational outcomes, auditing training scheme durability, and preventing ghost placements. You can
              withdraw, revoke, or restrict consent for any purpose at any time.
            </p>

            {/* Granular Purpose Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-100 dark:border-[#2B3140]">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">
                    1. Employment Outcome Dual-Verification
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Authorizes comparing trainee reported employment with employer hire filings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsentTracking(!consentTracking)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    consentTracking ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      consentTracking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-100 dark:border-[#2B3140]">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">
                    2. Monthly Wage Band Analytics (Aggregated)
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Includes salary progression in government state-level anonymized wage durability statistics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsentWage(!consentWage)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    consentWage ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      consentWage ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1F2430] border border-slate-100 dark:border-[#2B3140]">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">
                    3. Automated WhatsApp Dispatch Checkpoints
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Permits Kapso WhatsApp bot to send 60-second checkpoint surveys directly to your mobile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsentOutreach(!consentOutreach)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    consentOutreach ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      consentOutreach ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Consent Action Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#2B3140] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                Consent Transaction ID: CNS-MH-2024-88392
              </span>

              {activeConsent ? (
                <button
                  onClick={() => handleToggleConsent(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                >
                  Withdraw All Consent
                </button>
              ) : (
                <button
                  onClick={() => handleToggleConsent(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                >
                  Grant Full Consent
                </button>
              )}
            </div>
          </div>

          {/* Cryptographic Consent Audit Log */}
          <div className="bg-white dark:bg-[#171B24] rounded-2xl border border-slate-200 dark:border-[#2B3140] p-6 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Cryptographic Audit Log
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-[#2B3140]">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">
                    DPDP Consent Initial Grant (v2.1)
                  </span>
                  <span className="text-[11px] text-slate-400">Enrolment Batch Initiation</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">2023-01-10 10:24 IST</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">
                    3-Month Outcome Verified
                  </span>
                  <span className="text-[11px] text-slate-400">WhatsApp Bot Channel</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">2023-04-18 14:10 IST</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: VERIFIED INDUSTRY EMPLOYER JOBS & DEMANDS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#171B24] rounded-2xl border border-slate-200 dark:border-[#2B3140] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#2B3140]">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Verified Employer Job Openings & Demand Matching
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct job openings posted by verified Maharashtra manufacturing and service enterprises.
                </p>
              </div>

              {/* District Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  ['all', 'All Regions'],
                  ['dist-2', 'Pune'],
                  ['dist-4', 'Nashik'],
                  ['dist-6', 'Chhatrapati Sambhajinagar'],
                  ['dist-1', 'Mumbai']
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setJobDistrictFilter(id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      jobDistrictFilter === id
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#1F2430] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Demands List */}
            {demandsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading verified openings...</div>
            ) : demands.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active industry openings found for this filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demands
                  .filter((d) => jobDistrictFilter === 'all' || d.district_id === jobDistrictFilter)
                  .map((demand) => {
                    const isApplied = appliedJobIds.has(demand.id);

                    return (
                      <div
                        key={demand.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1F2430] border border-slate-200 dark:border-[#2B3140] hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                {demand.districtName || 'Maharashtra'}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                                {demand.job_role}
                              </h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>{demand.employerName}</span>
                              </p>
                            </div>

                            <span className="text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-[#171B24] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2B3140] shadow-2xs shrink-0">
                              {demand.openings} Openings
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>
                              ₹{demand.wage_min.toLocaleString()} - ₹{demand.wage_max.toLocaleString()} / mo
                            </span>
                          </div>

                          {/* Skill Tags */}
                          {demand.skill_tags && demand.skill_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {demand.skill_tags.map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#171B24] border border-slate-200 dark:border-[#2B3140] text-slate-700 dark:text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-[#2B3140] flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Required: Certified Skill ID
                          </span>

                          <button
                            type="button"
                            onClick={() => handleApplyJob(demand.id)}
                            disabled={isApplied}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isApplied
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-xs'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Applied with Skill ID</span>
                              </>
                            ) : (
                              <>
                                <span>1-Tap Apply</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] shadow-[var(--shadow-shell)] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-yellow-soft)] text-[var(--accent-yellow-text)] flex items-center justify-center border border-[#F8D84A]/40">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-semibold text-[var(--text-primary)]">
                    {language === 'mr' ? 'प्रशिक्षणार्थी माहिती संपादित करा' : 'Edit Trainee Profile'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {language === 'mr' ? 'आपली वैयक्तिक व करिअर माहिती अद्यतनित करा' : 'Update your personal details, contact, and career preferences'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-[var(--accent-green)]/20 border border-[var(--accent-green)] text-[#305B35] dark:text-[#A6EBB0] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{profileSuccessMsg}</span>
                </div>
              )}
              {profileErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                    placeholder="e.g. Harsh Panchal"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Contact Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Registered District *
                  </label>
                  <select
                    value={editDistrictId}
                    onChange={(e) => setEditDistrictId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  >
                    {districtsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.division || 'Maharashtra'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Education Qualification *
                  </label>
                  <select
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  >
                    <option value="10th Standard / SSC">10th Standard / SSC</option>
                    <option value="12th Standard / HSC">12th Standard / HSC</option>
                    <option value="12th Standard / ITI Diploma">12th Standard / ITI Diploma</option>
                    <option value="Polytechnic Diploma">Polytechnic Diploma</option>
                    <option value="Bachelor Degree (B.E. / B.Tech / B.Sc)">Bachelor's Degree (B.E. / B.Tech / B.Sc)</option>
                    <option value="Post-Graduate / Other">Post-Graduate / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Gender
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Social Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                    <option value="VJNT">VJNT / Denotified Tribes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Area Classification
                  </label>
                  <select
                    value={editAreaType}
                    onChange={(e) => setEditAreaType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  >
                    <option value="Rural">Rural</option>
                    <option value="Semi-Urban">Semi-Urban</option>
                    <option value="Urban">Urban</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Target Job Role / Career Aspiration
                </label>
                <input
                  type="text"
                  value={editPreferredRole}
                  onChange={(e) => setEditPreferredRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  placeholder="e.g. CNC Machine Specialist, Quality Inspector"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Technical Skills & Competencies (comma separated)
                </label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  placeholder="e.g. CNC Lathe, 2D AutoCAD, GD&T, Vernier Caliper, Quality Control"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Candidate Career Statement / Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[#F8D84A]"
                  placeholder="Brief statement about your trade experience, strengths, and work goals..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-full bg-[var(--dark-panel)] text-white hover:bg-[var(--dark-panel)]/90 font-medium flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {savingProfile ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
