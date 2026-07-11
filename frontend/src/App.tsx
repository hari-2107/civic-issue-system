import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { NotificationProvider, useNotifications } from './context/NotificationContext.js';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintFormPage from './pages/ComplaintFormPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import FeedbackPage from './pages/FeedbackPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyTerms from './pages/PrivacyTerms';

// Layout shell
import MainLayout from './layouts/MainLayout';

// Close notification toast close icon
import { X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { toasts, removeToast } = useNotifications();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [navigationParams, setNavigationParams] = useState<Record<string, any>>({});

  const handleNavigate = (page: string, params: Record<string, any> = {}) => {
    setCurrentPage(page);
    setNavigationParams(params);
  };

  // Safe navigation mapping based on authorization guard rules
  const renderRoutedPage = () => {
    // If loading context indices
    if (loading) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <div className="skeleton skeleton-avatar" style={{ width: '64px', height: '64px' }} />
        </div>
      );
    }

    // Static layouts outside dashboard main wrapper
    if (currentPage === 'landing') return <LandingPage onNavigate={handleNavigate} />;
    if (currentPage === 'login') {
      if (isAuthenticated) {
        setCurrentPage('dashboard');
        return null;
      }
      return <LoginPage onNavigate={handleNavigate} />;
    }
    if (currentPage === 'register') {
      if (isAuthenticated) {
        setCurrentPage('dashboard');
        return null;
      }
      return <RegisterPage onNavigate={handleNavigate} />;
    }
    if (currentPage === 'reset-password') return <ResetPasswordPage onNavigate={handleNavigate} />;
    if (currentPage === 'privacy-policy') return <PrivacyTerms type="privacy" onNavigate={handleNavigate} />;
    if (currentPage === 'terms') return <PrivacyTerms type="terms" onNavigate={handleNavigate} />;

    // Authenticated Routing Protection guard redirection
    if (!isAuthenticated) {
      setCurrentPage('login');
      return null;
    }

    // Main dashboards router mapping inside navigation sidebar layout
    if (currentPage === 'dashboard') {
      return isAdmin ? (
        <AdminDashboard onNavigate={handleNavigate} />
      ) : (
        <CitizenDashboard onNavigate={handleNavigate} />
      );
    }

    if (currentPage === 'complaints') {
      return isAdmin ? (
        <AdminDashboard onNavigate={handleNavigate} onlyTable={true} />
      ) : (
        <CitizenDashboard onNavigate={handleNavigate} onlyList={true} />
      );
    }

    if (currentPage === 'file-complaint' && !isAdmin) {
      return <ComplaintFormPage onNavigate={handleNavigate} />;
    }

    if (currentPage === 'complaint-detail') {
      return (
        <ComplaintDetailsPage
          complaintId={Number(navigationParams.id)}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentPage === 'profile') {
      return <ProfilePage />;
    }

    if (currentPage === 'users' && isAdmin) {
      return <UsersPage />;
    }

    if (currentPage === 'feedback' && isAdmin) {
      return <FeedbackPage />;
    }

    // Default Fallback Not Found state
    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  const showWrapper = isAuthenticated && ![
    'landing', 'login', 'register', 'reset-password', 'privacy-policy', 'terms'
  ].includes(currentPage);

  return (
    <>
      {showWrapper ? (
        <MainLayout activeTab={currentPage} setActiveTab={handleNavigate}>
          {renderRoutedPage()}
        </MainLayout>
      ) : (
        renderRoutedPage()
      )}

      {/* Global Toast Banner Portal Overlay */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 650 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
