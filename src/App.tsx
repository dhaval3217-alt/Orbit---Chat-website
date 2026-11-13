import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { MobileBottomNav } from './components/layout/MobileBottomNav.js';
import { PageContainer } from './components/layout/PageContainer.js';
import { AppRoutes } from './routes/AppRoutes.js';
import { ToastContainer } from './components/common/Toast.js';
import { ReportModal } from './components/safety/ReportModal.js';
import { BlockModal } from './components/safety/BlockModal.js';
import { ConnectionModal } from './components/profile/ConnectionModal.js';
import { NetworkStatusBanner } from './components/common/NetworkStatusBanner.js';

export const App: React.FC = () => {
  const location = useLocation();
  const { initAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  const isPublicPage = ['/', '/splash', '/login', '/verify-otp', '/register', '/verify-email', '/forgot-password', '/reset-password'].includes(location.pathname);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#0a0d14] text-slate-100">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-2xl shadow-indigo-500/30 animate-pulse mb-4">
          <div className="flex h-full w-full items-center justify-center rounded-[23px] bg-[#0a0d14]">
            <span className="text-xl font-bold text-indigo-400">O</span>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
          Connecting to Orbit Network...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0d14] text-slate-100 selection:bg-indigo-500/30">
      <NetworkStatusBanner />
      <Navbar />

      <div className="flex flex-1 relative">
        {isAuthenticated && !isPublicPage && <Sidebar />}

        <main className="flex-1 w-full min-w-0">
          {isPublicPage ? (
            <AppRoutes />
          ) : (
            <PageContainer>
              <AppRoutes />
            </PageContainer>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Authenticated users */}
      {isAuthenticated && !isPublicPage && <MobileBottomNav />}

      {/* Global Modals & Notifications */}
      <ReportModal />
      <BlockModal />
      <ConnectionModal />
      <ToastContainer />
    </div>
  );
};

export default App;
