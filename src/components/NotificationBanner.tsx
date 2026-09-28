import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  BellRing,
  ShieldCheck,
  Building2,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationBanner: React.FC = () => {
  const { role, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-[#FFF9E9] border-b border-[#E2E2DE] px-4 py-2 text-xs flex items-center justify-between text-[#303030]">
        <div className="flex items-center gap-2 max-w-4xl truncate">
          <span className="w-2 h-2 rounded-full bg-[#F8D84A] shrink-0" />
          <span className="font-semibold text-[#303030]">Public Demonstration:</span>
          <span className="text-[#74767D] truncate">
            Government of Maharashtra longitudinal skilling outcomes & verification platform. Sign in to view restricted district and institute datasets.
          </span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#303030] hover:underline shrink-0"
        >
          <span>Explore Public Overview</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // 1. Government Official Reactive Notification
  if (role === 'government') {
    return (
      <div className="bg-[#FFF9E9] border-b border-[#E2E2DE] px-3 sm:px-6 py-2 text-xs flex items-center justify-between text-[#303030] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-full bg-[#F8D84A] text-[#303030] shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-[#303030] shrink-0">State Policy Pulse:</span>
            <span className="text-[#74767D] truncate">
              36 Districts reporting · 78.4% Dual-verified placement · 2 districts flagged for wage durability review.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={() => navigate('/gov/durability')}
            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#303030] text-white hover:bg-[#202020] transition-colors shadow-2xs"
          >
            Review Durability Flags
          </button>
        </div>
      </div>
    );
  }

  // 2. Training Institute Reactive Notification
  if (role === 'provider') {
    return (
      <div className="bg-[#F1F1EE] border-b border-[#E2E2DE] px-3 sm:px-6 py-2 text-xs flex items-center justify-between text-[#303030] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-full bg-[#BFE7C2] text-[#305B35] shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-[#303030] shrink-0">Institute Follow-ups:</span>
            <span className="text-[#74767D] truncate">
              Pune Skill Dev Centre: CNC Batch 2023-B has 8 trainee surveys pending at the 6-month post-placement mark.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={() => navigate('/provider/followups')}
            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#303030] text-white hover:bg-[#202020] transition-colors shadow-2xs"
          >
            Dispatch Surveys
          </button>
        </div>
      </div>
    );
  }

  // 3. Verified Employer Reactive Notification
  if (role === 'employer') {
    return (
      <div className="bg-[#FFF0A8]/40 border-b border-[#E2E2DE] px-3 sm:px-6 py-2 text-xs flex items-center justify-between text-[#303030] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-full bg-[#F8D84A] text-[#303030] shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-[#303030] shrink-0">Employer Action:</span>
            <span className="text-[#74767D] truncate">
              5 candidates applied with verified Skill ID · 12 hires certified for ₹36,000 state tax incentive credit.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={() => navigate('/employer/hires')}
            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#303030] text-white hover:bg-[#202020] transition-colors shadow-2xs"
          >
            Verify Hires
          </button>
        </div>
      </div>
    );
  }

  // 4. Trainee / Youth Reactive Notification
  if (role === 'trainee') {
    return (
      <div className="bg-[#D8C9F2]/30 border-b border-[#E2E2DE] px-3 sm:px-6 py-2 text-xs flex items-center justify-between text-[#303030] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-full bg-[#D8C9F2] text-[#55436F] shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-[#303030] shrink-0">Trainee Portal:</span>
            <span className="text-[#74767D] truncate">
              Welcome, {user?.name || 'Trainee'}! Your 6-Month Employment Checkpoint survey is open. Share feedback in 60s.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={() => navigate('/trainee/followup')}
            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#303030] text-white hover:bg-[#202020] transition-colors shadow-2xs"
          >
            Start Checkpoint
          </button>
        </div>
      </div>
    );
  }

  return null;
};
