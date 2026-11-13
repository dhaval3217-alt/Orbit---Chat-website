import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore.js';
import { useConnectionStore } from '../store/connectionStore.js';
import { useUiStore } from '../store/uiStore.js';
import {
  Bell,
  Sparkles,
  UserPlus,
  ArrowLeft,
  Check,
  X,
  Footprints,
  PhoneCall,
  Gamepad2,
  Heart,
  MessageSquare,
  ShieldAlert,
  CheckCheck,
} from 'lucide-react';

const CATEGORIES = ['All', 'Connection', 'Talk', 'Game', 'Likes', 'System'];

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    initSocketListeners,
  } = useNotificationStore();

  const { incomingRequests, fetchConnections, respondToRequest } = useConnectionStore();
  const { showToast } = useUiStore();

  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    fetchNotifications();
    fetchConnections();
    const unsub = initSocketListeners();
    return () => {
      unsub();
    };
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Connection') return n.type.includes('CONNECTION') || n.type.includes('REQUEST');
    if (selectedFilter === 'Talk') return n.type.includes('TALK');
    if (selectedFilter === 'Game') return n.type.includes('GAME');
    if (selectedFilter === 'Likes') return n.type.includes('LIKE') || n.type.includes('COMMENT');
    if (selectedFilter === 'System') return n.type.includes('SYSTEM') || n.type.includes('REPORT');
    return true;
  });

  const getNotificationIcon = (type: string) => {
    if (type.includes('CONNECTION')) return <UserPlus className="w-4 h-4 text-indigo-400" />;
    if (type.includes('TALK')) return <PhoneCall className="w-4 h-4 text-blue-400" />;
    if (type.includes('GAME')) return <Gamepad2 className="w-4 h-4 text-pink-400" />;
    if (type.includes('LIKE')) return <Heart className="w-4 h-4 text-rose-400" />;
    if (type.includes('COMMENT')) return <MessageSquare className="w-4 h-4 text-cyan-400" />;
    if (type.includes('LOCATION')) return <Footprints className="w-4 h-4 text-emerald-400" />;
    if (type.includes('REPORT')) return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
    return <Sparkles className="w-4 h-4 text-purple-400" />;
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    if (n.data?.link) {
      navigate(n.data.link);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-28 text-white p-4 sm:p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-xs font-bold animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Connection requests, talk alerts, game invites & updates</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-indigo-400" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-[#0d111c] border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pending Connection Requests Urgent Bar */}
      {incomingRequests.length > 0 && selectedFilter === 'All' && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-[#0d111c] border border-indigo-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400 animate-pulse" />
              Incoming Connection Requests ({incomingRequests.length})
            </h3>
            <button
              onClick={() => navigate('/connections')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incomingRequests.map((req) => {
              const displayName = req.partner?.display_name || req.requester?.display_name || 'Orbit User';
              const username = req.partner?.username || req.requester?.username || 'user';
              const avatar = req.partner?.avatar_url || req.requester?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

              return (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover border border-indigo-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{displayName}</div>
                      <div className="text-[10px] text-gray-400 truncate">@{username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={async () => {
                        await respondToRequest(req.id, 'ACCEPT');
                        showToast('success', 'Connection accepted!');
                      }}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        await respondToRequest(req.id, 'DECLINE');
                        showToast('info', 'Connection declined.');
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0d111c] border border-white/10 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No notifications yet</h3>
            <p className="text-gray-400 text-xs">
              When friends connect, invite you to talk, or challenge you to games, you'll see alerts here!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                !notif.is_read
                  ? 'bg-gradient-to-r from-indigo-950/40 to-[#0d111c] border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                  : 'bg-[#0d111c] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Icon Container */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                {getNotificationIcon(notif.type)}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-2">{notif.message}</p>

                {/* Inline Action helper links */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                    {notif.type.replace(/_/g, ' ')}
                  </span>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
