import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchingStore } from '../store/matchingStore.js';
import { useRoomStore } from '../store/roomStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { useMoodStore } from '../store/moodStore.js';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Mic,
  MessageSquare,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

export const MatchFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { selectedMood } = useMoodStore();
  const { matchedRoom, currentMatch, partnerProfile, resetMatch, startSearch } =
    useMatchingStore();
  const { joinRoom } = useRoomStore();
  const { openConnectionModal, showToast } = useUiStore();

  const handleEnterAudio = async () => {
    if (!matchedRoom) return;
    try {
      await joinRoom(matchedRoom.id);
      resetMatch();
      navigate(`/room/${matchedRoom.id}`);
    } catch (err: any) {
      showToast('error', err.message || 'Could not join room');
    }
  };

  const handleEnterChat = async () => {
    if (!matchedRoom) return;
    try {
      await joinRoom(matchedRoom.id, 'LISTENER');
      resetMatch();
      navigate(`/room/${matchedRoom.id}?tab=chat`);
    } catch (err: any) {
      showToast('error', err.message || 'Could not join room');
    }
  };

  const handleSkip = () => {
    resetMatch();
    if (selectedMood) {
      startSearch(selectedMood.id);
      navigate('/matching');
    } else {
      navigate('/moods');
    }
  };

  const partnerUser = currentMatch?.matched_user;
  const partnerName = partnerUser?.display_name || partnerProfile?.display_name || 'CosmoFriend';
  const partnerAvatar =
    partnerUser?.avatar_url ||
    partnerProfile?.avatar_url ||
    'https://api.dicebear.com/7.x/bottts/svg?seed=OrbitFriend';
  const partnerVibe = partnerUser?.mood || selectedMood?.label || "Let's Chat";
  const partnerId = currentMatch?.user1_id === profile?.user_id ? currentMatch?.user2_id : currentMatch?.user1_id;

  const score = currentMatch?.compatibility_score || 88;
  const sharedTags = partnerUser?.shared_interests || ['Artificial Intelligence', 'Indie Music'];

  return (
    <div className="min-h-[calc(100dvh-12rem)] flex items-center justify-center p-4">
      <div className="relative flex flex-col items-center text-center p-6 sm:p-10 rounded-3xl bg-[#121824] border border-indigo-500/40 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Top Glow Ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Celebration Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-4 animate-bounce">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Orbit Match Found! 🎉</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-6 tracking-tight">
          You've Been Matched!
        </h2>

        {/* Avatar Bridge Representation */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 w-full">
          {/* User Side */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me'}
                alt="You"
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-indigo-950 p-1 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#0a0d14]" />
            </div>
            <span className="text-xs font-bold text-slate-300 mt-2">You</span>
          </div>

          {/* Compatibility Score Center */}
          <div className="flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white shadow-xl shadow-rose-500/30 animate-pulse">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xs font-extrabold text-indigo-400 mt-1.5">
              {score}% Match
            </span>
          </div>

          {/* Matched Partner Side */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-indigo-950 p-1 border-2 border-cyan-400 shadow-lg shadow-cyan-400/30 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 ring-2 ring-[#0a0d14]" />
            </div>
            <span className="text-xs font-bold text-slate-200 mt-2 line-clamp-1 max-w-[90px]">
              {partnerName}
            </span>
          </div>
        </div>

        {/* Partner Current Vibe Info */}
        <div className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs mb-4">
          <span className="text-slate-400">Current Vibe:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
            ✨ {partnerVibe}
          </span>
        </div>

        {/* Shared Passions / Interests */}
        {sharedTags && sharedTags.length > 0 && (
          <div className="mb-6 w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Shared Passions & Interests ({sharedTags.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sharedTags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={handleEnterAudio}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 active-scale touch-target transition-all"
          >
            <Mic className="h-4.5 w-4.5" />
            <span>Start Audio Lounge</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleEnterChat}
              className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 active-scale touch-target transition-all"
            >
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <span>Start Text Chat</span>
            </button>

            <button
              onClick={() => {
                if (partnerId) {
                  openConnectionModal(partnerId, partnerName);
                }
              }}
              className="py-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 font-bold text-xs flex items-center justify-center gap-1.5 active-scale touch-target transition-all"
            >
              <UserPlus className="h-4 w-4 text-purple-400" />
              <span>Connect</span>
            </button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-white/5 active-scale transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Skip / Find Another Peer</span>
          </button>
        </div>

        <p className="mt-4 text-[10px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Both parties stay 100% anonymous until mutual reveal</span>
        </p>
      </div>
    </div>
  );
};
