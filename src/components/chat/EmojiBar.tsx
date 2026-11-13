import React from 'react';

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '✨', '😂', '🎉', '👏', '🚀', '💯', '🤔'];

interface EmojiBarProps {
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiBar: React.FC<EmojiBarProps> = ({ onSelectEmoji }) => {
  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#182030] border border-white/10 shadow-lg overflow-x-auto">
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelectEmoji(emoji)}
          className="p-1 text-sm rounded-lg hover:bg-white/10 transition-transform active:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
