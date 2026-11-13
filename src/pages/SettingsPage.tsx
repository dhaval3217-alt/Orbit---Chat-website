import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { api } from '../services/api.js';
import {
  UserX,
  Volume2,
  ArrowLeft,
  Smartphone,
  MapPin,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { showToast } = useUiStore();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [joinMuted, setJoinMuted] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    api.get<any[]>('/safety/blocked').then(setBlockedUsers).catch(console.error);
  }, []);

  const handleUnblock = async (blockedId: string) => {
    try {
      await api.delete(`/safety/block/${blockedId}`);
      setBlockedUsers(blockedUsers.filter((b) => b.blocked_id !== blockedId));
      showToast('success', 'User unblocked');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to unblock user');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-8">
      {/* Mobile Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white active-scale touch-target"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">App Settings</h1>
          <p className="text-[11px] text-slate-400">Audio, notifications, and safety</p>
        </div>
      </div>

      <div className="p-5 sm:p-7 rounded-3xl bg-[#121824] border border-white/10 shadow-xl space-y-6">
        {/* Audio & Room Preferences */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-indigo-400" />
            Audio Preferences
          </h3>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs text-slate-300">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="pr-4">
                <p className="font-bold text-white text-sm">Join Rooms Muted by Default</p>
                <p className="text-slate-400 text-[11px]">Keep your mic muted when entering any audio lounge</p>
              </div>
              <input
                type="checkbox"
                checked={joinMuted}
                onChange={(e) => setJoinMuted(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer"
              />
            </label>

            <div className="h-[1px] bg-white/5" />

            <label className="flex items-center justify-between cursor-pointer">
              <div className="pr-4">
                <p className="font-bold text-white text-sm">Real-Time Noise Suppression</p>
                <p className="text-slate-400 text-[11px]">Filter out keyboard clicks, wind, and background hum</p>
              </div>
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Mobile & Presence Controls */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-cyan-400" />
            Device & Alerts
          </h3>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="font-bold text-white text-sm">Private Chat Location Sharing</p>
                <p className="text-slate-400 text-[11px]">Location permission is requested only when you turn it on in an active chat</p>
              </div>
              <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
            </div>

            <div className="h-[1px] bg-white/5" />

            <label className="flex items-center justify-between cursor-pointer">
              <div className="pr-4">
                <p className="font-bold text-white text-sm">Connection Push Notifications</p>
                <p className="text-slate-400 text-[11px]">Receive notification when a friend requests identity reveal</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Blocked Users Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <UserX className="h-4 w-4 text-rose-400" />
            Blocked Users ({blockedUsers.length})
          </h3>
          {blockedUsers.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 text-center">
              No blocked users on your account.
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((b) => (
                <div
                  key={b.id || b.blocked_id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs"
                >
                  <div>
                    <p className="text-slate-200 font-bold">Blocked User</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {b.blocked_id?.slice(0, 12)}...</p>
                  </div>
                  <button
                    onClick={() => handleUnblock(b.blocked_id)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold border border-rose-500/20 active-scale touch-target"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Management */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-white">Active Session</p>
            <p className="text-[11px] text-slate-400">Signed in with phone {user?.phone}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all active-scale touch-target text-center"
          >
            Log Out of Orbit
          </button>
        </div>
      </div>
    </div>
  );
};
