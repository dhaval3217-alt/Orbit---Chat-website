import React from 'react';
import { ShieldCheck, HeartHandshake, EyeOff, Radio, AlertOctagon, X } from 'lucide-react';

interface SafetyGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-[#121824] border border-white/10 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Orbit Community Safety</h3>
            <p className="text-xs text-slate-400">Guiding principles for safe, friendly real-time audio</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
            <EyeOff className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">1. Privacy-First Identity</h4>
              <p className="text-slate-400 leading-relaxed">
                You begin 100% anonymous. Real names and profiles are only revealed with mutual consent. Never share personal contact info unless you feel completely comfortable.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
            <HeartHandshake className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">2. Respectful Conversations</h4>
              <p className="text-slate-400 leading-relaxed">
                Orbit is a space for authentic connection. Harassment, hate speech, bullying, and non-consensual recordings are strictly prohibited.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
            <Radio className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">3. Private Location Sharing in Let&apos;s Chat</h4>
              <p className="text-slate-400 leading-relaxed">
                Location permission is requested only when you enable sharing in a private chat. Live coordinates are delivered only to that chat participant and stop immediately when sharing or the chat ends.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
            <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">4. Fast Moderation & Reporting</h4>
              <p className="text-slate-400 leading-relaxed">
                Tap the shield icon on any user or message to immediately flag them for moderation. You can also block any user with instant effect.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
