import React from 'react';
import { Mood } from '../../types/index.js';
import {
  Coffee,
  BookOpen,
  Gamepad2,
  Music,
  Dumbbell,
  Footprints,
  Film,
  Plane,
  MessageCircle,
  Sparkles,
  Shield,
} from 'lucide-react';

interface MoodCardProps {
  mood: Mood;
  isSelected?: boolean;
  activeCount?: number;
  onClick: () => void;
}

const ICON_MAP: { [key: string]: React.ElementType } = {
  coffee: Coffee,
  'book-open': BookOpen,
  'gamepad-2': Gamepad2,
  music: Music,
  dumbbell: Dumbbell,
  footprints: Footprints,
  film: Film,
  plane: Plane,
  'message-circle': MessageCircle,
  shield: Shield,
};

export const MoodCard: React.FC<MoodCardProps> = ({
  mood,
  isSelected = false,
  activeCount,
  onClick,
}) => {
  const IconComponent = ICON_MAP[mood.icon] || Sparkles;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 w-full overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-indigo-900/40 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500/50 scale-[1.02]'
          : 'bg-[#121824]/80 border-white/10 hover:border-white/25 hover:bg-[#182030] hover:scale-[1.01]'
      }`}
    >
      {/* Background glow accent */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: mood.color || '#6366f1' }}
      />

      <div className="flex items-center justify-between w-full mb-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl p-2.5 shadow-inner"
          style={{
            backgroundColor: `${mood.color || '#6366f1'}20`,
            color: mood.color || '#6366f1',
          }}
        >
          <IconComponent className="h-6 w-6" />
        </div>

        {activeCount !== undefined && activeCount > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeCount} active
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
        {mood.label}
      </h3>

      <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">
        {mood.description}
      </p>

      {isSelected && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-400">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          Active Vibe
        </div>
      )}
    </button>
  );
};
