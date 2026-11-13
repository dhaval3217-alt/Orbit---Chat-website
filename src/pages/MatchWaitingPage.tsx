import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchingStore } from '../store/matchingStore.js';
import { useMoodStore } from '../store/moodStore.js';
import { socketClient } from '../socket/socketClient.js';
import { Radio, XCircle, ShieldCheck } from 'lucide-react';

export const MatchWaitingPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMood } = useMoodStore();
  const { statusText, matchedRoom, cancelSearch, handleMatchFound } =
    useMatchingStore();
  const [searchSeconds, setSearchSeconds] = useState(0);

  useEffect(() => {
    // Timer ticker
    const interval = setInterval(() => {
      setSearchSeconds((prev) => prev + 1);
    }, 1000);

    // If a match is already present, navigate to match found
    if (matchedRoom) {
      navigate('/match-found');
      return () => clearInterval(interval);
    }

    const unsubFound = socketClient.on('match:found', (data: any) => {
      handleMatchFound(data);
      navigate('/match-found');
    });

    return () => {
      clearInterval(interval);
      unsubFound();
    };
  }, [matchedRoom]);

  const handleCancel = async () => {
    await cancelSearch();
    navigate('/moods');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100dvh-12rem)] flex items-center justify-center p-4">
      <div className="relative flex flex-col items-center text-center p-6 sm:p-10 rounded-3xl bg-[#121824] border border-white/10 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Dynamic Glow Aura in background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: selectedMood?.color || '#6366f1' }}
        />

        {/* Selected Vibe Pill */}
        {selectedMood && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold mb-6">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: selectedMood.color || '#6366f1' }}
            />
            <span className="text-slate-300">Searching Vibe:</span>
            <strong className="text-white">{selectedMood.label}</strong>
          </div>
        )}

        {/* Pulsing Radar Sonar Animation */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-52 h-52 rounded-full border border-indigo-500/20 animate-pulse" />
          <div
            className="absolute w-40 h-40 rounded-full border border-cyan-500/30 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute w-28 h-28 rounded-full border border-purple-500/40 animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div className="absolute w-52 h-52 rounded-full border-t-2 border-indigo-400 animate-orbit-spin" />

          {/* Central Orbit Beacon */}
          <div className="absolute flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-2xl shadow-indigo-500/40">
            <div className="flex h-full w-full items-center justify-center rounded-[23px] bg-[#0a0d14]">
              <Radio className="h-9 w-9 text-indigo-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Dynamic Status Text & Timer */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
          Finding someone for you...
        </h2>
        <p className="text-xs font-mono font-bold text-cyan-400 mb-2">
          {formatTimer(searchSeconds)}
        </p>
        <p className="text-xs text-slate-400 max-w-xs mb-8 leading-relaxed">
          {statusText ||
            'Evaluating live vibe compatibility, passions & microphone readiness across online peers...'}
        </p>

        {/* Cancel Button */}
        <div className="w-full flex flex-col items-center gap-3">
          <button
            onClick={handleCancel}
            className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 active-scale touch-target transition-all"
          >
            <XCircle className="h-4 w-4" />
            <span>Cancel Matching Search</span>
          </button>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Identity remains completely anonymous</span>
          </p>
        </div>
      </div>
    </div>
  );
};

