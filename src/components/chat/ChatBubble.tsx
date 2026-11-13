import React, { useState } from 'react';
import { Message } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { formatTimestamp } from '../../utils/formatters.js';
import { EmojiBar } from './EmojiBar.js';
import { Smile, ShieldAlert, Trash2 } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onToggleReaction,
  onDeleteMessage,
}) => {
  const { user } = useAuthStore();
  const { openReportModal } = useUiStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isMe = message.sender_id === user?.id;
  const isModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN';

  return (
    <div className={`group relative flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} my-3`}>
      <img
        src={message.sender_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Anon'}
        alt={message.sender_name}
        className="h-8 w-8 rounded-xl bg-indigo-950 p-0.5 shrink-0 border border-white/10"
      />

      <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-300">{message.sender_name}</span>
          <span className="text-[10px] text-slate-400">
            {formatTimestamp(message.created_at)}
          </span>
        </div>

        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all ${
            message.is_deleted
              ? 'bg-white/5 text-slate-500 italic border border-white/5'
              : isMe
              ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
              : 'bg-[#182030] text-slate-100 rounded-tl-none border border-white/10'
          }`}
        >
          {message.content}
        </div>
        {message.delivery_status && (
          <span className={`px-1 text-[10px] ${message.delivery_status === 'failed' ? 'text-rose-400' : 'text-slate-500'}`}>
            {message.delivery_status === 'sending' ? 'Sending…' : message.delivery_status === 'failed' ? 'Not sent — check your connection' : 'Sent'}
          </span>
        )}

        {/* Message Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 px-1">
            {Object.entries(message.reactions).map(([emoji, users]) => {
              const hasReacted = user ? users.includes(user.id) : false;
              return (
                <button
                  key={emoji}
                  onClick={() => onToggleReaction(message.id, emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                    hasReacted
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold text-[10px]">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Action hover tools */}
        {!message.is_deleted && (
          <div
            className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 mt-1 transition-opacity ${
              isMe ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Add Reaction"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>

            {!isMe && (
              <button
                onClick={() => openReportModal(message.sender_id, message.id, message.sender_name)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Report Message"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
              </button>
            )}

            {(isMe || isModerator) && (
              <button
                onClick={() => onDeleteMessage(message.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Message"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {showEmojiPicker && (
          <div className="mt-2 z-10">
            <EmojiBar
              onSelectEmoji={(emoji) => {
                onToggleReaction(message.id, emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
