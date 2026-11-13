import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import {
  Radio,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-semibold backdrop-blur-md mb-8">
          <Sparkles className="h-4 w-4" />
          <span>Anonymous Real-Time Social Audio & Matching</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Find your orbit with compatible{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            voices and vibes.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Create an anonymous profile, select your vibe, and connect in private 1-to-1 chats with voice and location sharing fully optional.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-base shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            {isAuthenticated ? 'Open Dashboard' : 'Get Started Now'}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to={isAuthenticated ? '/moods' : '/login'}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-base border border-white/10 transition-all"
          >
            Explore Live Vibes
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-[#121824]/80 border border-white/10 backdrop-blur-md hover:border-indigo-500/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-4">
              <Radio className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Audio Lounges</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Drop in and out of topic-based audio rooms powered by LiveKit. Speak anonymously using cute avatars.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#121824]/80 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Let&apos;s Chat</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connect privately 1-to-1 with text chat, optional voice, and optional location sharing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#121824]/80 border border-white/10 backdrop-blur-md hover:border-purple-500/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Mutual Consent Reveal</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stay 100% anonymous until both you and your conversation partner agree to reveal real profiles.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        Orbit — Production Full-Stack Social Audio & Real-Time Presence Platform.
      </footer>
    </div>
  );
};
