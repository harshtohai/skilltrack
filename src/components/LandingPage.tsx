import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Building,
  TrendingUp,
  MessageCircle,
  FileCheck,
  Award,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  Building2,
  Users,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: (role?: any) => void;
  onOpenSignup: () => void;
  onOpenWhatsApp: () => void;
  onExploreDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenSignup,
  onOpenWhatsApp,
  onExploreDashboard
}) => {
  const { user, role, language, setLanguage, t, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isMr = language === 'mr';

  return (
    <div className="min-h-full flex flex-col font-sans text-[var(--text-primary)]">
      {/* Sub-header Navigation */}
      <div className="border-b border-[var(--border)] px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[var(--surface)] transition-colors">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onOpenLogin()}>
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
              {isMr ? 'दीर्घकालीन रोजगार पडताळणी प्रणाली' : 'Longitudinal Skilling & Retention Telemetry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher Pill */}
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

          {/* Theme Toggle Button */}
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

          {/* Direct Login & Sign Up or Dashboard & Logout Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onExploreDashboard}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[var(--dark-panel)] hover:bg-black text-white transition-colors shadow-2xs"
              >
                <span>{isMr ? 'डॅशबोर्डवर जा' : 'Go to Dashboard'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 transition-colors shadow-2xs"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isMr ? 'बाहेर पडा' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenLogin()}
                className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)] transition-colors shadow-2xs"
              >
                {isMr ? 'लॉगिन' : 'Sign In'}
              </button>
              <button
                onClick={onOpenSignup}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#F8D84A] hover:bg-[#F5CE2B] transition-colors shadow-2xs"
                style={{ color: '#000000' }}
              >
                <GraduationCap className="w-3.5 h-3.5" style={{ color: '#000000' }} />
                <span style={{ color: '#000000' }}>{isMr ? 'नोंदणी (Sign Up)' : 'Sign Up'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Greeting Section */}
      <section className="px-4 sm:px-8 py-10 sm:py-14 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-normal text-[var(--text-primary)] tracking-tight leading-[1.18]">
            {isMr ? (
              <>
                दीर्घकालीन रोजगार पडताळणी व{' '}
                <span className="border-b-2 border-[#F8D84A] pb-0.5">शाश्वत उपजीविका</span>{' '}
                मोजमाप
              </>
            ) : (
              <>
                Measuring Real Livelihoods, Verifying{' '}
                <span className="border-b-2 border-[#F8D84A] pb-0.5">Lifelong Skilling</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-normal leading-relaxed max-w-3xl">
            {t('landing_hero_subtitle')}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenSignup}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F8D84A] hover:bg-[#F5CE2B] font-medium text-xs sm:text-sm transition-colors shadow-2xs"
              style={{ color: '#000000' }}
            >
              <GraduationCap className="w-4 h-4" style={{ color: '#000000' }} />
              <span style={{ color: '#000000' }}>{isMr ? 'प्रशिक्षणार्थी नोंदणी (Sign Up)' : 'Trainee Registration (Sign Up)'}</span>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: '#000000' }} />
            </button>

            <button
              onClick={() => onOpenLogin()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--dark-panel)] hover:opacity-90 text-white font-medium text-xs sm:text-sm transition-opacity shadow-2xs"
            >
              <span>{isMr ? 'पोर्टल लॉगिन (Sign In)' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Grounded Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="p-3.5 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <span className="text-2xl sm:text-[28px] font-normal text-[var(--text-primary)] block tracking-tight">
                36
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block mt-0.5">
                {isMr ? 'सर्व जिल्हे कव्हर' : 'Districts Covered'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                Vidarbha, Marathwada & Western MH
              </span>
            </div>

            <div className="p-3.5 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <span className="text-2xl sm:text-[28px] font-normal text-[var(--text-primary)] block tracking-tight">
                14,800+
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block mt-0.5">
                {isMr ? 'प्रशिक्षणार्थी ट्रॅक' : 'Enrolled Trainees'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                Across 280+ Government ITIs & VTPs
              </span>
            </div>

            <div className="p-3.5 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <span className="text-2xl sm:text-[28px] font-normal text-[#305B35] dark:text-[#A6EBB0] block tracking-tight">
                82.4%
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block mt-0.5">
                {isMr ? '६-महिने रोजगार टिकाव' : '6M Verified Retention'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                Dual-verified with EPF & Employers
              </span>
            </div>

            <div className="p-3.5 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <span className="text-2xl sm:text-[28px] font-normal text-[var(--text-primary)] block tracking-tight">
                450+
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block mt-0.5">
                {isMr ? 'पडताळणीकृत कंपन्या' : 'Verified Employers'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                GSTIN & Udyam enterprise roster
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Pillar Dedicated Portals Overview */}
      <section className="px-4 sm:px-8 py-10 sm:py-14 border-b border-[var(--border)] bg-[var(--surface-muted)]/40 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-secondary)]">
                {isMr ? 'शासन, संस्था, उद्योग आणि युवक' : 'Complete 4-Pillar Architecture'}
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-[var(--text-primary)] tracking-tight mt-0.5">
                {isMr ? 'प्रत्येक घटकासाठी समर्पित दालन' : 'Dedicated Portals for Every Stakeholder'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-md">
              {isMr
                ? 'कौशल्य विकासातील पारदर्शकता आणि रोजगाराची खात्री करण्यासाठी सर्व घटकांचे एकत्रित व्यासपीठ.'
                : 'Role-based workspaces designed to eliminate ghost claims, enforce provider accountability, and verify real livelihoods.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: Government */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[var(--dark-panel)] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {isMr ? 'शासकीय अधिकारी' : 'Government Official'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">State Policy & Cohort Telemetry</p>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pt-1">
                  <li>• 36-District Livelihood Durability Index</li>
                  <li>• Public Value Ratio (PVR) budget ROI</li>
                  <li>• Early warning alerts & dropout flags</li>
                  <li>• Gemini 2.5 executive policy briefs</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenLogin('government')}
                className="w-full py-2 px-3 rounded-full bg-[var(--dark-panel)] text-white hover:opacity-90 font-medium text-xs transition-opacity shadow-2xs"
              >
                {isMr ? 'शासकीय दालन पहा' : 'Explore Govt Portal'}
              </button>
            </div>

            {/* Pillar 2: Training Institute */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[#BFE7C2] dark:bg-[#1E3A24] text-[#305B35] dark:text-[#A6EBB0] flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {isMr ? 'प्रशिक्षण संस्था' : 'Training Institute (VTP/ITI)'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Batches & Retention Durability</p>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pt-1">
                  <li>• Outcome-based Provider Scorecard (A+ to D)</li>
                  <li>• Batch enrolment roster & live checkpoints</li>
                  <li>• Automated WhatsApp follow-up queue</li>
                  <li>• Local industrial skill gap heatmap</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenLogin('provider')}
                className="w-full py-2 px-3 rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] font-medium text-xs transition-colors shadow-2xs"
              >
                {isMr ? 'संस्था दालन पहा' : 'Explore Institute Portal'}
              </button>
            </div>

            {/* Pillar 3: Verified Employer */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[#FFF0A8] dark:bg-[#3F3613] text-[#665400] dark:text-[#F8D84A] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {isMr ? 'नोंदणीकृत नियोक्ता' : 'Verified Employer'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Dual Confirmation & Openings</p>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pt-1">
                  <li>• GSTIN & Udyam corporate onboarding</li>
                  <li>• 1-Click trainee hire & wage verification</li>
                  <li>• Post verified skilled vacancies</li>
                  <li>• ₹3,000/trainee state tax incentive credit</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenLogin('employer')}
                className="w-full py-2 px-3 rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] font-medium text-xs transition-colors shadow-2xs"
              >
                {isMr ? 'नियोक्ता दालन पहा' : 'Explore Employer Portal'}
              </button>
            </div>

            {/* Pillar 4: Trainee */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[#D8C9F2] dark:bg-[#322648] text-[#55436F] dark:text-[#DACAF4] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {isMr ? 'प्रशिक्षणार्थी / तरुण' : 'Trainee / Youth'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">MahaKaushalya Skill ID</p>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pt-1">
                  <li>• Encrypted MH-SK Skill ID passport</li>
                  <li>• 60-second follow-up surveys (WhatsApp)</li>
                  <li>• Direct application to verified companies</li>
                  <li>• Self-service signup & DPDP consent control</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenLogin('trainee')}
                className="w-full py-2 px-3 rounded-full font-medium text-xs transition-colors shadow-2xs hover:opacity-90"
                style={{ color: '#ffffff', backgroundColor: '#282828' }}
              >
                {isMr ? 'प्रशिक्षणार्थी दालन पहा' : 'Explore Trainee Portal'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Trainee Features Section */}
      <section className="px-4 sm:px-8 py-10 sm:py-14 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)]">
              {isMr ? 'प्रशिक्षणार्थी व तरुणांसाठी सर्व वैशिष्ट्ये' : 'Comprehensive Trainee Features'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-[var(--text-primary)] tracking-tight">
              {t('landing_trainee_title')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t('landing_trainee_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trainee Card 1: 60s WhatsApp */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#BFE7C2] dark:bg-[#1E3A24] text-[#305B35] dark:text-[#A6EBB0] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {isMr ? '६०-सेकंद व्हॉट्सअ‍ॅप पाठपुरावा' : '60-Second WhatsApp Follow-ups'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isMr
                    ? 'अ‍ॅप डाउनलोड करण्याची गरज नाही. थेट आपल्या व्हॉट्सअ‍ॅपवर ३, ६, १२ आणि २४ महिन्यांनी इंटरअ‍ॅक्टिव्ह बटणांद्वारे रोजगार पडताळणी करा.'
                    : 'No app install required. Automated checkpoint surveys arrive directly on your phone via official WhatsApp with 1-tap interactive response buttons.'}
                </p>
              </div>
              <button
                onClick={onOpenWhatsApp}
                className="text-xs font-medium text-[#305B35] dark:text-[#A6EBB0] flex items-center gap-1 hover:underline pt-1 self-start"
              >
                <span>{isMr ? 'थेट व्हॉट्सअ‍ॅप पाठवा' : 'Kapso Direct Outreach'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trainee Card 2: Encrypted Skill ID */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-warm)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {isMr ? 'कायमस्वरूपी Skill ID ओळखपत्र' : 'Portable MH-SK Skill ID'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isMr
                    ? 'प्रत्येक उमेदवाराला MH-SK-XXXXXX हा अधिकृत डिजिटल आयडी मिळतो, ज्यावर घेतलेले प्रशिक्षण, गुण आणि पडताळणी झालेले वेतन सुरक्षित राहते.'
                    : 'Receive your unique, encrypted Maharashtra Skill ID passport tracking all certifications, attendance benchmarks, and verifiable employer endorsements.'}
                </p>
              </div>
              <button
                onClick={() => onOpenLogin('trainee')}
                className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1 hover:underline pt-1 self-start"
              >
                <span>{isMr ? 'माझे ओळखपत्र पहा' : 'View Skill ID Card'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trainee Card 3: Employer Dual Confirmation */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF0A8] dark:bg-[#3F3613] text-[#665400] dark:text-[#F8D84A] flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {isMr ? 'नियोक्ता दुहेरी पडताळणी' : 'Dual Employer Verification'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isMr
                    ? 'आपली नोकरी टाटा मोटर्स, महिंद्रा यांसारख्या नोंदणीकृत उद्योगांकडून अधिकृतरीत्या प्रमाणित होते. यामुळे बनावट दाव्यांचे उच्चाटन होऊन विश्वासार्हता वाढते.'
                    : 'Both you and your employer confirm employment and salary band. High confidence ratings protect you from substandard or ghost placement claims.'}
                </p>
              </div>
              <div className="text-[11px] font-medium text-[#305B35] dark:text-[#A6EBB0] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Eliminates Ghost Records</span>
              </div>
            </div>

            {/* Trainee Card 4: Verified Job Openings */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-muted)] text-[var(--text-primary)] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {isMr ? 'थेट उद्योग संधी व भरती' : 'Verified Industry Demands'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isMr
                    ? 'आपल्या ट्रेड आणि जिल्ह्यानुसार नामांकित उद्योजकांनी पोस्ट केलेल्या थेट नोकऱ्या पहा आणि मध्यस्थांशिवाय थेट अर्ज करा.'
                    : 'Access real-time job openings posted by GSTIN-verified manufacturers and enterprises across Pune, Sambhajinagar, Nashik, and MMR.'}
                </p>
              </div>
              <button
                onClick={() => onOpenLogin('trainee')}
                className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1 hover:underline pt-1 self-start"
              >
                <span>{isMr ? 'संधी तपासा' : 'Browse Matched Openings'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trainee Card 5: Upskilling & AI Roadmaps */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#D8C9F2] dark:bg-[#322648] text-[#55436F] dark:text-[#DACAF4] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {isMr ? 'वेतनवाढ व कौशल्य उन्नती' : 'Wage Progression & Upskilling'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isMr
                    ? 'कामावर येणाऱ्या अडचणी नोंदवून पुढील उच्च वेतनाच्या प्रगत कोर्सेसची (उदा. PLC, रोबोटिक्स, सीएनसी) शिफारस मिळवा.'
                    : 'Report workplace bottlenecks to receive tailored training course recommendations that help advance from ₹18k to ₹35k+ monthly salary bands.'}
                </p>
              </div>
              <div className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F8D84A]" />
                <span>Gemini Career Advisory</span>
              </div>
            </div>

            {/* Trainee Card 6: DPDP Act Privacy */}
            <div className="bg-[var(--surface)] rounded-[20px] p-5 border border-[var(--border)] shadow-[var(--shadow-card)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-warm)] text-[var(--text-primary)] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {isMr ? '१००% संमती व गोपनीयता हक्क' : 'DPDP Act Consent Control'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isMr
                    ? 'आपली माहिती संपूर्णपणे आपल्या नियंत्रणात आहे. संमती देणे किंवा ती मागे घेण्याचा पूर्ण अधिकार प्रत्येक प्रशिक्षणार्थीला कायद्याने उपलब्ध आहे.'
                    : 'Full data sovereignty under India’s Digital Personal Data Protection Act 2023. Grant or revoke permissions anytime with 1 click.'}
                </p>
              </div>
              <div className="text-[11px] font-medium text-[#305B35] dark:text-[#A6EBB0] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Section 4(2) Audit Sealed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warm Analytics Card Preview */}
      <section className="px-4 sm:px-8 py-10 sm:py-14 border-b border-[var(--border)] bg-[var(--surface-warm)] transition-colors">
        <div className="max-w-4xl mx-auto rounded-[20px] bg-[var(--surface)] p-6 sm:p-8 border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F8D84A]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Live Cohort Analytics
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-[var(--text-primary)] tracking-tight">
              {isMr ? 'महाराष्ट्रातील ३६ जिल्ह्यांचा थेट कौशल्य अहवाल' : 'Ready to explore state-wide skilling outcomes?'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isMr
                ? 'वेतन प्रगती वक्र, ६-महिने टिकवणूक गुणोत्तर आणि एआय धोरण विश्लेषणासह संपूर्ण महाराष्ट्राची माहिती पहा.'
                : 'Dive into longitudinal wage progression curves, mix-adjusted durability ratios, and automated policy synthesis.'}
            </p>
          </div>

          <button
            onClick={() => onOpenLogin()}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--dark-panel)] hover:opacity-90 text-white font-medium text-xs sm:text-sm transition-opacity shrink-0 shadow-2xs"
          >
            <span>{isMr ? 'प्रवेश करा / नोंदणी करा' : 'Sign In / Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-8 bg-[var(--surface)] text-xs text-[var(--text-secondary)] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--dark-panel)] p-1.5 flex items-center justify-center">
              <img
                src="/skilltrace-logo.svg"
                alt="SkillTrack"
                className="w-full h-full object-contain filter invert brightness-0"
              />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)] text-xs">
                SkillTrack Maharashtra · कौशल्यट्रॅक महाराष्ट्र
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Dept. of Skills, Employment, Entrepreneurship & Innovation, Government of Maharashtra
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => onOpenLogin('government')}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {isMr ? 'शासकीय लॉगिन' : 'Government Login'}
            </button>
            <button
              onClick={onOpenSignup}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {isMr ? 'प्रशिक्षणार्थी नोंदणी' : 'Trainee Registration'}
            </button>
            <button
              onClick={() => onOpenLogin()}
              className="hover:text-[var(--text-primary)] transition-colors font-medium"
            >
              {isMr ? 'सर्व लॉगिन पर्याय' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
