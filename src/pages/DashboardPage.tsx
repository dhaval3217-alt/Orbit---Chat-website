import React, { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useMoodStore } from '../store/moodStore.js';
import { useRoomStore } from '../store/roomStore.js';
import { useMatchingStore } from '../store/matchingStore.js';
import { RoomCard } from '../components/cards/RoomCard.js';
import { InterestTag } from '../components/cards/InterestTag.js';
import { socketClient } from '../socket/socketClient.js';
import { api } from '../services/api.js';
import type { Room } from '../types/index.js';
import {
  Sparkles,
  Radio,
  Compass,
  ArrowRight,
  Music,
  BookOpen,
  MessageCircle,
  Gamepad2,
  Film,
  Dumbbell,
  Plane,
  Cpu,
  RefreshCw,
  Zap,
  Shield,
} from 'lucide-react';

const ALL_VIBES = [
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    color: '#eab308',
    description: 'Wanderlust stories & travel notes',
    path: '/travel',
  },
  {
    id: 'just-talk',
    name: "Let's Chat",
    icon: MessageCircle,
    color: '#a855f7',
    description: 'Connect 1-to-1 with live chat, optional voice and optional location sharing',
    path: '/lets-chat',
  },
  {
    id: 'movies',
    name: 'Movies',
    icon: Film,
    color: '#f43f5e',
    description: 'Short movie clips, reviews & watch',
    path: '/movies',
  },
  {
    id: 'threat-detection',
    name: 'Threat Detection',
    icon: Shield,
    color: '#22c55e',
    description: 'Secure link, file, and media analysis',
    path: '/security',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: Dumbbell,
    color: '#06b6d4',
    description: 'Gym & home workout routines for all',
    path: '/fitness',
  },
  {
    id: 'music',
    name: 'Chill with Music',
    icon: Music,
    color: '#ec4899',
    description: 'Relax, discover music and share your favorite tracks',
    path: '/music',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: Gamepad2,
    color: '#8b5cf6',
    description: 'Snake, Tic-Tac-Toe & mini-games',
    path: '/gaming',
  },
];

// Vibes that should NOT show a Match button (they are standalone hubs, not matchmaking destinations)
const NO_MATCH_VIBES = new Set(['travel', 'movies', 'threat-detection', 'fitness']);

const isAvailableAudioRoom = (room: Room): boolean => {
  if (!room || !room.is_active || room.type === 'DIRECT' || room.closed_at) return false;
  if (!room.host_user_id || !room.livekit_room_name) return false;
  const participantCount = room.participant_count ?? 0;
  return participantCount < room.max_participants;
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { selectedMood, onlineCount, fetchMyMood } = useMoodStore();
  const { rooms, fetchRooms, joinRoom, isLoading } = useRoomStore();
  const { startSearch } = useMatchingStore();

  const availableRooms = useMemo(
    () => rooms.filter((room) => isAvailableAudioRoom(room)),
    [rooms]
  );

  useEffect(() => {
    fetchMyMood();
    fetchRooms();

    const refreshRooms = () => {
      fetchRooms();
    };

    const unsubConnect = socketClient.on('connect', refreshRooms);
    const unsubRoomUpdate = socketClient.on('room:update', refreshRooms);
    const unsubParticipantJoined = socketClient.on('room:participant_joined', refreshRooms);
    const unsubParticipantLeft = socketClient.on('room:participant_left', refreshRooms);

    const interval = window.setInterval(refreshRooms, 15000);

    return () => {
      unsubConnect();
      unsubRoomUpdate();
      unsubParticipantJoined();
      unsubParticipantLeft();
      window.clearInterval(interval);
    };
  }, [fetchRooms]);

  const handleStartMatching = (moodId: string) => {
    if (moodId === 'just-talk') {
      navigate('/lets-chat');
      return;
    }
    startSearch(moodId);
    navigate('/matching');
  };

  const handleJoin = async (roomId: string) => {
    const room = rooms.find((entry) => entry.id === roomId);

    if (!room || !isAvailableAudioRoom(room)) {
      await fetchRooms();
      return;
    }

    try {
      const liveRoom = await api.get<{ id: string; is_active: boolean; closed_at?: string | null; participant_count?: number; max_participants: number }>(`/rooms/${roomId}`);
      if (!liveRoom.is_active || liveRoom.closed_at || (liveRoom.participant_count ?? 0) >= liveRoom.max_participants) {
        await fetchRooms();
        return;
      }

      await joinRoom(roomId);
      navigate(`/room/${roomId}`);
    } catch {
      await fetchRooms();
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile-First Welcome & Community Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/90 via-[#121824] to-slate-900 border border-white/10 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {onlineCount} Users Connected to Orbit
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {profile?.display_name || 'Explorer'}! ✨
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">
                Community safety and friendly conversations
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
              {selectedMood ? (
                <button
                  onClick={() => handleStartMatching(selectedMood.id)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active-scale touch-target transition-all"
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Find Match ({selectedMood.label})</span>
                </button>
              ) : (
                <Link
                  to="/moods"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active-scale touch-target transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Find Match</span>
                </Link>
              )}

              <Link
                to="/lets-chat"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2 active-scale touch-target transition-all"
              >
                <MessageCircle className="h-4 w-4 text-purple-400" />
                <span>Let&apos;s Chat</span>
              </Link>
            </div>
          </div>

          {/* Current Vibe Status Pill if Set */}
          {selectedMood && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full animate-ping"
                  style={{ backgroundColor: selectedMood.color || '#6366f1' }}
                />
                <span className="text-slate-300 font-medium">
                  Current Vibe: <strong className="text-white">{selectedMood.label}</strong>
                </span>
              </div>
              <Link
                to="/moods"
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold"
              >
                Change Vibe →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* User Interests Chip Row */}
      {profile?.interests && profile.interests.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#121824] border border-white/10 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Your Passions:</span>
            {profile.interests.map((tag) => (
              <InterestTag key={tag.id} tag={tag} isCompact />
            ))}
          </div>
          <Link
            to="/profile"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Edit →
          </Link>
        </div>
      )}

      {/* "Pick Your Vibe for Instant Match" Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Pick Your Vibe for Instant Match
            </h2>
            <p className="text-xs text-slate-400">
              Tap any mood card to instantly find compatible peers.
            </p>
          </div>
          <Link
            to="/moods"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_VIBES.map((vibe) => {
            const IconComponent = vibe.icon;
            const isSelected = selectedMood?.id === vibe.id;

            return (
              <div
                key={vibe.id}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all group ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20'
                    : 'bg-[#121824] border-white/10 hover:border-white/20 hover:bg-[#182030]'
                }`}
              >
                <div onClick={() => navigate(vibe.path)} className="cursor-pointer">
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${vibe.color}20`,
                        color: vibe.color,
                      }}
                    >
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: vibe.color }}
                    />
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {vibe.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                    {vibe.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-1 text-[10px] font-bold">
                  <button
                    onClick={() => navigate(vibe.path)}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Open Hub →
                  </button>
                  {!NO_MATCH_VIBES.has(vibe.id) && (
                    <button
                      onClick={() => handleStartMatching(vibe.id)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Match</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Audio Lounges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
              Active Live Audio Lounges ({availableRooms.length})
            </h2>
            <p className="text-xs text-slate-400">
              Only lounges that are currently active and joinable are shown.
            </p>
          </div>
          <button
            onClick={() => fetchRooms()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Refresh Rooms"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {availableRooms.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#121824] border border-white/10 text-center space-y-3">
            <Compass className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No live lounges available right now.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a lounge or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={() => handleJoin(room.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
