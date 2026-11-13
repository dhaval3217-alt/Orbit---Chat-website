import React, { useState } from 'react';
import { RoomParticipant } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import {
  Crown,
  Mic,
  MicOff,
  Hand,
  UserPlus,
  ShieldAlert,
  UserX,
  X,
} from 'lucide-react';

interface ParticipantListProps {
  participants: RoomParticipant[];
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  const { user } = useAuthStore();
  const { openReportModal, openConnectionModal, openBlockModal } = useUiStore();
  const [selectedParticipant, setSelectedParticipant] = useState<RoomParticipant | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Audio Stage ({participants.length})
        </h3>
        <span className="text-[11px] text-indigo-400 font-semibold">
          Tap any participant to interact
        </span>
      </div>

      {/* Grid arrangement on mobile: clean 2-3 col stage avatars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {participants.map((p) => {
          const isMe = p.user_id === user?.id;
          const isSpeaking = !p.is_muted;

          return (
            <button
              key={p.id || p.user_id}
              onClick={() => setSelectedParticipant(p)}
              className={`relative flex flex-col items-center p-3.5 rounded-2xl border text-center transition-all duration-200 active-scale touch-target ${
                isSpeaking
                  ? 'bg-gradient-to-b from-indigo-950/60 to-[#121824] border-indigo-500/60 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
              } ${isMe ? 'ring-1 ring-indigo-400/40' : ''}`}
            >
              {/* Avatar with speaking wave aura */}
              <div className="relative mb-2 flex items-center justify-center">
                {isSpeaking && (
                  <span className="absolute w-14 h-14 rounded-2xl bg-indigo-500/20 animate-ping" />
                )}

                <img
                  src={p.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Anon'}
                  alt={p.display_name}
                  className={`h-12 w-12 rounded-2xl bg-indigo-950 p-0.5 object-cover border-2 transition-all ${
                    isSpeaking ? 'border-indigo-400 shadow-md shadow-indigo-500/40' : 'border-white/10'
                  }`}
                />

                {/* Role & Hand Badges */}
                {p.hand_raised && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg animate-bounce">
                    <Hand className="h-3 w-3" />
                  </span>
                )}

                {p.role === 'HOST' && (
                  <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 shadow">
                    <Crown className="h-3 w-3" />
                  </span>
                )}

                {/* Mute badge */}
                <span
                  className={`absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-white text-[10px] ring-2 ring-[#121824] ${
                    p.is_muted ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                >
                  {p.is_muted ? <MicOff className="h-2.5 w-2.5" /> : <Mic className="h-2.5 w-2.5" />}
                </span>
              </div>

              {/* Name & Tag */}
              <span className="text-xs font-bold text-white line-clamp-1 max-w-[110px]">
                {p.display_name}
              </span>

              <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                {isMe ? (
                  <span className="text-indigo-400 font-extrabold">You</span>
                ) : (
                  <span className="text-slate-400 capitalize">{p.role.toLowerCase()}</span>
                )}
                {isSpeaking && (
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    • Live
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Participant Action Bottom Sheet / Dialog */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#121824] border border-white/10 p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedParticipant(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <img
                src={
                  selectedParticipant.avatar_url ||
                  'https://api.dicebear.com/7.x/bottts/svg?seed=Anon'
                }
                alt={selectedParticipant.display_name}
                className="h-14 w-14 rounded-2xl bg-indigo-950 p-1 border border-indigo-500/40 object-cover shadow-lg"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white">
                    {selectedParticipant.display_name}
                  </h3>
                  {selectedParticipant.role === 'HOST' && (
                    <Crown className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 capitalize">
                  {selectedParticipant.role.toLowerCase()} •{' '}
                  <span
                    className={
                      selectedParticipant.is_muted ? 'text-rose-400' : 'text-emerald-400'
                    }
                  >
                    {selectedParticipant.is_muted ? 'Muted' : 'Speaking'}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions list */}
            {selectedParticipant.user_id !== user?.id ? (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    openConnectionModal(
                      selectedParticipant.user_id,
                      selectedParticipant.display_name
                    );
                    setSelectedParticipant(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active-scale touch-target transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Connect & Request Mutual Reveal</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      openReportModal(
                        selectedParticipant.user_id,
                        undefined,
                        selectedParticipant.display_name
                      );
                      setSelectedParticipant(null);
                    }}
                    className="py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 active-scale touch-target transition-all"
                  >
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    <span>Report</span>
                  </button>

                  <button
                    onClick={() => {
                      openBlockModal(
                        selectedParticipant.user_id,
                        selectedParticipant.display_name
                      );
                      setSelectedParticipant(null);
                    }}
                    className="py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 active-scale touch-target transition-all"
                  >
                    <UserX className="h-4 w-4 text-rose-400" />
                    <span>Block</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 text-center font-semibold">
                This is your current active stage profile in this room.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

