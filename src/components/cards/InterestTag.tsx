import React from 'react';
import { InterestTag as InterestTagType } from '../../types/index.js';
import {
  Bot,
  Headphones,
  Book,
  Mountain,
  TrendingUp,
  Tv,
  Camera,
  Coffee,
  Brain,
  Utensils,
  Shield,
  Sparkles,
} from 'lucide-react';

interface InterestTagProps {
  tag: InterestTagType;
  isSelected?: boolean;
  isCompact?: boolean;
  onClick?: () => void;
}

const ICON_MAP: { [key: string]: React.ElementType } = {
  bot: Bot,
  headphones: Headphones,
  book: Book,
  mountain: Mountain,
  'trending-up': TrendingUp,
  tv: Tv,
  camera: Camera,
  coffee: Coffee,
  brain: Brain,
  utensils: Utensils,
  shield: Shield,
  sparkles: Sparkles,
};

export const InterestTag: React.FC<InterestTagProps> = ({
  tag,
  isSelected = false,
  isCompact = false,
  onClick,
}) => {
  const IconComponent = ICON_MAP[tag.icon] || Sparkles;

  const baseClasses = `inline-flex items-center gap-1.5 rounded-xl font-medium transition-all ${
    onClick ? 'cursor-pointer' : ''
  }`;

  const sizeClasses = isCompact
    ? 'px-2.5 py-1 text-xs'
    : 'px-3.5 py-2 text-sm';

  const styleClasses = isSelected
    ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50'
    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${baseClasses} ${sizeClasses} ${styleClasses}`}
    >
      <IconComponent className={isCompact ? 'h-3 w-3' : 'h-4 w-4'} />
      <span>{tag.name}</span>
    </button>
  );
};
