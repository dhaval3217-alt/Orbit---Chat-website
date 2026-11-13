import React from 'react';
import { useRoomStore } from '../../store/roomStore.js';
import {
  Mic,
  MicOff,
  Hand,
  PhoneOff,
  MessageSquare,
  Users,
} from 'lucide-react';

interface AudioControlsProps {
  onLeave: () => void;
  activeTab?: 'stage' | 'chat';
  onToggleTab?: (tab: 'stage' | 'chat') => void;
  unreadCount?: number;
  onOpenParticipants?: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  onLeave,
  activeTab = 'stage',
  onToggleTab,
  unreadCount = 0,
  onOpenParticipants,
}) => {
  const { isMuted, isHandRaised, toggleMute, toggleHandRaise } = useRoomStore();

  return (
    <div className="fixed lg:static bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-[#0a0d14]/95 lg:bg-[#121824]/90 border-t lg:border border-white/10 backdrop-blur-2xl lg:rounded-3xl shadow-2xl">
      <div className="flex items-center justify-between max-w-lg lg:max-w-none mx-auto gap-2 sm:gap-4 pb-safe lg:pb-0">
        {/* Left: Chat & Stage View Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onToggleTab && (
            <button
              onClick={() => onToggleTab(activeTab === 'chat' ? 'stage' : 'chat')}
              className={`relative flex items-center justify-center p-3 rounded-2xl touch-target active-scale transition-all ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
              title="Toggle Live Chat"
              aria-label="Toggle Live Chat"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadCount > 0 && activeTab !== 'chat' && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center ring-2 ring-[#0a0d14]">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {onOpenParticipants && (
            <button
              onClick={onOpenParticipants}
              className="lg:hidden flex items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 touch-target active-scale transition-all"
              title="Participants List"
              aria-label="Participants List"
            >
              <Users className="h-5 w-5" />
            </button>
          )}

          {/* Raise Hand Button */}
          <button
            onClick={() => toggleHandRaise()}
            className={`flex items-center justify-center p-3 rounded-2xl touch-target active-scale transition-all ${
              isHandRaised
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 animate-bounce'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand to Speak'}
            aria-label="Raise Hand"
          >
            <Hand className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Hero Microphone Control (56px touch target) */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => toggleMute()}
            className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl active-scale transition-all touch-target ${
              isMuted
                ? 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/40 ring-4 ring-emerald-500/30 animate-pulse-slow'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : (
              <div className="flex items-center gap-0.5">
                <span className="w-1 bg-slate-950 rounded-full animate-soundwave-1" />
                <span className="w-1 bg-slate-950 rounded-full animate-soundwave-2" />
                <span className="w-1 bg-slate-950 rounded-full animate-soundwave-3" />
                <Mic className="h-5 w-5 sm:h-6 sm:w-6 mx-0.5" />
                <span className="w-1 bg-slate-950 rounded-full animate-soundwave-4" />
              </div>
            )}
          </button>
          <span className="text-[10px] font-bold text-slate-400 mt-1">
            {isMuted ? 'Tap to Unmute' : 'Microphone Live'}
          </span>
        </div>

        {/* Right: End / Leave Room Button */}
        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold active-scale touch-target transition-all"
          title="Leave Room"
          aria-label="Leave Room"
        >
          <PhoneOff className="h-4.5 w-4.5" />
          <span className="hidden sm:inline">Leave Room</span>
        </button>
      </div>
    </div>
  );
};

