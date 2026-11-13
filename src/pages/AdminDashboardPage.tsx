import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore.js';
import {
  Shield,
  Users,
  Radio,
  AlertTriangle,
  UserX,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#121824] to-slate-900 border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Orbit Admin & Moderation Console
              </h1>
              <p className="text-xs sm:text-sm text-purple-300">
                Live metrics, reports resolution, and community governance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" />
              Manage Reports ({stats?.pendingReports || 0})
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#121824] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {stats?.onlineUsers || 0} Online right now
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121824] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Audio Rooms</span>
            <Radio className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.activeRooms || 0}</p>
          <Link to="/admin/rooms" className="text-[11px] text-cyan-400 hover:underline mt-1 block">
            Inspect active lounges →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#121824] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Reports</span>
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400">{stats?.pendingReports || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total {stats?.totalReports || 0} recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121824] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Moderation Actions</span>
            <UserX className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{stats?.bannedUsers || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Banned accounts • {stats?.totalBlocks || 0} user blocks</p>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/reports"
          className="p-6 rounded-3xl bg-[#121824] border border-white/10 hover:border-purple-500/40 hover:bg-[#182030] transition-all group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300">
            Moderation Reports
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Review user-submitted reports, toxic language flags, and issue warnings or mutes.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-[#121824] border border-white/10 hover:border-purple-500/40 hover:bg-[#182030] transition-all group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300">
            User Governance
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Manage roles (User, Moderator, Admin), view ban states, and search user accounts.
          </p>
        </Link>

        <Link
          to="/admin/rooms"
          className="p-6 rounded-3xl bg-[#121824] border border-white/10 hover:border-purple-500/40 hover:bg-[#182030] transition-all group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4">
            <Radio className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300">
            Room Operations
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Monitor active live audio lounges and terminate disruptive sessions if needed.
          </p>
        </Link>
      </div>
    </div>
  );
};
