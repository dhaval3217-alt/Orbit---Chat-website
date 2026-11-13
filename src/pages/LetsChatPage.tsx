import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from '@livekit/components-react';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useTalkStore } from '../store/talkStore.js';
import { useConnectionStore } from '../store/connectionStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { api } from '../services/api.js';
import { socketClient } from '../socket/socketClient.js';
import { ChatPanel } from '../components/chat/ChatPanel.js';

interface Peer {
  id: string;
  display_name: string;
  username: string;
  avatar: string;
  bio?: string;
  current_vibe?: string;
  is_online?: boolean;
}

const VoiceControls: React.FC<{ muted: boolean; onMutedChange: (muted: boolean) => void }> = ({
  muted,
  onMutedChange,
}) => {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!localParticipant) return;
    localParticipant.setMicrophoneEnabled(!muted).catch((error: Error) => {
      console.error('Could not update microphone state:', error);
    });
  }, [localParticipant, muted]);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
      <RoomAudioRenderer />
      <span>Voice connected</span>
      <button
        type="button"
        onClick={() => onMutedChange(!muted)}
        className="ml-auto inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 font-bold hover:bg-white/15"
      >
        {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {muted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  );
};

export const LetsChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUiStore();
  const {
    incomingRequests,
    sentRequests,
    activeSession,
    fetchTalkRequests,
    sendTalkRequest,
    respondTalkRequest,
    endTalkSession,
    initSocketListeners,
    isLoading,
  } = useTalkStore();
  const { connections, suggestedUsers, fetchConnections, fetchSuggestedUsers } = useConnectionStore();

  const [requestingPeer, setRequestingPeer] = useState<string | null>(null);
  const [roomReady, setRoomReady] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [voiceToken, setVoiceToken] = useState<{ token: string; livekitUrl: string } | null>(null);
  const [locationOn, setLocationOn] = useState(false);
  const [locationRequestPending, setLocationRequestPending] = useState(false);
  const [liveStatusOn, setLiveStatusOn] = useState(false);
  const [partnerLocationOn, setPartnerLocationOn] = useState(false);
  const [partnerLiveStatus, setPartnerLiveStatus] = useState<boolean | null>(null);
  const [partnerOnline, setPartnerOnline] = useState<boolean | null>(null);
  const locationWatchId = useRef<number | null>(null);

  useEffect(() => {
    void fetchTalkRequests();
    void fetchConnections();
    void fetchSuggestedUsers();
    const unsubscribe = initSocketListeners();
    return unsubscribe;
  }, [fetchConnections, fetchSuggestedUsers, fetchTalkRequests, initSocketListeners]);

  const roomId = activeSession?.room.id;
  const partnerId = activeSession
    ? activeSession.request.requester_id === user?.id
      ? activeSession.request.recipient_id
      : activeSession.request.requester_id
    : null;

  useEffect(() => {
    if (!roomId) {
      setRoomReady(false);
      setVoiceOn(false);
      setVoiceToken(null);
      return;
    }

    let isCurrent = true;
    const rejoinSocketRoom = () => {
      socketClient.emit('room:join', { roomId, role: 'MEMBER' });
    };
    const joinPrivateChat = async () => {
      try {
        await api.post(`/rooms/${roomId}/join`, { role: 'MEMBER' });
        if (!isCurrent) return;
        const result = await socketClient.emitWithAck<{ ok: boolean; error?: string }>('room:join', {
          roomId,
          role: 'MEMBER',
        });
        if (!result.ok) throw new Error(result.error || 'Could not join the private chat');
        if (isCurrent) setRoomReady(true);
      } catch (error) {
        if (isCurrent) {
          showToast('error', error instanceof Error ? error.message : 'Could not join the private chat');
        }
      }
    };
    const unsubscribeReconnect = socketClient.on('connect', rejoinSocketRoom);
    void joinPrivateChat();
    return () => {
      isCurrent = false;
      unsubscribeReconnect();
      if (locationWatchId.current !== null) {
        navigator.geolocation?.clearWatch(locationWatchId.current);
        locationWatchId.current = null;
      }
      socketClient.emit('chat:location_stop', { roomId });
      socketClient.emit('chat:live_status', { roomId, enabled: false });
      socketClient.emit('room:leave', { roomId });
    };
  }, [roomId, showToast]);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribeLocation = socketClient.on('chat:location_update', (event: { roomId: string }) => {
      if (event.roomId === roomId) setPartnerLocationOn(true);
    });
    const unsubscribeLocationStop = socketClient.on('chat:location_stop', (event: { roomId: string }) => {
      if (event.roomId === roomId) setPartnerLocationOn(false);
    });
    const unsubscribeStatus = socketClient.on(
      'chat:live_status',
      (event: { roomId: string; enabled: boolean }) => {
        if (event.roomId === roomId) setPartnerLiveStatus(event.enabled);
      }
    );
    const unsubscribeEnded = socketClient.on('talk:session_ended', (event: { roomId: string }) => {
      if (event.roomId === roomId) {
        stopLocationSharing();
        setVoiceOn(false);
        setVoiceToken(null);
        setPartnerLocationOn(false);
        setRoomReady(false);
        void fetchTalkRequests();
      }
    });
    const unsubscribePresence = socketClient.on(
      'presence:update',
      (event: { userId: string; status: 'online' | 'offline' }) => {
        if (event.userId === partnerId) setPartnerOnline(event.status === 'online');
      }
    );
    return () => {
      unsubscribeLocation();
      unsubscribeLocationStop();
      unsubscribeStatus();
      unsubscribeEnded();
      unsubscribePresence();
    };
  }, [fetchTalkRequests, partnerId, roomId]);

  useEffect(() => {
    if (roomId) socketClient.emit('chat:live_status', { roomId, enabled: liveStatusOn });
  }, [liveStatusOn, roomId]);

  const peers = useMemo(() => {
    const toPeer = (peer: {
      id: string;
      display_name: string;
      username?: string;
      avatar?: string;
      avatar_url?: string;
      bio?: string;
      current_vibe?: string;
      is_online?: boolean;
    } | null | undefined): Peer | null => {
      if (!peer?.id || peer.id === user?.id) return null;
      return {
        id: peer.id,
        display_name: peer.display_name,
        username: peer.username || peer.display_name.toLowerCase().replace(/\s+/g, ''),
        avatar: peer.avatar || peer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.id}`,
        bio: peer.bio,
        current_vibe: peer.current_vibe,
        is_online: peer.is_online,
      };
    };
    const candidates = [
      ...connections.map((connection) => toPeer(connection.user ?? connection.partner)),
      ...suggestedUsers.map((candidate) => toPeer(candidate)),
    ].filter((peer): peer is Peer => peer !== null);
    return Array.from(new Map(candidates.map((peer) => [peer.id, peer])).values());
  }, [connections, suggestedUsers, user?.id]);

  const partnerParticipant = activeSession?.room.participants?.find((participant) => participant.user_id === partnerId);
  const partnerName = partnerParticipant?.display_name || (
    activeSession?.request.requester_id === partnerId
      ? activeSession.request.requester_name
      : activeSession?.request.recipient_name
  ) || 'Your chat partner';
  const partnerAvatar = partnerParticipant?.avatar_url || (
    activeSession?.request.requester_id === partnerId
      ? activeSession.request.requester_avatar
      : activeSession?.request.recipient_avatar
  );

  const handleRequest = async (peerId: string) => {
    setRequestingPeer(peerId);
    try {
      await sendTalkRequest(peerId);
      showToast('success', "Chat invitation sent. You'll be notified when they respond.");
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not send chat invitation');
    } finally {
      setRequestingPeer(null);
    }
  };

  const handleRespond = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await respondTalkRequest(requestId, action);
      if (action === 'ACCEPT') showToast('success', 'Private chat started. Text chat is ready.');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not update chat request');
    }
  };

  const startLocationSharing = () => {
    if (!roomId || !navigator.geolocation) {
      showToast('error', 'Location sharing is not available in this browser.');
      return;
    }
    if (!window.isSecureContext) {
      showToast('error', 'Location sharing requires a secure HTTPS connection.');
      return;
    }
    setLocationRequestPending(true);
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setLocationRequestPending(false);
        setLocationOn(true);
        socketClient.emit('chat:location_update', {
          roomId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
      },
      (error) => {
        setLocationRequestPending(false);
        stopLocationSharing();
        showToast('error', error.message || 'Location permission was denied.');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    locationWatchId.current = watchId;
    setLocationOn(true);
  };

  function stopLocationSharing() {
    if (locationWatchId.current !== null) {
      navigator.geolocation?.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
    if (roomId) socketClient.emit('chat:location_stop', { roomId });
    setLocationRequestPending(false);
    setLocationOn(false);
  }

  const toggleVoice = async () => {
    if (voiceOn) {
      setVoiceOn(false);
      setVoiceToken(null);
      setVoiceMuted(false);
      return;
    }
    if (!roomId || !roomReady) return;
    try {
      const data = await api.get<{ token: string; livekitUrl: string }>(`/rooms/${roomId}/livekit-token`);
      setVoiceToken(data);
      setVoiceOn(true);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Voice could not be started');
    }
  };

  const handleEndChat = async () => {
    if (!activeSession) return;
    stopLocationSharing();
    setVoiceOn(false);
    setVoiceToken(null);
    socketClient.emit('chat:live_status', { roomId: activeSession.room.id, enabled: false });
    try {
      await endTalkSession(activeSession.request.id);
      setRoomReady(false);
      showToast('info', 'Chat ended. Voice and location sharing are off.');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not end chat');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <header className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-[#121824] via-purple-950/35 to-[#10151e] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[11px] font-bold text-purple-200">
              <MessageCircle className="h-4 w-4" /> PRIVATE 1-TO-1 CONVERSATIONS
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Let&apos;s Chat</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Connect 1-to-1 with live chat, optional voice and optional location sharing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
          >
            Back to Explore
          </button>
        </div>
      </header>

      {activeSession ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-4 rounded-3xl border border-purple-400/30 bg-[#121824] p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <img
                src={partnerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${partnerId}`}
                alt=""
                className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Connected with</p>
                <h2 className="font-bold text-white">{partnerName}</h2>
                <p className="text-xs text-emerald-300">
                  Private chat · {roomReady ? 'Connected' : 'Connecting…'}
                  {partnerOnline !== null ? ` · ${partnerOnline ? 'Online' : 'Offline'}` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEndChat}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/20"
            >
              <PhoneOff className="h-4 w-4" /> End Chat
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-white"><MessageCircle className="h-4 w-4 text-cyan-300" /> Live Chat</span>
              <span className="text-xs font-bold text-emerald-300">ON</span>
            </div>
            <button
              type="button"
              onClick={() => void toggleVoice()}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${voiceOn ? 'border-emerald-400/40 bg-emerald-500/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white"><Mic className="h-4 w-4 text-emerald-300" /> Voice</span>
              <span className={`text-xs font-bold ${voiceOn ? 'text-emerald-300' : 'text-slate-400'}`}>{voiceOn ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              onClick={() => (locationOn || locationRequestPending ? stopLocationSharing() : startLocationSharing())}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${locationOn ? 'border-emerald-400/40 bg-emerald-500/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white"><MapPin className="h-4 w-4 text-emerald-300" /> Location</span>
              <span className={`text-xs font-bold ${locationOn ? 'text-emerald-300' : 'text-slate-400'}`}>{locationRequestPending ? 'REQUESTING' : locationOn ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              onClick={() => setLiveStatusOn((enabled) => !enabled)}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${liveStatusOn ? 'border-rose-400/30 bg-rose-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white"><Radio className="h-4 w-4 text-rose-300" /> Live Status</span>
              <span className={`text-xs font-bold ${liveStatusOn ? 'text-rose-300' : 'text-slate-400'}`}>{liveStatusOn ? 'ON' : 'OFF'}</span>
            </button>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-white"><UserRound className="h-4 w-4 text-slate-300" /> Partner status</span>
              <span className="text-xs text-slate-300">
                {partnerLiveStatus === null ? 'Not shared' : partnerLiveStatus ? 'Live status ON' : 'Live status OFF'}
                {partnerLocationOn ? ' · Location sharing ON' : ''}
              </span>
            </div>
          </div>

          {voiceOn && voiceToken && (
            <LiveKitRoom
              token={voiceToken.token}
              serverUrl={voiceToken.livekitUrl}
              audio
              video={false}
              connect
              onError={(error) => {
                console.error('Optional voice connection failed:', error);
                setVoiceOn(false);
                setVoiceToken(null);
                showToast('error', 'Voice connection failed. Text chat is still available.');
              }}
              onMediaDeviceFailure={(_failure, kind) => {
                if (kind === 'audioinput') {
                  setVoiceOn(false);
                  setVoiceToken(null);
                  showToast('error', 'Microphone access was denied or is unavailable. Text chat is still available.');
                }
              }}
              onDisconnected={() => {
                setVoiceOn(false);
                setVoiceToken(null);
              }}
            >
              <VoiceControls muted={voiceMuted} onMutedChange={setVoiceMuted} />
            </LiveKitRoom>
          )}

          <div className="h-[min(62vh,650px)] min-h-[400px]">
            {roomReady ? (
              <ChatPanel roomId={activeSession.room.id} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-white/10 bg-[#121824] text-sm text-slate-400">
                Establishing secure private chat…
              </div>
            )}
          </div>
          <p className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Voice and location remain off until you enable them. Location is shared only with this chat partner.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {incomingRequests.length > 0 && (
            <section className="rounded-3xl border border-emerald-400/20 bg-[#121824] p-5">
              <h2 className="mb-3 text-lg font-bold text-white">Chat invitations ({incomingRequests.length})</h2>
              <div className="space-y-2">
                {incomingRequests.map((request) => (
                  <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-3">
                      <img src={request.requester_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${request.requester_id}`} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      <div><p className="text-sm font-bold text-white">{request.requester_name || request.requester?.display_name || 'Orbit member'}</p><p className="text-xs text-slate-400">Invited you to a private chat</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void handleRespond(request.id, 'ACCEPT')} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="h-4 w-4" /> Accept</button>
                      <button type="button" onClick={() => void handleRespond(request.id, 'REJECT')} className="rounded-xl bg-rose-500/10 p-2 text-rose-300"><XCircle className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-white/10 bg-[#121824] p-5 sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Find someone to chat with</h2>
                <p className="mt-1 text-xs text-slate-400">Send an invite to open a private two-person chat.</p>
              </div>
              <button type="button" onClick={() => { void fetchConnections(); void fetchSuggestedUsers(); }} className="text-xs font-bold text-purple-300 hover:text-purple-200">Refresh</button>
            </div>
            {isLoading && peers.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">Finding people…</p>
            ) : peers.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">No people to show right now. Check your connections again shortly.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {peers.map((peer) => {
                  const pending = sentRequests.some((request) => request.recipient_id === peer.id && request.status === 'PENDING');
                  return (
                    <article key={peer.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <img src={peer.avatar} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-white">{peer.display_name}</h3>
                          <p className="text-[11px] text-slate-400">{peer.is_online ? 'Online' : peer.current_vibe || 'Orbit member'}</p>
                        </div>
                      </div>
                      <p className="mb-4 line-clamp-2 min-h-8 text-xs text-slate-400">{peer.bio || 'Ready for a friendly conversation.'}</p>
                      <button
                        type="button"
                        onClick={() => void handleRequest(peer.id)}
                        disabled={pending || requestingPeer === peer.id}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {pending ? 'Invite sent' : requestingPeer === peer.id ? 'Sending…' : "Let's Chat"}
                        {!pending && requestingPeer !== peer.id && <ArrowRight className="h-3.5 w-3.5" />}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
