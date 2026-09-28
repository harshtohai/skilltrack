import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { WhatsAppSimulationPage } from './components/WhatsAppSimulationPage.tsx';
import { UserRole } from './types.ts';

// Government Pages
import { GovDashboard } from './pages/GovDashboard.tsx';
import { GovProviders } from './pages/GovProviders.tsx';
import { GovCourses } from './pages/GovCourses.tsx';
import { GovDistricts } from './pages/GovDistricts.tsx';
import { GovSkillGaps } from './pages/GovSkillGaps.tsx';
import { GovAlerts } from './pages/GovAlerts.tsx';
import { GovImpact } from './pages/GovImpact.tsx';
import { GovDurability } from './pages/GovDurability.tsx';
import { GovDataQuality } from './pages/GovDataQuality.tsx';
import { GovPrivacy } from './pages/GovPrivacy.tsx';
import { GovFollowups } from './pages/GovFollowups.tsx';

// Provider Pages
import { ProviderDashboard } from './pages/ProviderDashboard.tsx';
import { ProviderDurability } from './pages/ProviderDurability.tsx';
import { ProviderTrainees } from './pages/ProviderTrainees.tsx';
import { TraineeProfileView } from './pages/TraineeProfileView.tsx';
import { ProviderBatches } from './pages/ProviderBatches.tsx';
import { ProviderFollowups } from './pages/ProviderFollowups.tsx';

// Employer Pages
import { EmployerDashboard } from './pages/EmployerDashboard.tsx';
import { EmployerHires } from './pages/EmployerHires.tsx';
import { EmployerDemand } from './pages/EmployerDemand.tsx';
import { EmployerRegister } from './pages/EmployerRegister.tsx';

// Trainee Portal
import { TraineePortal } from './pages/TraineePortal.tsx';

// AI Intelligence
import { AiAnalysis } from './pages/AiAnalysis.tsx';
import { AuthPage } from './pages/AuthPage.tsx';

const AppLayout: React.FC<{
  children: React.ReactNode;
  onOpenAuth: (mode?: 'login' | 'signup', role?: UserRole) => void;
}> = ({ children, onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Public standalone pages without restricted dashboard sidebar or authenticated header
  const isPublicPage = ['/', '/landing', '/login', '/signup', '/whatsapp-simulator'].includes(location.pathname);

  if (isPublicPage) {
    return (
      <div className="min-h-screen w-full bg-[var(--shell)] text-[var(--text-primary)] flex flex-col transition-colors duration-200">
        <div className="flex-1 flex flex-col w-full">{children}</div>
      </div>
    );
  }

  const showSidebar = isAuthenticated && !!user;

  return (
    <div className="min-h-screen w-full bg-[var(--shell)] text-[var(--text-primary)] font-sans antialiased flex flex-col transition-colors duration-200">
      <div className="w-full flex-1 flex flex-col">
        <div className="print:hidden sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)]">
          <Navbar onToggleSidebar={() => setMobileMenuOpen((prev) => !prev)} />
        </div>

        <div className="flex-1 flex w-full">
          {/* Desktop Sidebar FIXED to screen */}
          {showSidebar && (
            <aside className="hidden md:block w-64 shrink-0 print:hidden sticky top-16 h-[calc(100vh-4rem)] p-3 lg:p-4 self-start">
              <div className="h-full">
                <Sidebar />
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-16 w-full max-w-[1600px] overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {showSidebar && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar isMobile onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

function AppRoutes() {
  const navigate = useNavigate();
  const { role } = useAuth();

  // Auth modal management
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('government');

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', targetRole: UserRole = 'government') => {
    setAuthMode(mode);
    setAuthRole(targetRole);
    setAuthOpen(true);
  };

  const handleExploreDashboard = () => {
    if (role === 'provider') navigate('/provider/dashboard');
    else if (role === 'employer') navigate('/employer/dashboard');
    else if (role === 'trainee') navigate('/trainee/home');
    else navigate('/gov/dashboard');
  };

  const handleBackFromSimulator = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (role === 'provider') {
      navigate('/provider/dashboard');
    } else if (role === 'employer') {
      navigate('/employer/dashboard');
    } else if (role === 'trainee') {
      navigate('/trainee/home');
    } else if (role === 'government') {
      navigate('/gov/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <AppLayout onOpenAuth={handleOpenAuth}>
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={
              <LandingPage
                onOpenLogin={(role) => role ? handleOpenAuth('login', role) : navigate('/login')}
                onOpenSignup={() => navigate('/signup')}
                onOpenWhatsApp={() => navigate('/whatsapp-simulator')}
                onExploreDashboard={handleExploreDashboard}
              />
            }
          />
          <Route
            path="/landing"
            element={
              <LandingPage
                onOpenLogin={(role) => role ? handleOpenAuth('login', role) : navigate('/login')}
                onOpenSignup={() => navigate('/signup')}
                onOpenWhatsApp={() => navigate('/whatsapp-simulator')}
                onExploreDashboard={handleExploreDashboard}
              />
            }
          />

          {/* Full-Page Themed Login & Signup Routes */}
          <Route path="/login" element={<AuthPage defaultMode="login" />} />
          <Route path="/signup" element={<AuthPage defaultMode="signup" />} />

          {/* WhatsApp Cloud SDK Interactive Simulation Flow */}
          <Route
            path="/whatsapp-simulator"
            element={<WhatsAppSimulationPage onNavigateHome={handleBackFromSimulator} />}
          />

          {/* Government Protected Routes */}
          <Route
            path="/gov/dashboard"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/dashboard"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/providers"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovProviders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/providers"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovProviders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/courses"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/courses"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/districts"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDistricts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/districts"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDistricts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/skill-gaps"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovSkillGaps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/skill-gaps"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovSkillGaps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/alerts"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovAlerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/alerts"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovAlerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/impact"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovImpact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/impact"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovImpact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/durability"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDurability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/durability"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDurability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/data-quality"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDataQuality />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/data-quality"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovDataQuality />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/privacy"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovPrivacy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/privacy"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovPrivacy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov/followups"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovFollowups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/followups"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <GovFollowups />
              </ProtectedRoute>
            }
          />

          {/* AI Intelligence */}
          <Route
            path="/gov/ai"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <AiAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/ai"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <AiAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai/analysis"
            element={
              <ProtectedRoute allowedRoles={['government']} onNavigateLogin={() => handleOpenAuth('login', 'government')}>
                <AiAnalysis />
              </ProtectedRoute>
            }
          />

          {/* Training Institute Protected Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['provider']} onNavigateLogin={() => handleOpenAuth('login', 'provider')}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/durability"
            element={
              <ProtectedRoute allowedRoles={['provider']} onNavigateLogin={() => handleOpenAuth('login', 'provider')}>
                <ProviderDurability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/trainees"
            element={
              <ProtectedRoute allowedRoles={['provider']} onNavigateLogin={() => handleOpenAuth('login', 'provider')}>
                <ProviderTrainees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/trainees/:id"
            element={
              <ProtectedRoute allowedRoles={['provider']} onNavigateLogin={() => handleOpenAuth('login', 'provider')}>
                <TraineeProfileView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/batches"
            element={
              <ProtectedRoute allowedRoles={['provider']} onNavigateLogin={() => handleOpenAuth('login', 'provider')}>
                <ProviderBatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/followups"
            element={
              <ProtectedRoute allowedRoles={['provider']} onNavigateLogin={() => handleOpenAuth('login', 'provider')}>
                <ProviderFollowups />
              </ProtectedRoute>
            }
          />

          {/* Employer Protected Routes */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employer']} onNavigateLogin={() => handleOpenAuth('login', 'employer')}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/hires"
            element={
              <ProtectedRoute allowedRoles={['employer']} onNavigateLogin={() => handleOpenAuth('login', 'employer')}>
                <EmployerHires />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/demand"
            element={
              <ProtectedRoute allowedRoles={['employer']} onNavigateLogin={() => handleOpenAuth('login', 'employer')}>
                <EmployerDemand />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/register"
            element={
              <ProtectedRoute allowedRoles={['employer']} onNavigateLogin={() => handleOpenAuth('login', 'employer')}>
                <EmployerRegister />
              </ProtectedRoute>
            }
          />

          {/* Trainee Portal Protected Routes */}
          <Route
            path="/trainee/home"
            element={
              <ProtectedRoute allowedRoles={['trainee']} onNavigateLogin={() => handleOpenAuth('login', 'trainee')}>
                <TraineePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainee/profile"
            element={
              <ProtectedRoute allowedRoles={['trainee']} onNavigateLogin={() => handleOpenAuth('login', 'trainee')}>
                <TraineePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainee/followup"
            element={
              <ProtectedRoute allowedRoles={['trainee']} onNavigateLogin={() => handleOpenAuth('login', 'trainee')}>
                <TraineePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainee/consent"
            element={
              <ProtectedRoute allowedRoles={['trainee']} onNavigateLogin={() => handleOpenAuth('login', 'trainee')}>
                <TraineePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainee/jobs"
            element={
              <ProtectedRoute allowedRoles={['trainee']} onNavigateLogin={() => handleOpenAuth('login', 'trainee')}>
                <TraineePortal />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>

      {/* Global Authentication / Trainee Registration Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
        defaultRole={authRole}
        onSuccess={() => {
          setAuthOpen(false);
          handleExploreDashboard();
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
