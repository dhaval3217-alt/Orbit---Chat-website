import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.js';
import { AdminRoute } from './AdminRoute.js';

// Base & Auth Pages
import { SplashPage } from '../pages/SplashPage.js';
import { LandingPage } from '../pages/LandingPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { OtpVerifyPage } from '../pages/OtpVerifyPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { EmailVerifyPage } from '../pages/EmailVerifyPage.js';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/ResetPasswordPage.js';
import { ProfileSetupPage } from '../pages/ProfileSetupPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { MoodSelectionPage } from '../pages/MoodSelectionPage.js';
import { MatchWaitingPage } from '../pages/MatchWaitingPage.js';
import { MatchFoundPage } from '../pages/MatchFoundPage.js';
import { RoomPage } from '../pages/RoomPage.js';
import { ProfilePage } from '../pages/ProfilePage.js';
import { SettingsPage } from '../pages/SettingsPage.js';
import { NotificationsPage } from '../pages/NotificationsPage.js';
import { ConnectionsPage } from '../pages/ConnectionsPage.js';
import { SecurityDashboardPage } from '../pages/SecurityDashboardPage.js';

// Dedicated Vibe Hub Pages
import { MusicVibePage } from '../pages/MusicVibePage.js';
import { GamingVibePage } from '../pages/GamingVibePage.js';
import { FitnessVibePage } from '../pages/FitnessVibePage.js';
import { MoviesVibePage } from '../pages/MoviesVibePage.js';
import { TravelVibePage } from '../pages/TravelVibePage.js';
import { LetsChatPage } from '../pages/LetsChatPage.js';

// Admin Moderation Pages
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { AdminReportsPage } from '../pages/AdminReportsPage.js';
import { AdminUsersPage } from '../pages/AdminUsersPage.js';
import { AdminRoomsPage } from '../pages/AdminRoomsPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<OtpVerifyPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<EmailVerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated Base Pages */}
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moods"
        element={
          <ProtectedRoute>
            <MoodSelectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matching"
        element={
          <ProtectedRoute>
            <MatchWaitingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/match-found"
        element={
          <ProtectedRoute>
            <MatchFoundPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <RoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lets-chat"
        element={
          <ProtectedRoute>
            <LetsChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="/walk-and-talk" element={<Navigate to="/lets-chat" replace />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <ConnectionsPage />
          </ProtectedRoute>
        }
      />

      {/* Dedicated Vibe Pages */}
      <Route
        path="/music"
        element={
          <ProtectedRoute>
            <MusicVibePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gaming"
        element={
          <ProtectedRoute>
            <GamingVibePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/threat-detection"
        element={<Navigate to="/security" replace />}
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <SecurityDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/:scanner"
        element={
          <ProtectedRoute>
            <SecurityDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fitness"
        element={
          <ProtectedRoute>
            <FitnessVibePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies"
        element={
          <ProtectedRoute>
            <MoviesVibePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/travel"
        element={
          <ProtectedRoute>
            <TravelVibePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/just-talk"
        element={<Navigate to="/lets-chat" replace />}
      />

      {/* Admin Protected Pages */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <AdminRoute>
            <AdminRoomsPage />
          </AdminRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
