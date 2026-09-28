import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import { Lock, ShieldAlert, ArrowRight, Home, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnauthorizedPageProps {
  type?: 'unauthenticated' | 'role_restricted';
  allowedRoles?: UserRole[];
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  type = 'unauthenticated',
  allowedRoles,
  onNavigateLogin,
  onNavigateHome
}) => {
  const { role, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const roleTitles: Record<UserRole, string> = {
    government: 'Government Official',
    provider: 'Training Institute',
    employer: 'Verified Employer',
    trainee: 'Trainee / Youth'
  };

  const handleHome = () => {
    if (onNavigateHome) onNavigateHome();
    else navigate('/');
  };

  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-4 sm:p-6 my-auto">
      <div className="w-full max-w-lg bg-white rounded-[20px] p-6 sm:p-8 border border-[#E2E2DE] shadow-[0_18px_50px_rgba(35,38,45,0.16)] text-center space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9E9] border border-[#E2E2DE] flex items-center justify-center text-[#303030]">
          {type === 'unauthenticated' ? (
            <Lock className="w-7 h-7 text-[#303030]" />
          ) : (
            <ShieldAlert className="w-7 h-7 text-[#303030]" />
          )}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="inline-block text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF0A8] text-[#665400]">
            {type === 'unauthenticated' ? 'Authentication Required' : 'Access Restricted'}
          </span>
          <h1 className="text-2xl font-normal text-[#303030] tracking-tight">
            {type === 'unauthenticated'
              ? 'Sign in to access this workspace'
              : 'Permission Required'}
          </h1>
          <p className="text-[13px] text-[#74767D] leading-relaxed max-w-md mx-auto">
            {type === 'unauthenticated'
              ? 'This module is protected under the Maharashtra Skilling Outcomes framework. Please sign in with your authorized credentials to proceed.'
              : `You are signed in as ${role ? roleTitles[role] : 'user'}. This page is restricted to authorized personnel.`}
          </p>

          {allowedRoles && allowedRoles.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-[#9A9A9A]">Authorized roles:</span>
              {allowedRoles.map((r) => (
                <span
                  key={r}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F1F1EE] text-[#303030] border border-[#E2E2DE]"
                >
                  {roleTitles[r]}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 space-y-3">
          {onNavigateLogin && type === 'unauthenticated' ? (
            <button
              onClick={onNavigateLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#303030] hover:bg-[#1f1f1f] text-white text-sm font-medium transition-all shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Credentials</span>
            </button>
          ) : (
            <button
              onClick={handleHome}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#303030] hover:bg-[#1f1f1f] text-white text-sm font-medium transition-all shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>Return to Public Portal</span>
            </button>
          )}

          {/* Quick Instant Demo Access */}
          <div className="pt-4 border-t border-[#E2E2DE] text-left">
            <p className="text-[11px] font-medium text-[#74767D] mb-2 text-center">
              Quick Switch Demo Role (Test Portal Directly):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await loginAsRole('government');
                  navigate('/gov/dashboard');
                }}
                className="px-3 py-2 text-xs font-medium rounded-full bg-[#F1F1EE] hover:bg-[#FFF0A8] text-[#303030] border border-[#E2E2DE] transition-colors text-center"
              >
                Government Official
              </button>
              <button
                type="button"
                onClick={async () => {
                  await loginAsRole('trainee');
                  navigate('/trainee/home');
                }}
                className="px-3 py-2 text-xs font-medium rounded-full bg-[#F1F1EE] hover:bg-[#FFF0A8] text-[#303030] border border-[#E2E2DE] transition-colors text-center"
              >
                Trainee (Youth)
              </button>
              <button
                type="button"
                onClick={async () => {
                  await loginAsRole('provider');
                  navigate('/provider/dashboard');
                }}
                className="px-3 py-2 text-xs font-medium rounded-full bg-[#F1F1EE] hover:bg-[#FFF0A8] text-[#303030] border border-[#E2E2DE] transition-colors text-center"
              >
                Training Institute
              </button>
              <button
                type="button"
                onClick={async () => {
                  await loginAsRole('employer');
                  navigate('/employer/dashboard');
                }}
                className="px-3 py-2 text-xs font-medium rounded-full bg-[#F1F1EE] hover:bg-[#FFF0A8] text-[#303030] border border-[#E2E2DE] transition-colors text-center"
              >
                Verified Employer
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleHome}
              className="text-xs text-[#74767D] hover:text-[#303030] transition-colors underline underline-offset-4"
            >
              ← Back to SkillTrack Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
