import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import {
  ShieldCheck,
  GraduationCap,
  Building2,
  Building,
  User,
  Phone,
  Lock,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  defaultRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  defaultRole = 'government',
  onSuccess
}) => {
  const { loginWithCredentials, registerTrainee, loginAsRole, language, t } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Trainee registration form state (signup is restricted exclusively to trainees)
  const [traineeName, setTraineeName] = useState('');
  const [traineePhone, setTraineePhone] = useState('');
  const [traineeDistrict, setTraineeDistrict] = useState('dist-2'); // Pune
  const [traineeCourse, setTraineeCourse] = useState('CNC Machining Specialist');
  const [traineeEducation, setTraineeEducation] = useState('12th Standard / ITI Diploma');
  const [traineePassword, setTraineePassword] = useState('trainee123');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleConfigs: Record<
    UserRole,
    { title: string; subtitle: string; icon: any; demoEmail: string; color: string }
  > = {
    government: {
      title: language === 'mr' ? 'शासकीय अधिकारी' : 'Government Official',
      subtitle: language === 'mr' ? 'कौशल्य विकास विभाग, मंत्रालय' : 'Dept of Skills, Mantralaya',
      icon: ShieldCheck,
      demoEmail: 'official@skills.maharashtra.gov.in',
      color: 'blue'
    },
    provider: {
      title: language === 'mr' ? 'प्रशिक्षण संस्था' : 'Training Institute',
      subtitle: language === 'mr' ? 'सरकारी आयटीआय व खासगी संस्था' : 'Govt ITI & Private VTPs',
      icon: GraduationCap,
      demoEmail: 'director@pune-iti.edu',
      color: 'emerald'
    },
    employer: {
      title: language === 'mr' ? 'नोंदणीकृत नियोक्ता' : 'Verified Employer',
      subtitle: language === 'mr' ? 'उद्योग व कॉर्पोरेट भागीदार' : 'Industry & Corporate Partners',
      icon: Building2,
      demoEmail: 'hr@tatamotors.com',
      color: 'indigo'
    },
    trainee: {
      title: language === 'mr' ? 'प्रशिक्षणार्थी / तरुण' : 'Trainee / Youth',
      subtitle: language === 'mr' ? 'प्रमाणित उमेदवार' : 'Certified Vocational Candidates',
      icon: User,
      demoEmail: 'harsh.panchal@trainee.in',
      color: 'amber'
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setLoginEmail(roleConfigs[role].demoEmail);
    setLoginPassword('demo123');
    setLoginError(null);
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setLoginLoading(true);
    setLoginError(null);
    const success = await loginAsRole(role);
    setLoginLoading(false);
    if (success) {
      onSuccess?.();
      onClose();
    } else {
      setLoginError('Could not sign in with demo credentials.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const emailToUse = loginEmail || roleConfigs[selectedRole].demoEmail;
    const res = await loginWithCredentials(emailToUse, loginPassword || 'demo123');
    setLoginLoading(false);

    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setLoginError(res.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traineeName.trim()) {
      setSignupError('Please provide your full legal name.');
      return;
    }
    if (!traineePhone.trim()) {
      setSignupError('Please provide your active 10-digit mobile number.');
      return;
    }

    setSignupLoading(true);
    setSignupError(null);

    const res = await registerTrainee({
      full_name: traineeName,
      phone: traineePhone,
      password: traineePassword,
      district_id: traineeDistrict,
      course_name: traineeCourse,
      education_level: traineeEducation
    });

    setSignupLoading(false);
    if (res.success) {
      setSignupSuccess(`Account registered successfully! Welcome, ${traineeName.trim() || 'Harsh Panchal'}. Provisioning your unified Skill ID...`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        navigate('/trainee/home');
      }, 700);
    } else {
      setSignupError(res.error || 'Failed to complete registration. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[var(--surface)] text-[var(--text-primary)] rounded-[24px] border border-[var(--border)] shadow-[var(--shadow-shell)] overflow-hidden transition-all">
        {/* Top Header Banner */}
        <div className="relative bg-[var(--dark-panel)] px-6 py-5 text-white border-b border-[var(--border)]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 p-2 flex items-center justify-center shrink-0">
              <img src="/skilltrace-logo.svg" alt="SkillTrack" className="w-full h-full object-contain filter invert brightness-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF0A8] text-[#665400]">
                  {language === 'mr' ? 'महाराष्ट्र शासन' : 'Govt. of Maharashtra'}
                </span>
                <span className="text-[11px] text-white/70">DPDP Act 2023 Compliant</span>
              </div>
              <h2 className="text-lg font-normal mt-1 text-white tracking-tight">
                {mode === 'login'
                  ? language === 'mr' ? 'स्किलट्रॅक पोर्टल प्रवेश (सर्व वर्गवारी)' : 'Sign In to SkillTrack Maharashtra'
                  : language === 'mr' ? 'प्रशिक्षणार्थी नोंदणी (केवळ तरुणांसाठी)' : 'Trainee Registration (Sign Up)'}
              </h2>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex gap-2 mt-4 bg-white/10 p-1 rounded-full border border-white/15">
            <button
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-1.5 px-4 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white text-[#303030] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'लॉगिन करा (सर्व ४ भूमिका)' : 'Sign In (All 4 Categories)'}</span>
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setSignupError(null);
              }}
              className={`flex-1 py-1.5 px-4 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-[#F8D84A] text-[#303030] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'नोंदणी (केवळ प्रशिक्षणार्थी)' : 'Sign Up (Trainee Only)'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-7 space-y-6">
          {mode === 'login' ? (
            /* --- LOGIN MODE (ALL 4 CATEGORIES) --- */
            <div className="space-y-5">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                  {language === 'mr' ? 'आपली वर्गवारी / भूमिका निवडा:' : 'Select Your Role Category:'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['government', 'provider', 'employer', 'trainee'] as UserRole[]).map((r) => {
                    const cfg = roleConfigs[r];
                    const Icon = cfg.icon;
                    const isSelected = selectedRole === r;

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSelect(r)}
                        className={`p-3 rounded-[14px] border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#F8D84A] bg-[var(--surface-warm)] ring-1 ring-[#F8D84A]'
                            : 'border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-[#303030] text-white' : 'bg-[var(--border)] text-[var(--text-secondary)]'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && <CheckCircle className="w-4 h-4 text-[#665400] dark:text-[#F8D84A]" />}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[var(--text-primary)] leading-tight">
                            {cfg.title}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                            {cfg.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {loginError && (
                  <div className="p-3 rounded-[14px] bg-[var(--accent-rose)] border border-[var(--border)] flex items-center gap-2.5 text-xs text-[var(--accent-rose-text)]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    {language === 'mr' ? 'ईमेल किंवा नोंदणीकृत मोबाईल' : 'Official Email or Registered Phone'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={loginEmail || roleConfigs[selectedRole].demoEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={roleConfigs[selectedRole].demoEmail}
                      className="w-full pl-10 pr-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {language === 'mr' ? 'पासवर्ड' : 'Password'}
                    </label>
                    <span className="text-[10px] text-[var(--text-muted)]">Default demo: demo123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      value={loginPassword || 'demo123'}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#F8D84A] hover:bg-[#F5CE2B] disabled:opacity-50 text-[#303030] font-medium text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <div className="w-4 h-4 border-2 border-[#303030] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{language === 'mr' ? 'प्रवेश करा' : 'Sign In as'} {roleConfigs[selectedRole].title}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* 1-Click Instant Demo Access */}
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(selectedRole)}
                    className="py-2.5 px-4 rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-warm)] text-[var(--text-primary)] font-medium text-xs border border-[var(--border)] transition-all flex items-center gap-1.5"
                    title="Bypass password with verified test account"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F8D84A]" />
                    <span>Quick Demo</span>
                  </button>
                </div>
              </form>

              {/* Trainee Signup Promotion Notice */}
              <div className="pt-3 border-t border-[var(--border)] text-center">
                <p className="text-xs text-[var(--text-secondary)]">
                  {language === 'mr' ? 'नवीन प्रशिक्षणार्थी आहात?' : 'Are you a newly certified trainee in Maharashtra?'}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-medium text-[var(--text-primary)] underline ml-1"
                  >
                    {language === 'mr' ? 'येथे मोफत नोंदणी करा' : 'Register your Trainee Account here'}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* --- SIGNUP MODE (RESTRICTED TO TRAINEES ONLY) --- */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 rounded-[14px] bg-[var(--accent-rose)] border border-[var(--border)] flex items-center gap-2.5 text-xs text-[var(--accent-rose-text)]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 rounded-[14px] bg-[var(--accent-green)] border border-[var(--border)] flex items-center gap-2.5 text-xs text-[var(--accent-green-text)]">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    {language === 'mr' ? 'पूर्ण नाव (आधार प्रमाणे)' : 'Full Name (As on Aadhaar)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={traineeName}
                    onChange={(e) => setTraineeName(e.target.value)}
                    placeholder="e.g. Ramesh Shankar Jadhav"
                    className="w-full px-3.5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    {language === 'mr' ? 'मोबाईल क्रमांक (व्हॉट्सअ‍ॅप)' : 'WhatsApp / Mobile Number'} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-2.5 text-[var(--text-muted)]" />
                    <input
                      type="tel"
                      required
                      value={traineePhone}
                      onChange={(e) => setTraineePhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3.5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    {language === 'mr' ? 'जिल्हा (महाराष्ट्र)' : 'District (Maharashtra)'}
                  </label>
                  <select
                    value={traineeDistrict}
                    onChange={(e) => setTraineeDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  >
                    <option value="dist-2">Pune (पुणे)</option>
                    <option value="dist-1">Mumbai Suburban (मुंबई उपनगर)</option>
                    <option value="dist-3">Nagpur (नागपूर)</option>
                    <option value="dist-4">Nashik (नाशिक)</option>
                    <option value="dist-5">Chhatrapati Sambhajinagar</option>
                    <option value="dist-6">Kolhapur (कोल्हापूर)</option>
                    <option value="dist-7">Solapur (सोलापूर)</option>
                    <option value="dist-8">Gadchiroli (गडचिरोली)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    {language === 'mr' ? 'अभ्यासक्रम / ट्रेड' : 'Certified Trade / Course'}
                  </label>
                  <select
                    value={traineeCourse}
                    onChange={(e) => setTraineeCourse(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  >
                    <option value="CNC Machining Specialist">CNC Machining Specialist</option>
                    <option value="Solar PV Installation & Maintenance">Solar PV Installation & Maintenance</option>
                    <option value="Automotive Assembly Line Technician">Automotive Assembly Line Technician</option>
                    <option value="Healthcare Nursing Assistant">Healthcare Nursing Assistant</option>
                    <option value="Electric Vehicle Battery Tech">Electric Vehicle Battery Tech</option>
                    <option value="Tally & GST Accounts Executive">Tally & GST Accounts Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    {language === 'mr' ? 'शिक्षण पात्रता' : 'Education Level'}
                  </label>
                  <select
                    value={traineeEducation}
                    onChange={(e) => setTraineeEducation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  >
                    <option value="10th Standard / SSC">10th Standard / SSC</option>
                    <option value="12th Standard / ITI Diploma">12th Standard / ITI Diploma</option>
                    <option value="Polytechnic Diploma">Polytechnic Diploma</option>
                    <option value="Graduate Degree">Graduate Degree (BA/BSc/BCom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    {language === 'mr' ? 'पासवर्ड तयार करा' : 'Create Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={traineePassword}
                    onChange={(e) => setTraineePassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-2.5 px-4 rounded-full bg-[#F8D84A] hover:bg-[#F5CE2B] disabled:opacity-50 text-[#303030] font-medium text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  {signupLoading ? (
                    <div className="w-4 h-4 border-2 border-[#303030] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{language === 'mr' ? 'प्रशिक्षणार्थी खाते नोंदवा' : 'Register My Trainee Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-[var(--border)] text-center">
                <p className="text-xs text-[var(--text-secondary)]">
                  {language === 'mr' ? 'आधीच खाते आहे का?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium text-[var(--text-primary)] underline ml-1"
                  >
                    {language === 'mr' ? 'येथे लॉगिन करा' : 'Sign In with your credentials'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
