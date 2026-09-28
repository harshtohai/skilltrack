import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { UserRole } from '../types.ts';
import {
  Bell,
  Globe,
  UserCheck,
  ChevronDown,
  Building2,
  Briefcase,
  GraduationCap,
  Shield,
  LogOut,
  Menu,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, role, language, setLanguage, loginAsRole, logout, t } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (newRole: UserRole) => {
    setRoleMenuOpen(false);
    await loginAsRole(newRole);
    if (newRole === 'government') navigate('/gov/dashboard');
    else if (newRole === 'provider') navigate('/provider/dashboard');
    else if (newRole === 'employer') navigate('/employer/dashboard');
    else if (newRole === 'trainee') navigate('/trainee/home');
  };

  const roleConfigs: Record<UserRole, { label: string; bg: string; text: string }> = {
    government: { label: 'Govt Official', bg: 'bg-[#303030] dark:bg-[#14161B]', text: 'text-white' },
    provider: { label: 'Training Institute', bg: 'bg-[#BFE7C2] dark:bg-[#1E3A24]', text: 'text-[#305B35] dark:text-[#A6EBB0]' },
    employer: { label: 'Employer', bg: 'bg-[#FFF0A8] dark:bg-[#3F3613]', text: 'text-[#665400] dark:text-[#F8D84A]' },
    trainee: { label: 'Trainee', bg: 'bg-[#D8C9F2] dark:bg-[#322648]', text: 'text-[#55436F] dark:text-[#DACAF4]' }
  };

  // Role-specific notifications data
  const roleNotifications: Record<
    UserRole,
    Array<{ id: string; title: string; desc: string; time: string; unread?: boolean; link?: string }>
  > = {
    government: [
      {
        id: 'g-1',
        title: 'Sahyadri Academy Alert',
        desc: 'Placement dropped below 40% threshold for Pune automotive cluster.',
        time: '12m ago',
        unread: true,
        link: '/gov/durability'
      },
      {
        id: 'g-2',
        title: 'Dual-Audit Cross Verification',
        desc: 'Tata Motors registered 12 candidate EPF/GST confirmations.',
        time: '1h ago',
        unread: true,
        link: '/gov/providers'
      },
      {
        id: 'g-3',
        title: 'District Benchmark Update',
        desc: 'Nashik and Sambhajinagar crossed 75% 6-month retention.',
        time: '3h ago',
        unread: false,
        link: '/gov/districts'
      }
    ],
    provider: [
      {
        id: 'p-1',
        title: 'Batch 2023-B Survey Due',
        desc: '8 trainees awaiting 6-month post-training employment confirmation.',
        time: '20m ago',
        unread: true,
        link: '/provider/followups'
      },
      {
        id: 'p-2',
        title: 'Attendance Milestone Reached',
        desc: 'Advanced CNC Operator batch reached 94% average attendance.',
        time: '2h ago',
        unread: true,
        link: '/provider/batches'
      },
      {
        id: 'p-3',
        title: 'Industry Demand Matched',
        desc: 'Bharat Forge posted 15 technician openings in Chakan cluster.',
        time: '1d ago',
        unread: false,
        link: '/provider/trainees'
      }
    ],
    employer: [
      {
        id: 'e-1',
        title: 'New Skill ID Applications',
        desc: '5 certified technicians applied for CNC Lathe Machinist role.',
        time: '15m ago',
        unread: true,
        link: '/employer/hires'
      },
      {
        id: 'e-2',
        title: 'Tax Credit Unlocked',
        desc: 'Dual-verification audit approved for 12 hires (₹36,000 credit).',
        time: '2h ago',
        unread: true,
        link: '/employer/hires'
      },
      {
        id: 'e-3',
        title: 'Cohort Graduation Notice',
        desc: '24 certified welders graduated from Government ITI Aundh.',
        time: '1d ago',
        unread: false,
        link: '/employer/demand'
      }
    ],
    trainee: [
      {
        id: 't-1',
        title: '6-Month Survey Open',
        desc: 'Share your post-training wage & workplace status in 60 seconds.',
        time: '5m ago',
        unread: true,
        link: '/trainee/followup'
      },
      {
        id: 't-2',
        title: 'Job Matches in Pune',
        desc: '3 verified employers posted vacancies matching your certification.',
        time: '1h ago',
        unread: true,
        link: '/trainee/jobs'
      },
      {
        id: 't-3',
        title: 'DPDP Consent Active',
        desc: 'Your consent record is secured under the DPDP Act 2023.',
        time: '2d ago',
        unread: false,
        link: '/trainee/consent'
      }
    ]
  };

  const currentRole = role || 'government';
  const notifications = roleNotifications[currentRole] || roleNotifications.government;
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-b border-[var(--border)] h-16 flex items-center justify-between px-4 sm:px-8 transition-colors duration-200">
      {/* Brand & Mobile Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && user && (
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="p-2 -ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] rounded-full md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          title="Return to Public Landing Page"
        >
          <div className="w-9 h-9 rounded-full bg-[var(--dark-panel)] p-1.5 flex items-center justify-center shadow-xs">
            <img
              src="/skilltrace-logo.svg"
              alt="SkillTrack Maharashtra"
              className="w-full h-full object-contain filter invert brightness-0"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-medium text-[var(--text-primary)] text-base leading-tight tracking-tight">
                SkillTrack
              </span>
              <span className="hidden sm:inline text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-[var(--accent-yellow-soft)] text-[var(--accent-yellow-text)]">
                MahaKaushalya
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] hidden sm:block leading-tight">
              Govt. of Maharashtra · Skilling Outcomes
            </p>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Quick AI Advisor shortcut */}
        <button
          onClick={() => navigate('/gov/ai')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#303030] bg-[#FFF9E9] hover:bg-[#FFF0A8] border border-[#E2E2DE] transition-colors"
          title="Open AI Policy Advisor Hub"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#303030]" />
          <span>AI Advisor</span>
        </button>

        {/* Language Toggle */}
        <button
          id="btn-language-toggle"
          onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#74767D] hover:text-[#303030] hover:bg-[#E2E2DE]/50 border border-[#E2E2DE] transition-colors"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#74767D]" />
          <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#74767D] hover:text-[#303030] hover:bg-[#E2E2DE]/50 border border-[#E2E2DE] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#F8D84A]" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#74767D]" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Current Role Badge */}
        {role && roleConfigs[role] && (
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border border-[#E2E2DE] ${roleConfigs[role].bg} ${roleConfigs[role].text}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {roleConfigs[role].label}
          </span>
        )}

        {/* Switch Role Dropdown */}
        <div className="relative">
          <button
            id="btn-switch-role"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#303030] bg-white hover:bg-[#F1F1EE] border border-[#E2E2DE] transition-colors shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#303030]" />
            <span className="hidden sm:inline">{t('switchRole') || 'Switch Portal'}</span>
            <ChevronDown className="w-3 h-3 text-[#74767D]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-[20px] shadow-[0_8px_22px_rgba(35,38,45,0.10)] border border-[#E2E2DE] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-[#E2E2DE] text-[10px] font-medium text-[#74767D] uppercase tracking-wider">
                Instant Demo Portals
              </div>
              <div className="p-1 space-y-1">
                <button
                  onClick={() => handleRoleSwitch('government')}
                  className={`w-full text-left px-3 py-2 rounded-full flex items-center gap-2.5 text-xs transition-colors ${
                    role === 'government'
                      ? 'bg-[#303030] text-white font-medium'
                      : 'text-[#303030] hover:bg-[#F1F1EE]'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight">Government Official</p>
                    <p className={`text-[10px] truncate ${role === 'government' ? 'text-slate-300' : 'text-[#74767D]'}`}>
                      State Policy & District Analytics
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSwitch('provider')}
                  className={`w-full text-left px-3 py-2 rounded-full flex items-center gap-2.5 text-xs transition-colors ${
                    role === 'provider'
                      ? 'bg-[#303030] text-white font-medium'
                      : 'text-[#303030] hover:bg-[#F1F1EE]'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight">Training Institute</p>
                    <p className={`text-[10px] truncate ${role === 'provider' ? 'text-slate-300' : 'text-[#74767D]'}`}>
                      Pune Centre (Batches & Follow-ups)
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSwitch('employer')}
                  className={`w-full text-left px-3 py-2 rounded-full flex items-center gap-2.5 text-xs transition-colors ${
                    role === 'employer'
                      ? 'bg-[#303030] text-white font-medium'
                      : 'text-[#303030] hover:bg-[#F1F1EE]'
                  }`}
                >
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight">Verified Employer</p>
                    <p className={`text-[10px] truncate ${role === 'employer' ? 'text-slate-300' : 'text-[#74767D]'}`}>
                      Tata Motors (Hires & Tax Credit)
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSwitch('trainee')}
                  className={`w-full text-left px-3 py-2 rounded-full flex items-center gap-2.5 text-xs transition-colors ${
                    role === 'trainee'
                      ? 'bg-[#303030] text-white font-medium'
                      : 'text-[#303030] hover:bg-[#F1F1EE]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight">Trainee / Youth</p>
                    <p className={`text-[10px] truncate ${role === 'trainee' ? 'text-slate-300' : 'text-[#74767D]'}`}>
                      Skill ID card, DPDP & 60s Checkpoint
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role-Reactive Notification Bell */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-full text-[#74767D] hover:text-[#303030] hover:bg-[#E2E2DE]/50 relative transition-colors"
            title={`${currentRole} notifications`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F8D84A] border border-white rounded-full"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-[20px] shadow-[0_18px_50px_rgba(35,38,45,0.16)] border border-[#E2E2DE] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E2DE] mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#303030]">
                    {roleConfigs[currentRole]?.label} Alerts
                  </span>
                </div>
                <span className="text-[10px] bg-[#FFF0A8] text-[#665400] px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} New
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.link) {
                        navigate(notif.link);
                        setNotifOpen(false);
                      }
                    }}
                    className={`p-2.5 rounded-[14px] border border-[#E2E2DE] transition-colors cursor-pointer hover:bg-[#F1F1EE] ${
                      notif.unread ? 'bg-[#FFF9E9]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="font-medium text-[#303030] text-[12px] truncate">{notif.title}</p>
                      <span className="text-[10px] text-[#9A9A9A] flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3" />
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74767D] leading-tight line-clamp-2">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile / Logout */}
        {user ? (
          <div className="pl-2 border-l border-[#E2E2DE] flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-[#303030] text-white flex items-center justify-center text-xs font-medium shadow-xs"
              title={user?.name || 'Authorized User'}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-[#74767D] hover:text-[#303030] hover:bg-[#E2E2DE]/50 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#303030] text-white hover:bg-[#202020] transition-colors shadow-2xs"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
