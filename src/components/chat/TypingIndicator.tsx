import React from 'react';

interface TypingIndicatorProps {
  typingUsers: { [userId: string]: string };
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  const names = Object.values(typingUsers);
  if (names.length === 0) return null;

  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.slice(0, 2).join(', ')} are typing...`;

  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs text-indigo-400 animate-pulse">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
        <span
          className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      <span>{text}</span>
    </div>
  );
};
