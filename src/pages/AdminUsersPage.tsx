import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../store/adminStore.js';
import { useUiStore } from '../store/uiStore.js';
import { UserRole } from '../types/index.js';
import { Users, Search, Ban, VolumeX } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { users, fetchUsers, updateUserRole, banUser, muteUser } = useAdminStore();
  const { showToast } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers({ search: searchTerm || undefined, role: roleFilter || undefined });
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({ search: searchTerm || undefined, role: roleFilter || undefined });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      showToast('success', `User role updated to ${newRole}`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update role');
    }
  };

  const handleBanToggle = async (userId: string, currentBanned: boolean) => {
    try {
      await banUser(userId, !currentBanned);
      showToast('success', !currentBanned ? 'User banned' : 'User unbanned');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update ban status');
    }
  };

  const handleMuteToggle = async (userId: string, currentMuted: boolean) => {
    try {
      await muteUser(userId, !currentMuted);
      showToast('success', !currentMuted ? 'User muted' : 'User unmuted');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update mute status');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#121824] border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            User Governance & Roles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search user accounts, promote moderators, and manage platform sanctions.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search alias or phone..."
              className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="" className="bg-[#121824]">All Roles</option>
            <option value="USER" className="bg-[#121824]">User</option>
            <option value="MODERATOR" className="bg-[#121824]">Moderator</option>
            <option value="ADMIN" className="bg-[#121824]">Admin</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#121824] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Anon'}
                      alt=""
                      className="h-8 w-8 rounded-xl bg-indigo-950 p-0.5 border border-white/10"
                    />
                    <div>
                      <span className="font-bold text-white block">{u.display_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{u.id}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono">{u.phone}</td>

                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    >
                      <option value="USER" className="bg-[#121824]">USER</option>
                      <option value="MODERATOR" className="bg-[#121824]">MODERATOR</option>
                      <option value="ADMIN" className="bg-[#121824]">ADMIN</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.is_banned ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Active
                        </span>
                      )}
                      {u.is_muted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          Muted
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMuteToggle(u.id, u.is_muted)}
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          u.is_muted
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                        title={u.is_muted ? 'Unmute' : 'Mute'}
                      >
                        <VolumeX className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleBanToggle(u.id, u.is_banned)}
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          u.is_banned
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-white/5 text-slate-400 hover:text-rose-400'
                        }`}
                        title={u.is_banned ? 'Unban' : 'Ban'}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
