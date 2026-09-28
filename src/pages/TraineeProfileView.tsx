import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Calendar,
  Phone,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Save,
  User,
  MapPin
} from 'lucide-react';
import { ConfidenceBadge } from '../components/ConfidenceBadge.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';

export const TraineeProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const loadProfile = () => {
    if (!id) return;
    const token = localStorage.getItem('skilltrace_token');
    fetch(`/api/trainees/${id}`, {
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
        console.error(err);
        setLoading(false);
      });
  };

  const initEditForm = (t: any) => {
    if (!t) return;
    setEditFullName(t.full_name || '');
    setEditPhone(t.contact_phone || '');
    setEditDistrictId(t.district_id || 'dist-2');
    setEditEducation(t.education_level || '12th Standard / ITI Diploma');
    setEditGender(t.gender || 'Male');
    setEditCategory(t.category || 'General');
    setEditAreaType(t.area_type || 'Rural');
    setEditDob(t.dob || '2003-05-15');
    setEditPreferredRole(t.preferred_role || 'CNC Machinist & Quality Tech');
    setEditSkills(t.skills || 'CNC Lathe, Vernier Caliper, GD&T, 2D AutoCAD, Tool Setup');
    setEditBio(t.bio || 'Vocational engineering graduate focused on precision machining.');
  };

  useEffect(() => {
    loadProfile();
    fetch('/api/districts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDistrictsList(data);
      })
      .catch((e) => console.error(e));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

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

      const res = await fetch(`/api/trainees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Trainee profile updated successfully!');
        loadProfile();
        setTimeout(() => {
          setIsEditing(false);
          setSuccessMsg('');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to update trainee profile');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--text-secondary)] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--dark-panel)] border-t-transparent animate-spin" />
        <span>Loading trainee profile and longitudinal records...</span>
      </div>
    );
  }

  if (!profile || !profile.trainee) {
    return (
      <div className="py-12 text-center text-xs text-rose-500">
        Trainee record not found.
      </div>
    );
  }

  const { trainee, consent, enrolments, outcomes, district } = profile;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Trainees Directory</span>
      </button>

      {/* Trainee Master Card */}
      <div className="bg-[var(--surface)] rounded-[20px] border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--dark-panel)] text-white flex items-center justify-center font-bold text-xl font-display">
              {trainee.full_name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-[var(--text-primary)] font-display">
                  {trainee.full_name}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--accent-yellow-soft)] text-[var(--accent-yellow-text)] border border-[#F8D84A]/40">
                  {trainee.skill_id}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {district?.name} District, Maharashtra · Registered: {trainee.created_on}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                initEditForm(trainee);
                setIsEditing(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-[var(--dark-panel)] text-white hover:bg-[var(--dark-panel)]/90 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#F8D84A]" />
              <span>Edit Profile</span>
            </button>
            <div className="text-right">
              <StatusBadge status={consent?.status || 'pending'} />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">DPDP Consent {consent?.version || 'v2.1'}</p>
            </div>
          </div>
        </div>

        {/* Demographic Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
            <span className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold block">Gender &amp; Category</span>
            <p className="font-semibold text-[var(--text-primary)] mt-1">
              {trainee.gender} · {trainee.category}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
            <span className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold block">Area Classification</span>
            <p className="font-semibold text-[var(--text-primary)] mt-1">{trainee.area_type} Sector</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
            <span className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold block">Phone Identifier</span>
            <p className="font-mono text-[var(--text-primary)] mt-1">
              {trainee.contact_phone || (trainee.phone_hash ? `***-***-${trainee.phone_hash.slice(-4)}` : '+91 98765 43210')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]">
            <span className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold block">Education Level</span>
            <p className="font-semibold text-[var(--text-primary)] mt-1 truncate">
              {trainee.education_level || '12th Standard / ITI Diploma'}
            </p>
          </div>
        </div>

        {/* Career Preferences and Skills */}
        <div className="mt-4 p-4 rounded-xl bg-[var(--surface-warm)] border border-[#E7E5DC] text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Target Job Role:</span>
              <span className="font-semibold text-[var(--text-primary)] ml-2">
                {trainee.preferred_role || 'CNC Machine Specialist & Quality Assurance'}
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-green)]/30 text-[#305B35]">
              Active Profile
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block mb-1">Key Competencies &amp; Skills:</span>
            <div className="flex flex-wrap gap-1.5">
              {(trainee.skills || 'CNC Lathe, 2D AutoCAD, GD&T, Vernier Caliper, Tool Setup, Quality Inspection')
                .split(',')
                .map((sk: string, i: number) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-[11px] font-medium">
                    {sk.trim()}
                  </span>
                ))}
            </div>
          </div>

          {trainee.bio && (
            <p className="pt-2 border-t border-[var(--border)] text-[var(--text-secondary)] italic">
              "{trainee.bio}"
            </p>
          )}
        </div>
      </div>

      {/* Vocational Training Enrolment */}
      <div className="bg-[var(--surface)] rounded-[20px] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-3">
        <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          Vocational Training &amp; NSQF Certification
        </h3>

        {enrolments.map((enr: any) => (
          <div
            key={enr.id}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div>
              <h4 className="font-bold text-[var(--text-primary)] text-sm">{enr.course?.name || 'Vocational Trade'}</h4>
              <p className="text-[var(--text-secondary)] mt-0.5">
                Institute: <strong>{enr.provider?.name || 'State ITI'}</strong> · Batch:{' '}
                <span className="font-mono">{enr.batch?.batch_code}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Certified</span>
                <p className="text-[11px] text-[var(--text-muted)]">Score: {enr.assessment_score}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Longitudinal Outcomes Timeline (3, 6, 12 months) */}
      <div className="bg-[var(--surface)] rounded-[20px] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Longitudinal Post-Training Outcomes Timeline
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Dual-verified employment checkpoints at 3-Month, 6-Month, and 12-Month intervals.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {outcomes.map((o: any) => (
            <div
              key={o.id}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-200 transition-all shadow-2xs text-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)] font-mono">
                    {o.checkpoint_month}-Month Checkpoint
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <ConfidenceBadge confidence={o.confidence} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[var(--text-secondary)]">
                {o.job_role && (
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)]">Job Role / Designation</span>
                    <p className="font-semibold text-[var(--text-primary)]">{o.job_role}</p>
                  </div>
                )}
                {o.monthly_wage && (
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)]">Verified Monthly Wage</span>
                    <p className="font-mono font-bold text-[var(--text-primary)]">₹{o.monthly_wage.toLocaleString('en-IN')}</p>
                  </div>
                )}
                {o.employer && (
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)]">Employing Enterprise</span>
                    <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      {o.employer.name}
                    </p>
                  </div>
                )}
                {o.non_placement_reason && (
                  <div className="sm:col-span-3 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                    <span className="text-[10px] uppercase text-rose-600 font-bold">Reported Barrier:</span>
                    <p className="text-rose-950 dark:text-rose-300 font-medium">{o.non_placement_reason}</p>
                    {o.non_placement_text && (
                      <p className="text-[var(--text-secondary)] italic mt-0.5">"{o.non_placement_text}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* Dual verification indicator */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    {o.trainee_confirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                    Trainee Self-Report
                  </span>
                  <span className="flex items-center gap-1">
                    {o.employer_confirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                    Employer Confirmation
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">Recorded: {o.recorded_on}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
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
                    Edit Trainee Profile
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Update personal identity, district allocation, and vocational details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {successMsg && (
                <div className="p-3 rounded-xl bg-[var(--accent-green)]/20 border border-[var(--accent-green)] text-[#305B35] dark:text-[#A6EBB0] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
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
                    placeholder="e.g. Ramesh Patil"
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
                    Education Level *
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
                  Technical Skills &amp; Competencies (comma separated)
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
                  placeholder="Brief statement about vocational goals and achievements..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-[var(--dark-panel)] text-white hover:bg-[var(--dark-panel)]/90 font-medium flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {saving ? (
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
