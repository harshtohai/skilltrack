import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import { UnauthorizedPage } from './UnauthorizedPage.tsx';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  onNavigateLogin,
  onNavigateHome
}) => {
  const { user, role, isAuthenticated } = useAuth();

  // 1. Unauthenticated check
  if (!isAuthenticated || !user) {
    return (
      <UnauthorizedPage
        type="unauthenticated"
        allowedRoles={allowedRoles}
        onNavigateLogin={onNavigateLogin}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  // 2. Role authorization check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <UnauthorizedPage
        type="role_restricted"
        allowedRoles={allowedRoles}
        onNavigateLogin={onNavigateLogin}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  // Authorized
  return <>{children}</>;
};

