import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useMoodStore } from '../../store/moodStore.js';
import { useConnectionStore } from '../../store/connectionStore.js';
import { SafetyGuidelinesModal } from '../safety/SafetyGuidelinesModal.js';
import {
  Compass,
  Radio,
  Sparkles,
  MessageCircle,
  Users,
  Bell,
  Shield,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const { onlineCount, selectedMood } = useMoodStore();
  const { connections } = useConnectionStore();
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const isCurrent = (path: string) => location.pathname === path;

  const pendingCount = connections.filter(
    (c) => c.status === 'PENDING' && c.recipient_id === user?.id
  ).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0d14]/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo with Live Orbit Pulse */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 group active-scale touch-target"
          >
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0a0d14]">
                <Radio className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                Orbit
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  LIVE
                </span>
              </span>
              <span className="hidden sm:inline text-[9px] text-slate-400 tracking-wider uppercase font-semibold">
                Social Audio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent('/dashboard')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="h-4 w-4" />
                Explore
              </Link>

              <Link
                to="/moods"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent('/moods')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Vibes
                {selectedMood && (
                  <span
                    className="inline-block w-2 h-2 rounded-full animate-ping"
                    style={{ backgroundColor: selectedMood.color || '#06b6d4' }}
                  />
                )}
              </Link>

              <Link
                to="/lets-chat"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent('/lets-chat')
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Let&apos;s Chat
              </Link>

              <Link
                to="/connections"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isCurrent('/connections')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                Connections
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </Link>

              {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-purple-300 hover:text-purple-100 hover:bg-purple-500/10'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>
          )}

          {/* Right Section: Online Pill, Safety Info, Notifications, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Live Online Users Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{onlineCount}</span>
                  <span className="hidden sm:inline">Online</span>
                </div>

                {/* Safety Guidelines Modal Trigger */}
                <button
                  onClick={() => setShowSafetyModal(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors active-scale touch-target flex items-center justify-center"
                  title="Safety & Community Guidelines"
                  aria-label="Safety Guidelines"
                >
                  <ShieldAlert className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </button>

                {/* Notifications Button */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors active-scale touch-target flex items-center justify-center"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  {pendingCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 px-1 rounded-full bg-rose-500 text-[9px] font-extrabold text-white flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </Link>

                {/* Mobile & Desktop User Avatar */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all active-scale"
                  aria-label="View Profile"
                >
                  <img
                    src={
                      profile?.avatar_url ||
                      'https://api.dicebear.com/7.x/bottts/svg?seed=OrbitUser'
                    }
                    alt={profile?.display_name || 'User'}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-indigo-950 p-0.5 object-cover"
                  />
                  <span className="hidden sm:inline text-xs font-bold text-slate-200 line-clamp-1">
                    {profile?.display_name || 'Profile'}
                  </span>
                </Link>

                {/* Desktop Logout Button */}
                <button
                  onClick={() => logout()}
                  className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 active-scale transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Safety Guidelines Modal */}
      <SafetyGuidelinesModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
      />
    </>
  );
};
