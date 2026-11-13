import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import {
  Compass,
  Sparkles,
  MessageCircle,
  Users,
  Shield,
  Settings,
  User,
  Radio,
  QrCode,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-[#0a0d14]/50 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <div className="mt-2 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCurrent('/dashboard')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="h-4 w-4 text-indigo-400" />
              Explore Rooms
            </Link>

            <Link
              to="/moods"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCurrent('/moods')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Vibe Matching
            </Link>

            <Link
              to="/lets-chat"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCurrent('/lets-chat')
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageCircle className="h-4 w-4 text-purple-400" />
              Let&apos;s Chat
            </Link>

            <Link
              to="/connections"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCurrent('/connections')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="h-4 w-4 text-purple-400" />
              My Connections
            </Link>

            <Link
              to="/security"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                (location.pathname.startsWith('/security') || location.pathname === '/threat-detection')
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              Threat Detection
            </Link>

            <Link
              to="/security/qr"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCurrent('/security/qr')
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode className="h-4 w-4 text-cyan-400" />
              Live QR Scanner
            </Link>
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account & Safety
          </p>
          <div className="mt-2 space-y-1">
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCurrent('/profile')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="h-4 w-4 text-slate-400" />
              Profile
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCurrent('/settings')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings & Privacy
            </Link>
          </div>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-purple-400">
              Moderation
            </p>
            <div className="mt-2 space-y-1">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isCurrent('/admin/dashboard')
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <Shield className="h-4 w-4 text-purple-400" />
                Admin Dashboard
              </Link>
              <Link
                to="/admin/reports"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isCurrent('/admin/reports')
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <Radio className="h-4 w-4 text-purple-400" />
                Moderation Reports
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
