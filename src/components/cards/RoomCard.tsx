import React from 'react';
import { Room } from '../../types/index.js';
import { Users, Radio, Sparkles, MessageSquare } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onJoin: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
  const isFull = (room.participant_count || 0) >= room.max_participants;

  const getBadgeStyle = () => {
    switch (room.type) {
      case 'WALK_AND_TALK':
        return {
          icon: MessageSquare,
          label: "Let's Chat",
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        };
      case 'MATCHED':
        return {
          icon: Sparkles,
          label: '1-on-1 Match',
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        };
      default:
        return {
          icon: Radio,
          label: 'Public Lounge',
          color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        };
    }
  };

  const badge = getBadgeStyle();
  const BadgeIcon = badge.icon;

  return (
    <div className="group flex flex-col justify-between p-5 rounded-2xl bg-[#121824] border border-white/10 hover:border-white/20 hover:bg-[#182030] transition-all duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
          >
            <BadgeIcon className="h-3.5 w-3.5" />
            {badge.label}
          </span>

          <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <Users className="h-3.5 w-3.5" />
            {room.participant_count || 0} / {room.max_participants}
          </span>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
          {room.title}
        </h3>

        {room.mood_label && (
          <p className="mt-1.5 text-xs text-indigo-400 font-medium flex items-center gap-1">
            <span>✨ Vibe:</span>
            <span>{room.mood_label}</span>
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Live Audio & Chat</span>
        </div>

        <button
          onClick={onJoin}
          disabled={isFull}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            isFull
              ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:shadow-indigo-600/40'
          }`}
        >
          {isFull ? 'Room Full' : 'Join Audio'}
        </button>
      </div>
    </div>
  );
};
