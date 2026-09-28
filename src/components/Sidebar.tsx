import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  BookOpen,
  MapPin,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Users,
  CalendarCheck,
  PhoneCall,
  MessageSquare,
  Briefcase,
  CheckSquare,
  FileText,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Home,
  X
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile, isMobile }) => {
  const { role, t } = useAuth();
  const location = useLocation();

  const govLinks = [
    { to: '/gov/dashboard', altTo: '/government/dashboard', label: t('nav_dashboard') || 'Dashboard', icon: LayoutDashboard },
    { to: '/gov/followups', altTo: '/government/followups', label: t('nav_whatsappFollowups') || 'WhatsApp Trainee Follow-ups', icon: PhoneCall, highlight: true, badgeText: 'Live' },
    { to: '/whatsapp-simulator', altTo: '/whatsapp-simulator', label: 'WhatsApp Outreach', icon: MessageSquare, highlight: true, badgeText: 'Kapso' },
    { to: '/gov/durability', altTo: '/government/durability', label: t('nav_durability') || 'Durability Matrix', icon: ShieldAlert },
    { to: '/gov/providers', altTo: '/government/providers', label: t('nav_providers') || 'Training Institutes', icon: Award },
    { to: '/gov/courses', altTo: '/government/courses', label: t('nav_courses') || 'Courses & Syllabus', icon: BookOpen },
    { to: '/gov/districts', altTo: '/government/districts', label: t('nav_districts') || 'District Map', icon: MapPin },
    { to: '/gov/skill-gaps', altTo: '/government/skill-gaps', label: t('nav_skillGaps') || 'Skill Gap Heatmap', icon: TrendingUp },
    { to: '/gov/alerts', altTo: '/government/alerts', label: t('nav_alerts') || 'System Alerts', icon: AlertTriangle },
    { to: '/gov/impact', altTo: '/government/impact', label: t('nav_impact') || 'Fiscal Impact & ROI', icon: FileSpreadsheet },
    { to: '/gov/data-quality', altTo: '/government/data-quality', label: t('nav_dataQuality') || 'Data Verification', icon: CheckCircle2 },
    { to: '/gov/ai', altTo: '/ai/analysis', label: t('nav_ai') || 'AI Policy Advisor', icon: Sparkles, highlight: true, badgeText: 'AI' },
    { to: '/gov/privacy', altTo: '/government/privacy', label: t('nav_privacy') || 'DPDP Privacy Audit', icon: Lock }
  ];

  const providerLinks = [
    { to: '/provider/dashboard', altTo: '/provider/dashboard', label: t('nav_providerDashboard') || 'Institute Dashboard', icon: LayoutDashboard },
    { to: '/provider/durability', altTo: '/provider/durability', label: t('nav_providerDurability') || 'Retention Durability', icon: ShieldCheck },
    { to: '/provider/trainees', altTo: '/provider/trainees', label: t('nav_providerTrainees') || 'Enrolled Trainees', icon: Users },
    { to: '/provider/batches', altTo: '/provider/batches', label: t('nav_providerBatches') || 'Training Batches', icon: CalendarCheck },
    { to: '/provider/followups', altTo: '/provider/followups', label: t('nav_providerFollowups') || 'Post-Placement Follow-ups', icon: PhoneCall }
  ];

  const employerLinks = [
    { to: '/employer/dashboard', altTo: '/employer/dashboard', label: t('nav_employerDashboard') || 'Employer Dashboard', icon: LayoutDashboard },
    { to: '/employer/hires', altTo: '/employer/hires', label: t('nav_employerHires') || 'Verified Hires (EPF/GST)', icon: CheckSquare },
    { to: '/employer/demand', altTo: '/employer/demand', label: t('nav_employerDemand') || 'Skill Demand Postings', icon: Briefcase },
    { to: '/employer/register', altTo: '/employer/register', label: t('nav_employerRegister') || 'Corporate Onboarding', icon: FileText }
  ];

  const traineeLinks = [
    { to: '/trainee/home', altTo: '/trainee/overview', label: 'Skill ID & Overview', icon: LayoutDashboard },
    { to: '/trainee/followup', altTo: '/trainee/survey', label: 'Self-Report & Checkpoint', icon: PhoneCall },
    { to: '/trainee/consent', altTo: '/trainee/privacy', label: 'DPDP Consent Rights', icon: Lock },
    { to: '/trainee/jobs', altTo: '/trainee/opportunities', label: 'Verified Industry Jobs', icon: Briefcase }
  ];

  let links = govLinks;
  let portalTitle = 'Government Portal';
  let portalSubtitle = 'State Policy & Analytics';

  if (role === 'provider') {
    links = providerLinks;
    portalTitle = 'Training Institute';
    portalSubtitle = 'Batches & Trainee Trajectories';
  } else if (role === 'employer') {
    links = employerLinks;
    portalTitle = 'Employer Portal';
    portalSubtitle = 'Dual-Verification & Hiring';
  } else if (role === 'trainee') {
    links = traineeLinks;
    portalTitle = 'Trainee Portal';
    portalSubtitle = 'MahaKaushalya Skill ID';
  }

  const isLinkActive = (to: string, altTo?: string) => {
    return (
      location.pathname === to ||
      (altTo && location.pathname === altTo) ||
      (to !== '/' && location.pathname.startsWith(to))
    );
  };

  return (
    <aside className="w-full h-full bg-[var(--surface)] text-[var(--text-primary)] rounded-[20px] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-muted)]/60 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface-warm)] text-[var(--accent-yellow-text)] border border-[var(--border)]">
            {role === 'government' ? 'Official Portal' : role === 'provider' ? 'Institute Hub' : role === 'employer' ? 'Corporate Hub' : 'Trainee Hub'}
          </span>
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight truncate mt-1">
            {portalTitle}
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)] truncate font-medium">{portalSubtitle}</p>
        </div>

        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          {role === 'government' ? 'Analytics & Modules' : 'Workspace Navigation'}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const active = isLinkActive(link.to, link.altTo);

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-xs transition-all relative group ${
                active
                  ? 'bg-[var(--dark-panel)] text-white font-semibold shadow-xs ring-1 ring-black/10'
                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  active
                    ? 'text-[#F8D84A]'
                    : link.highlight
                    ? 'text-[#D97706] dark:text-[#F8D84A]'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                }`}
              />
              <span className="truncate flex-1 tracking-tight">{link.label}</span>

              {link.highlight && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    active
                      ? 'bg-[#F8D84A] text-[#1E1E1E]'
                      : link.badgeText === 'Kapso'
                      ? 'bg-[#BFE7C2] text-[#305B35] border border-[#BFE7C2]'
                      : 'bg-[var(--accent-yellow-soft)] text-[var(--accent-yellow-text)] border border-[#F8D84A]/30'
                  }`}
                >
                  {link.badgeText || 'AI'}
                </span>
              )}

              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer status pill */}
      <div className="p-3.5 border-t border-[var(--border)] bg-[var(--surface-muted)]/50 text-xs text-[var(--text-secondary)] flex items-center justify-between shrink-0">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#10B981]/25" />
          <span className="font-semibold text-[var(--text-primary)] text-[11px]">SkillTrack Live</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-semibold text-[10px]">
          DPDP 2023
        </span>
      </div>
    </aside>
  );
};
