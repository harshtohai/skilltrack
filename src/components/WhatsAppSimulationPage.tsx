import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send,
  Phone,
  RotateCcw,
  Database,
  ExternalLink,
  ShieldCheck,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  Radio,
  FileCheck,
  Clock,
  UserCheck,
  Building2,
  Briefcase,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
  Trash2,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

interface KapsoDispatchRecord {
  id: string;
  messageId: string;
  to: string;
  stepIndex: number;
  stepTitle: string;
  status: 'dispatched' | 'delivered' | 'read' | 'replied';
  isLive: boolean;
  content: string;
  buttons: string[];
  timestamp: string;
  replyReceived?: string;
  replyTimestamp?: string;
}

interface SurveySession {
  traineeId: string;
  traineeName: string;
  lastEmployer?: string;
  currentStep: number;
  data: Record<string, any>;
  windowActive?: boolean;
  status: 'idle' | 'waiting_for_reply' | 'processing' | 'completed';
  lastDispatchedTimestamp: number;
  lastDispatchedStep: number;
}

const SURVEY_STAGES = [
  { index: 0, title: 'Step 1: Hello & Purpose + Consent Buttons (Yes / No)', icon: ShieldCheck },
  { index: 1, title: 'Step 2: Employment Status (Salaried, Self-Employed, Seeking)', icon: Briefcase },
  { index: 2, title: 'Step 3: Employer Organization (with Last Recorded Firm)', icon: Building2 },
  { index: 3, title: 'Step 4: Role Details (Operator, Assembly, QA, Lead)', icon: UserCheck },
  { index: 4, title: 'Step 5: Monthly Salary Range (<15k, 15-25k, >25k)', icon: DollarSign },
  { index: 5, title: 'Step 6: Job Satisfaction (Very Satisfied to Unsatisfied)', icon: Sparkles },
  { index: 6, title: 'Step 7: Training Relevance (100% Relevant, 50-80%, Unrelated)', icon: FileCheck },
  { index: 7, title: 'Step 8: Daily Workplace Skill Gaps (CNC, Digital, English)', icon: Cpu },
  { index: 8, title: 'Step 9: Suggested Upskilling Courses (Robotics, EV, Solar)', icon: TrendingUp },
  { index: 9, title: 'Step 10: Long-Term Career Goals (3-5 Years)', icon: ArrowRight },
  { index: 10, title: 'Step 11: Single Biggest Career Challenge', icon: AlertCircle },
  { index: 11, title: 'Step 12: Final Completion Notice & Official Portal URL', icon: CheckCircle2 }
];

export const WhatsAppSimulationPage: React.FC<{ onNavigateHome?: () => void }> = ({
  onNavigateHome
}) => {
  const { user, role, isAuthenticated, logout, language } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const dashboardUrl = role === 'government'
    ? '/gov/dashboard'
    : role === 'provider'
    ? '/provider/dashboard'
    : role === 'employer'
    ? '/employer/dashboard'
    : role === 'trainee'
    ? '/trainee/home'
    : '/';

  const handleBack = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    navigate(dashboardUrl);
  };

  // Target mobile number (entered by user)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [selectedTrainee, setSelectedTrainee] = useState('Harsh Panchal');
  const [lastEmployer, setLastEmployer] = useState<string | null>('Tata Motors Ltd');
  const [hasLastEmployer, setHasLastEmployer] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [targetLang, setTargetLang] = useState<'en' | 'mr'>(language === 'mr' ? 'mr' : 'en');

  // Kapso SDK configuration state
  const [showKapsoConfig, setShowKapsoConfig] = useState(false);
  const [kapsoApiKey, setKapsoApiKey] = useState('');
  const [kapsoPhoneId, setKapsoPhoneId] = useState('');
  const [kapsoStatus, setKapsoStatus] = useState<{ isLive: boolean; senderNumber: string }>({
    isLive: false,
    senderNumber: ''
  });
  const [configSaveMsg, setConfigSaveMsg] = useState<string | null>(null);

  // Dispatch activity & logs
  const [dispatchLogs, setDispatchLogs] = useState<KapsoDispatchRecord[]>([]);
  const [activeSession, setActiveSession] = useState<SurveySession | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lastDispatchResult, setLastDispatchResult] = useState<any | null>(null);
  const [verifiedOutcomes, setVerifiedOutcomes] = useState<any[]>([]);

  // Fetch status, active session, and logs safely
  const fetchStatusAndLogs = async () => {
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const sessionPromise = cleanPhone.length >= 10
        ? fetch(`/api/kapso/session?phone=${cleanPhone}`).catch(() => null)
        : Promise.resolve(null);

      const [statusRes, logsRes, outcomesRes, sessionRes] = await Promise.all([
        fetch('/api/kapso/status').catch(() => null),
        fetch('/api/kapso/logs').catch(() => null),
        fetch('/api/outcomes').catch(() => null),
        sessionPromise
      ]);

      if (statusRes && statusRes.ok) {
        const contentType = statusRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const s = await statusRes.json();
            setKapsoStatus(s);
            if (s.apiKey) setKapsoApiKey(s.apiKey);
            if (s.phoneNumberId) setKapsoPhoneId(s.phoneNumberId);
          } catch (e) {
            // Ignore parse error
          }
        }
      }

      if (sessionRes && sessionRes.ok) {
        try {
          const sessData = await sessionRes.json();
          if (sessData && sessData.session) {
            setActiveSession(sessData.session);
          }
        } catch (e) {
          // Ignore parse error
        }
      }

      if (logsRes && logsRes.ok) {
        const contentType = logsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const l = await logsRes.json();
            if (Array.isArray(l)) {
              setDispatchLogs(l);
            }
          } catch (e) {
            // Ignore parse error
          }
        }
      }

      if (outcomesRes && outcomesRes.ok) {
        const contentType = outcomesRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const o = await outcomesRes.json();
            // Filter outcomes recorded via WhatsApp/Kapso
            const waOutcomes = (Array.isArray(o) ? o : []).filter(
              (item: any) => item.survey_channel === 'WhatsApp-Kapso' || item.source === 'Auto-Follow-up'
            );
            setVerifiedOutcomes(waOutcomes);
          } catch (e) {
            // Ignore parse error
          }
        }
      }
    } catch (err) {
      console.warn('Note updating Kapso status & logs:', err);
    }
  };

  useEffect(() => {
    fetchStatusAndLogs();
    const interval = setInterval(fetchStatusAndLogs, 1200);
    return () => clearInterval(interval);
  }, [phoneNumber]);

  // Handle saving Kapso API credentials
  const saveKapsoConfig = async () => {
    try {
      const res = await fetch('/api/kapso/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: kapsoApiKey.trim(),
          phoneNumberId: kapsoPhoneId.trim(),
          senderNumber: phoneNumber
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfigSaveMsg('Credentials saved. Kapso live WhatsApp service initialized.');
        fetchStatusAndLogs();
        setTimeout(() => setConfigSaveMsg(null), 4000);
      }
    } catch (err) {
      setConfigSaveMsg('Failed to save Kapso credentials.');
    }
  };

  // Start 1-by-1 sequential survey pipeline (dispatches Step 0 and waits for user's reply)
  const handleStartSequentialSurvey = async () => {
    const clean = phoneNumber.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number before starting.');
      return;
    }
    setPhoneError(null);
    setIsSending(true);
    setLastDispatchResult(null);

    try {
      const res = await fetch('/api/kapso/start-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          traineeName: selectedTrainee,
          lastEmployer: hasLastEmployer ? lastEmployer : null,
          language: targetLang
        })
      });

      const result = await res.json();
      setLastDispatchResult(result);
      fetchStatusAndLogs();
    } catch (err: any) {
      setLastDispatchResult({
        success: false,
        details: err?.message || 'Failed to start survey via Kapso'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Dispatch a specific step directly to the user's phone via Kapso
  const handleDispatchMessage = async (stageIndex: number) => {
    const clean = phoneNumber.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number before dispatching.');
      return;
    }
    setPhoneError(null);
    setIsSending(true);
    setLastDispatchResult(null);

    try {
      const res = await fetch('/api/kapso/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          stepIndex: stageIndex,
          traineeName: selectedTrainee,
          lastEmployer: hasLastEmployer ? lastEmployer : null,
          language: targetLang
        })
      });

      const result = await res.json();
      setLastDispatchResult(result);
      fetchStatusAndLogs();
    } catch (err: any) {
      setLastDispatchResult({
        success: false,
        details: err?.message || 'Failed to dispatch via Kapso'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Simulate an incoming reply from trainee's phone (to test the 2-way loop)
  const handleSimulateReply = async (buttonTitle: string, stepIndex: number) => {
    try {
      await fetch('/api/kapso/simulate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          buttonTitle,
          stepIndex
        })
      });
      fetchStatusAndLogs();
    } catch (err) {
      console.error('Error simulating reply:', err);
    }
  };

  // Clear logs
  const handleClearLogs = async () => {
    await fetch('/api/kapso/logs', { method: 'DELETE' });
    setDispatchLogs([]);
  };

  // Bot and target mobile number configuration
  const botNumber = '12084454652';
  const botDisplayNumber = '+1 (208) 445-4652';
  const botActivationLink = `https://wa.me/${botNumber}?text=${encodeURIComponent('Hi SkillTrack')}`;

  return (
    <div className="min-h-full flex flex-col font-sans text-[var(--text-primary)]">
      {/* Sub-header Navigation */}
      <div className="border-b border-[var(--border)] px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[var(--surface)] transition-colors">
        <Link to={dashboardUrl} className="flex items-center gap-3">
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
                WhatsApp Dispatch
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
              Kapso WhatsApp Direct Outreach Engine
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Back button (returns to previous portal page, never logs out) */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] transition-colors shadow-2xs"
            title="Return to previous screen"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Quick link to Dashboard if authenticated */}
          {isAuthenticated && (
            <button
              onClick={() => navigate(dashboardUrl)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)] transition-colors shadow-2xs"
              title="Return to Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Dashboard</span>
            </button>
          )}

          {/* Theme switcher */}
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

          {/* User profile & Logout button (Logs out ONLY when clicking Logout) */}
          {isAuthenticated && user ? (
            <div className="pl-2 border-l border-[var(--border)] flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-[var(--dark-panel)] text-white flex items-center justify-center text-xs font-medium shadow-xs"
                title={`${user.name || 'User'} (${role})`}
              >
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 transition-colors shadow-2xs"
                title="Sign Out of SkillTrack"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[var(--dark-panel)] text-white hover:bg-black transition-colors shadow-2xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-8 pb-16 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
            Kapso WhatsApp Direct Outreach Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Longitudinal verification, wage audits, and career upskilling dispatched directly to trainees
          </p>
        </div>
      </div>

      {/* Main Outreach Console: Dispatcher & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Message Dispatcher (Cols 1-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Direct WhatsApp Dispatcher
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Step-by-Step or Full Flow</span>
            </div>

            {/* Recipient Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Recipient Trainee Phone Number *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  +91
                </span>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {phoneError}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter any active WhatsApp mobile number. Messages are dispatched strictly when you click the send button below, never on website reload.
                </p>
              )}
            </div>

            {/* Trainee Profile & Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={selectedTrainee}
                  onChange={(e) => setSelectedTrainee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Language Preference
                </label>
                <select
                  value={targetLang}
                  onChange={(e: any) => setTargetLang(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>

            {/* Last Employer Option */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Include Last Recorded Employer
                </span>
                <input
                  type="checkbox"
                  checked={hasLastEmployer}
                  onChange={(e) => setHasLastEmployer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {hasLastEmployer && (
                <input
                  type="text"
                  value={lastEmployer || ''}
                  onChange={(e) => setLastEmployer(e.target.value)}
                  placeholder="e.g. Tata Motors Ltd"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                When enabled, Step 3 displays a 1-tap quick button with their past firm name so the trainee can verify employment instantly.
              </p>
            </div>

            {/* Sequential 1-by-1 Flow Status */}
            {activeSession && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>1-by-1 Survey Status</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {activeSession.status === 'completed' ? 'Completed' : `Step ${(activeSession.currentStep ?? 0) + 1} of 12`}
                  </span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  {activeSession.status === 'completed' ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">All questions answered! Outcome logged in SkillTrack.</span>
                  ) : (
                    <span>
                      <strong className="text-blue-800 dark:text-blue-300">Awaiting your response on WhatsApp</strong> for {SURVEY_STAGES[activeSession.currentStep]?.title || `Step ${activeSession.currentStep + 1}`}.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Dispatch Action Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleStartSequentialSurvey}
                disabled={isSending}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSending
                    ? 'Connecting to Kapso...'
                    : activeSession && activeSession.status === 'waiting_for_reply'
                    ? 'Restart Survey from Step 1 (1-by-1)'
                    : 'Start 1-by-1 WhatsApp Survey'}
                </span>
              </button>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Dispatches strictly <strong>one message at a time</strong>. The next message is sent only after you tap a button on WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Transmission History & Trainee Submissions (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Dispatch Logs Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Live Kapso Transmission Feed
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchStatusAndLogs}
                  title="Refresh Logs"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {dispatchLogs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    title="Clear Log History"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {dispatchLogs.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Phone className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No WhatsApp messages dispatched yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Send Stage 1" or "Initiate Complete Survey Pipeline" on the left to transmit the first message directly to +91 {phoneNumber}.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {dispatchLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2.5 text-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          +{log.to}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {log.stepTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'replied'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : log.status === 'delivered'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {log.status === 'replied' ? '✓ Replied' : log.status === 'delivered' ? '✓ Delivered' : 'Transmitted'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Message Preview */}
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      {log.content}
                    </p>

                    {/* Interactive Buttons Sent to User's Phone */}
                    {log.buttons && log.buttons.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                          Buttons on User's Phone:
                        </span>
                        {log.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSimulateReply(btn, log.stepIndex)}
                            title="Click to simulate trainee tapping this button on their phone"
                            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <span>{btn}</span>
                            <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* If user replied from phone */}
                    {log.replyReceived && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
                        <span className="font-semibold">
                          Trainee Response Received: "{log.replyReceived}"
                        </span>
                        <span className="text-[10px] opacity-75">
                          {log.replyTimestamp ? new Date(log.replyTimestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  </div>
  );
};
