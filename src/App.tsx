import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import { SafeTravelProvider } from './contexts/SafeTravelContext';
import { useCurrentPage } from './hooks/useNavigate';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { ChatAssistant } from './components/common/ChatAssistant';

function AppContent() {
  const currentPage = useCurrentPage();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
    }
  }, [user, loading, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (user && currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'register') {
    return (
      <>
        <Dashboard />
        <ChatAssistant />
      </>
    );
  }

  switch (currentPage) {
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;
    case 'dashboard':
      return (
        <>
          {user ? <Dashboard /> : <LoginPage />}
          <ChatAssistant />
        </>
      );
    default:
      return (
        <>
          <LandingPage />
          <ChatAssistant />
        </>
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <SafeTravelProvider>
        <DemoProvider>
          <AppContent />
        </DemoProvider>
      </SafeTravelProvider>
    </AuthProvider>
  );
}


export default App;
