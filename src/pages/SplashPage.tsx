import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { Radio, Sparkles, MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleContinue = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#0a0d14] text-slate-100 p-6 sm:p-10 overflow-hidden select-none">
      {/* Dynamic Ambient Background Nebulae */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-indigo-600/25 blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-12 -left-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

      {/* Top Header Tag */}
      <div className="relative z-10 flex items-center justify-between pt-safe">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-300">
            Orbit v1.0 Mobile
          </span>
        </div>

        <button
          onClick={handleContinue}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
        >
          Skip Intro
        </button>
      </div>

      {/* Center Hero Identity */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-8">
        {/* Animated 3D Orbit Icon */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-36 h-36 rounded-full border border-indigo-500/30 animate-pulse" />
          <div
            className="absolute w-48 h-20 rounded-full border border-cyan-400/40 animate-orbit-spin pointer-events-none"
            style={{ transform: 'rotate(-25deg)' }}
          />
          <div className="absolute w-28 h-28 rounded-full bg-indigo-600/30 blur-xl animate-pulse" />

          <div className="absolute flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-2xl shadow-indigo-500/40">
            <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#0a0d14]">
              <Radio className="h-9 w-9 text-indigo-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* App Title & Slogan */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
          Orbit
        </h1>
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] bg-gradient-to-r from-indigo-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent mb-4">
          Real-Time Social Audio
        </p>
        <p className="text-base sm:text-lg font-medium text-slate-300 max-w-sm mb-6 leading-relaxed">
          “Connect. Talk. Belong.”
        </p>

        {/* Feature Pills */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Vibe-First Matching</p>
              <p className="text-[10px] text-slate-400">Match by mood, interests & availability</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Live Audio Lounges</p>
              <p className="text-[10px] text-slate-400">Drop in & converse anonymously</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Let&apos;s Chat</p>
              <p className="text-[10px] text-slate-400">Private chat with optional voice and location</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 w-full max-w-sm mx-auto pb-safe space-y-3">
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 active-scale touch-target transition-all"
        >
          <span>{isAuthenticated ? 'Open Orbit App' : 'Get Started'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Anonymous by default • Mutual consent profile reveal</span>
        </p>
      </div>
    </div>
  );
};
