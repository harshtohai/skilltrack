import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { UserRole } from '../types.ts';
import {
  ShieldCheck,
  GraduationCap,
  Building2,
  User,
  Phone,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';

interface AuthPageProps {
  defaultMode?: 'login' | 'signup';
  defaultRole?: UserRole;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  defaultMode = 'login',
  defaultRole = 'government'
}) => {
  const { loginWithCredentials, registerTrainee, loginAsRole, language, setLanguage } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.pathname === '/signup' ? 'signup' : defaultMode;
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('demo123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Trainee registration form state
  const [traineeName, setTraineeName] = useState('');
  const [traineePhone, setTraineePhone] = useState('');
  const [traineeDistrict, setTraineeDistrict] = useState('dist-2'); // Pune
  const [traineeCourse, setTraineeCourse] = useState('CNC Machining Specialist');
  const [traineeEducation, setTraineeEducation] = useState('12th Standard / ITI Diploma');
  const [traineePassword, setTraineePassword] = useState('trainee123');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const isMr = language === 'mr';

  const roleConfigs: Record<
    UserRole,
    { title: string; subtitle: string; icon: any; demoEmail: string; destination: string }
  > = {
    government: {
      title: isMr ? 'शासकीय अधिकारी' : 'Government Official',
      subtitle: isMr ? 'कौशल्य विकास विभाग, मंत्रालय' : 'Dept of Skills, Mantralaya',
      icon: ShieldCheck,
      demoEmail: 'official@skills.maharashtra.gov.in',
      destination: '/gov/dashboard'
    },
    provider: {
      title: isMr ? 'प्रशिक्षण संस्था' : 'Training Institute',
      subtitle: isMr ? 'सरकारी आयटीआय व खासगी संस्था' : 'Govt ITI & Private VTPs',
      icon: GraduationCap,
      demoEmail: 'director@pune-iti.edu',
      destination: '/provider/dashboard'
    },
    employer: {
      title: isMr ? 'नोंदणीकृत नियोक्ता' : 'Verified Employer',
      subtitle: isMr ? 'उद्योग व कॉर्पोरेट भागीदार' : 'Industry & Corporate Partners',
      icon: Building2,
      demoEmail: 'hr@tatamotors.com',
      destination: '/employer/dashboard'
    },
    trainee: {
      title: isMr ? 'प्रशिक्षणार्थी / तरुण' : 'Trainee / Youth',
      subtitle: isMr ? 'प्रमाणित उमेदवार' : 'Certified Vocational Candidates',
      icon: User,
      demoEmail: 'harsh.panchal@trainee.in',
      destination: '/trainee/home'
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setLoginEmail(roleConfigs[role].demoEmail);
    setLoginPassword('demo123');
    setLoginError(null);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    navigate(roleConfigs[role].destination);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const emailToUse = loginEmail.trim() || roleConfigs[selectedRole].demoEmail;
    const pwdToUse = loginPassword || 'demo123';

    try {
      const res = await loginWithCredentials(emailToUse, pwdToUse);
      if (res.success) {
        navigate(roleConfigs[selectedRole].destination);
      } else {
        setLoginError(res.error || (isMr ? 'अवैध लॉगिन माहिती.' : 'Invalid credentials.'));
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);
    setSignupSuccess(null);

    if (!traineeName.trim() || !traineePhone.trim()) {
      setSignupError(isMr ? 'कृपया सर्व आवश्यक माहिती भरा.' : 'Please enter all required fields.');
      setSignupLoading(false);
      return;
    }

    try {
      const res = await registerTrainee({
        full_name: traineeName.trim(),
        phone: traineePhone.trim(),
        district_id: traineeDistrict,
        course_name: traineeCourse,
        education_level: traineeEducation,
        password: traineePassword
      });

      if (res.success) {
        setSignupSuccess(
          isMr
            ? `नोंदणी यशस्वी! आपले प्रशिक्षणार्थी खाते सक्रिय झाले आहे.`
            : `Registration successful! Your trainee account is now active.`
        );
        setTimeout(() => {
          navigate('/trainee/home');
        }, 1000);
      } else {
        setSignupError(res.error || (isMr ? 'नोंदणी अयशस्वी.' : 'Registration failed.'));
      }
    } catch (err: any) {
      setSignupError(err?.message || 'Failed to complete registration');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col font-sans text-[var(--text-primary)]">
      {/* Navigation Bar */}
      <div className="border-b border-[var(--border)] px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[var(--surface)] transition-colors">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--dark-panel)] p-1.5 flex items-center justify-center shadow-2xs">
            <img
              src="/skilltrace-logo.svg"
              alt="SkillTrack Maharashtra"
              className="w-full h-full object-contain filter invert brightness-0"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-normal text-base text-[var(--text-primary)] tracking-tight">
                SkillTrack
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-yellow-soft)] text-[var(--accent-yellow-text)]">
                MahaKaushalya
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
              {isMr ? 'दीर्घकालीन रोजगार पडताळणी प्रणाली' : 'State Skilling & Retention Telemetry'}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isMr ? 'मुख्यपृष्ठ' : 'Home'}</span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center bg-[var(--surface-muted)] rounded-full p-0.5 border border-[var(--border)]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                language === 'en'
                  ? 'bg-[var(--dark-panel)] text-white shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                language === 'mr'
                  ? 'bg-[var(--dark-panel)] text-white shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              मराठी
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] border border-[var(--border)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#F8D84A]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#74767D]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-xl bg-[var(--surface)] text-[var(--text-primary)] rounded-[24px] border border-[var(--border)] shadow-[var(--shadow-shell)] overflow-hidden transition-all">
          {/* Card Top Banner */}
          <div className="bg-[var(--dark-panel)] text-white p-5 sm:p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF0A8] text-[#665400]">
                  {isMr ? 'महाराष्ट्र शासन' : 'Govt. of Maharashtra'}
                </span>
                <h1 className="text-xl font-normal mt-1 tracking-tight text-white">
                  {mode === 'login'
                    ? isMr ? 'स्किलट्रॅक पोर्टल प्रवेश' : 'Sign In to SkillTrack'
                    : isMr ? 'प्रशिक्षणार्थी नोंदणी' : 'Trainee Registration'}
                </h1>
                <p className="text-xs text-white/70 mt-0.5">
                  {mode === 'login'
                    ? isMr ? 'आपल्या अधिकृत भूमिकेनुसार प्रवेश करा' : 'Sign in according to your authorized institutional role'
                    : isMr ? 'नवीन प्रमाणित उमेदवारांसाठी मोफत नोंदणी' : 'Open registration for certified vocational youth'}
                </p>
              </div>

              {/* Quick Mode Toggle Pill */}
              <div className="flex bg-white/10 p-1 rounded-full border border-white/15">
                <button
                  onClick={() => {
                    setMode('login');
                    setLoginError(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    mode === 'login'
                      ? 'bg-white text-[#303030] shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {isMr ? 'लॉगिन' : 'Sign In'}
                </button>
                <button
                  onClick={() => {
                    setMode('signup');
                    setSignupError(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    mode === 'signup'
                      ? 'bg-[#F8D84A] text-[#303030] shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {isMr ? 'नोंदणी' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7 space-y-5">
            {mode === 'login' ? (
              /* --- LOGIN MODE --- */
              <div className="space-y-5">
                {/* Role Category Selector */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                    {isMr ? 'आपली वर्गवारी / भूमिका निवडा:' : 'Select Your Role Category:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-[#303030] text-white' : 'bg-[var(--border)] text-[var(--text-secondary)]'
                              }`}
                            >
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
                      {isMr ? 'ईमेल किंवा नोंदणीकृत मोबाईल' : 'Official Email or Registered Phone'}
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
                        {isMr ? 'पासवर्ड' : 'Password'}
                      </label>
                      <span className="text-[10px] text-[var(--text-muted)]">Default demo: demo123</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                      <input
                        type="password"
                        value={loginPassword}
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
                          <span>
                            {isMr ? 'प्रवेश करा' : 'Sign In as'} {roleConfigs[selectedRole].title}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {/* Quick 1-Click Demo Login */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin(selectedRole)}
                      className="py-2.5 px-4 rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-warm)] text-[var(--text-primary)] font-medium text-xs border border-[var(--border)] transition-all flex items-center gap-1.5"
                      title="Instant 1-Click Demo Login"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F8D84A]" />
                      <span>Quick Demo</span>
                    </button>
                  </div>
                </form>

                {/* Trainee Signup Promotion Notice */}
                <div className="pt-3 border-t border-[var(--border)] text-center">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isMr ? 'नवीन प्रशिक्षणार्थी आहात?' : 'Are you a newly certified trainee in Maharashtra?'}{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-medium text-[var(--text-primary)] underline ml-1"
                    >
                      {isMr ? 'येथे मोफत नोंदणी करा' : 'Register your Trainee Account here'}
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* --- SIGNUP MODE (TRAINEES ONLY) --- */
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      {isMr ? 'पूर्ण नाव (आधार प्रमाणे)' : 'Full Name (As on Aadhaar)'} *
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
                      {isMr ? 'मोबाईल क्रमांक (व्हॉट्सअ‍ॅप)' : 'WhatsApp / Mobile Number'} *
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
                      {isMr ? 'जिल्हा (महाराष्ट्र)' : 'District (Maharashtra)'}
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
                      {isMr ? 'अभ्यासक्रम / ट्रेड' : 'Certified Trade / Course'}
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
                      {isMr ? 'शिक्षण पात्रता' : 'Education Level'}
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
                      {isMr ? 'पासवर्ड तयार करा' : 'Create Password'}
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
                        <span>{isMr ? 'प्रशिक्षणार्थी खाते नोंदवा' : 'Register My Trainee Account'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-3 border-t border-[var(--border)] text-center">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isMr ? 'आधीच खाते आहे का?' : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-medium text-[var(--text-primary)] underline ml-1"
                    >
                      {isMr ? 'येथे लॉगिन करा' : 'Sign In with your credentials'}
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
