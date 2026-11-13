import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectionStore, SuggestedUser } from '../store/connectionStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { useTalkStore } from '../store/talkStore.js';
import { Connection } from '../types/index.js';
import {
  Users,
  UserPlus,
  Clock,
  Sparkles,
  Check,
  X,
  Trash2,
  Radio,
  MessageCircle,
  Search,
  ShieldCheck,
  Unlock,
} from 'lucide-react';

export const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    myConnections,
    incomingRequests,
    sentRequests,
    suggestedUsers,
    fetchConnections,
    sendRequest,
    respondToRequest,
    cancelRequest,
    removeConnection,
    consentToReveal,
    isLoading,
    initSocketListeners,
  } = useConnectionStore();
  const { sendTalkRequest } = useTalkStore();
  const { showToast } = useUiStore();

  const [activeTab, setActiveTab] = useState<'connections' | 'incoming' | 'sent' | 'suggested'>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
    const unsub = initSocketListeners();
    return () => unsub();
  }, []);

  const handleSendRequest = async (targetUserId: string) => {
    setActionLoadingId(targetUserId);
    try {
      await sendRequest(targetUserId);
      showToast('success', 'Connection request sent!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRespond = async (connectionId: string, action: 'ACCEPT' | 'REJECT') => {
    setActionLoadingId(connectionId);
    try {
      await respondToRequest(connectionId, action);
      showToast(action === 'ACCEPT' ? 'success' : 'info', action === 'ACCEPT' ? 'Connection accepted! 🎉' : 'Request rejected.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to respond to request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    setActionLoadingId(connectionId);
    try {
      await cancelRequest(connectionId);
      showToast('info', 'Connection request cancelled.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to cancel request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    setActionLoadingId(connectionId);
    try {
      await removeConnection(connectionId);
      showToast('info', 'Connection removed.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove connection');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartTalk = async (partnerId: string) => {
    try {
      await sendTalkRequest(partnerId);
      showToast('success', "Chat invitation sent! Opening Let's Chat.");
      navigate('/lets-chat');
    } catch (err: any) {
      showToast('error', err.message || 'Could not start talk');
    }
  };

  const handleConsent = async (connectionId: string) => {
    try {
      await consentToReveal(connectionId, true);
      showToast('success', 'Reveal consent submitted! Real identities unlock mutually.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update consent');
    }
  };

  // Filter lists by search
  const filterBySearch = (list: any[], nameKey: string) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((item) => {
      const name = item.partner?.[nameKey] || item[nameKey] || '';
      const bio = item.partner?.bio || item.bio || '';
      return name.toLowerCase().includes(q) || bio.toLowerCase().includes(q);
    });
  };

  const filteredConnections = filterBySearch(myConnections, 'display_name');
  const filteredIncoming = filterBySearch(incomingRequests, 'display_name');
  const filteredSent = filterBySearch(sentRequests, 'display_name');
  const filteredSuggested = filterBySearch(suggestedUsers, 'display_name');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#121824] via-purple-950/40 to-[#121824] border border-purple-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Connections & Network
              </h1>
              <p className="mt-0.5 text-xs text-slate-300">
                Discover peers, manage real-time requests, and stay connected.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, vibes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* 4 Dedicated Section Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'connections'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>My Connections ({myConnections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('incoming')}
            className={`py-2.5 px-3 rounded-xl font-bold transition-all relative flex items-center justify-center gap-2 ${
              activeTab === 'incoming'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Incoming</span>
            {incomingRequests.length > 0 && (
              <span className="min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Sent ({sentRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suggested')}
            className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'suggested'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Suggested ({suggestedUsers.length})</span>
          </button>
        </div>
      </div>

      {/* 1. MY CONNECTIONS TAB */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <span>Connected Friends ({filteredConnections.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Personal identities unlock mutually upon consent
            </span>
          </div>

          {filteredConnections.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#121824] border border-white/10 text-center space-y-3 shadow-xl">
              <Users className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No connections yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore suggested users or chat in live audio lounges to connect with peers!
              </p>
              <button
                onClick={() => setActiveTab('suggested')}
                className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Find Suggested Users
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((conn) => {
                const partner = conn.partner;
                const isMutual = conn.status === 'REVEAL_MUTUAL' || partner?.is_revealed;
                const isRequester = conn.requester_id === user?.id;
                const myConsent = isRequester
                  ? conn.requester_consent_reveal
                  : conn.recipient_consent_reveal;

                return (
                  <div
                    key={conn.id}
                    className="p-5 rounded-3xl bg-[#121824] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
                  >
                    {/* User Card Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={
                              partner?.avatar_url ||
                              'https://api.dicebear.com/7.x/bottts/svg?seed=Friend'
                            }
                            alt={partner?.display_name}
                            className="h-13 w-13 rounded-2xl bg-indigo-950 p-1 border border-white/10 object-cover"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[#121824] ${
                              partner?.is_online ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                            title={partner?.is_online ? 'Online' : 'Offline'}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            {partner?.display_name || 'Orbit Explorer'}
                          </h3>
                          {partner?.real_name && isMutual && (
                            <p className="text-[11px] font-semibold text-purple-300">
                              {partner.real_name}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                              style={{
                                backgroundColor: `${partner?.vibe_color || '#6366f1'}15`,
                                color: partner?.vibe_color || '#6366f1',
                                borderColor: `${partner?.vibe_color || '#6366f1'}30`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: partner?.vibe_color || '#6366f1' }}
                              />
                              <span>{partner?.current_vibe || 'Orbit'}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {partner?.is_online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Connected</span>
                      </span>
                    </div>

                    {/* Bio */}
                    {partner?.bio && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        {partner.bio}
                      </p>
                    )}

                    {/* Mutual Reveal Banner */}
                    {isMutual && partner?.real_bio && (
                      <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
                        <span className="font-bold">Verified Bio:</span> {partner.real_bio}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartTalk(partner!.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 active-scale touch-target"
                        >
                          <Radio className="h-3.5 w-3.5" />
                          <span>Start Audio</span>
                        </button>

                        <button
                          onClick={() => navigate('/lets-chat')}
                          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5 active-scale touch-target"
                          title="Message"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Chat</span>
                        </button>

                        <button
                          onClick={() => handleRemoveConnection(conn.id)}
                          disabled={actionLoadingId === conn.id}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all active-scale touch-target"
                          title="Remove Connection"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {!isMutual && (
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-slate-400">
                            {myConsent ? 'Consent sent (waiting for peer)' : 'Real identity locked'}
                          </span>
                          {!myConsent && (
                            <button
                              onClick={() => handleConsent(conn.id)}
                              className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                            >
                              <Unlock className="h-3 w-3" />
                              <span>Consent to Reveal</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. INCOMING REQUESTS TAB */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-purple-400" />
            <span>Incoming Connection Requests ({filteredIncoming.length})</span>
          </h2>

          {filteredIncoming.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#121824] border border-white/10 text-center space-y-2 shadow-xl">
              <Check className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">All caught up!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No pending incoming connection requests right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIncoming.map((conn) => {
                const partner = conn.partner;

                return (
                  <div
                    key={conn.id}
                    className="p-5 rounded-3xl bg-[#121824] border border-purple-500/30 flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={
                              partner?.avatar_url ||
                              'https://api.dicebear.com/7.x/bottts/svg?seed=Friend'
                            }
                            alt={partner?.display_name}
                            className="h-12 w-12 rounded-2xl bg-indigo-950 p-1 border border-white/10 object-cover"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[#121824] ${
                              partner?.is_online ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {partner?.display_name || 'Orbit Explorer'}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                              style={{
                                backgroundColor: `${partner?.vibe_color || '#6366f1'}15`,
                                color: partner?.vibe_color || '#6366f1',
                                borderColor: `${partner?.vibe_color || '#6366f1'}30`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: partner?.vibe_color || '#6366f1' }}
                              />
                              <span>{partner?.current_vibe || 'Orbit'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                      </span>
                    </div>

                    {partner?.bio && (
                      <p className="text-xs text-slate-300 line-clamp-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        {partner.bio}
                      </p>
                    )}

                    {/* Accept / Reject Buttons */}
                    <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(conn.id, 'ACCEPT')}
                        disabled={actionLoadingId === conn.id}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active-scale touch-target"
                      >
                        <Check className="h-4 w-4" />
                        <span>Accept Request</span>
                      </button>

                      <button
                        onClick={() => handleRespond(conn.id, 'REJECT')}
                        disabled={actionLoadingId === conn.id}
                        className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-white/10 transition-all flex items-center justify-center gap-1 active-scale touch-target"
                        title="Reject Request"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. SENT REQUESTS TAB */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <span>Sent Requests Awaiting Response ({filteredSent.length})</span>
          </h2>

          {filteredSent.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#121824] border border-white/10 text-center space-y-2 shadow-xl">
              <Clock className="h-8 w-8 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No pending sent requests</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore suggested users to connect with fellow explorers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSent.map((conn) => {
                const partner = conn.partner;

                return (
                  <div
                    key={conn.id}
                    className="p-5 rounded-3xl bg-[#121824] border border-white/10 flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={
                              partner?.avatar_url ||
                              'https://api.dicebear.com/7.x/bottts/svg?seed=Friend'
                            }
                            alt={partner?.display_name}
                            className="h-12 w-12 rounded-2xl bg-indigo-950 p-1 border border-white/10 object-cover"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[#121824] ${
                              partner?.is_online ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {partner?.display_name || 'Orbit Explorer'}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                              style={{
                                backgroundColor: `${partner?.vibe_color || '#6366f1'}15`,
                                color: partner?.vibe_color || '#6366f1',
                                borderColor: `${partner?.vibe_color || '#6366f1'}30`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: partner?.vibe_color || '#6366f1' }}
                              />
                              <span>{partner?.current_vibe || 'Orbit'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                        <span>Request Sent</span>
                      </span>
                    </div>

                    {partner?.bio && (
                      <p className="text-xs text-slate-300 line-clamp-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        {partner.bio}
                      </p>
                    )}

                    {/* Cancel Button */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Status: Pending</span>
                      <button
                        onClick={() => handleCancelRequest(conn.id)}
                        disabled={actionLoadingId === conn.id}
                        className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-rose-500/15 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 active-scale touch-target"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel Request</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. SUGGESTED USERS TAB */}
      {activeTab === 'suggested' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Suggested Orbit Explorers ({filteredSuggested.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Matched based on presence and active vibes
            </span>
          </div>

          {filteredSuggested.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#121824] border border-white/10 text-center space-y-2 shadow-xl">
              <Sparkles className="h-8 w-8 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No suggested users found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You are connected with or have requests pending with all available members.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggested.map((userItem: SuggestedUser) => (
                <div
                  key={userItem.id}
                  className="p-5 rounded-3xl bg-[#121824] border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={userItem.avatar_url}
                          alt={userItem.display_name}
                          className="h-13 w-13 rounded-2xl bg-indigo-950 p-1 border border-white/10 object-cover"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[#121824] ${
                            userItem.is_online ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {userItem.display_name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                            style={{
                              backgroundColor: `${userItem.vibe_color || '#6366f1'}15`,
                              color: userItem.vibe_color || '#6366f1',
                              borderColor: `${userItem.vibe_color || '#6366f1'}30`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: userItem.vibe_color || '#6366f1' }}
                            />
                            <span>{userItem.current_vibe || 'Orbit'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {userItem.is_online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {userItem.bio && (
                    <p className="text-xs text-slate-300 line-clamp-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      {userItem.bio}
                    </p>
                  )}

                  {/* Send Request Action Button */}
                  <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                    <button
                      onClick={() => handleSendRequest(userItem.id)}
                      disabled={actionLoadingId === userItem.id}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 active-scale touch-target"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>
                        {actionLoadingId === userItem.id ? 'Sending...' : 'Send Request'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleStartTalk(userItem.id)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all flex items-center gap-1 active-scale touch-target"
                      title="Request to Talk"
                    >
                      <Radio className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Talk</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
