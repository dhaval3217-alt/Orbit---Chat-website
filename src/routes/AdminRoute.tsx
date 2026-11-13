import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-purple-400 text-xs font-semibold">
        Verifying moderation credentials...
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
