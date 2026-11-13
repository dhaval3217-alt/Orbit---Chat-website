import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { socketClient } from '../../socket/socketClient.js';
import { ChatBubble } from './ChatBubble.js';
import { TypingIndicator } from './TypingIndicator.js';
import { Send, MessageSquare } from 'lucide-react';
import { useUiStore } from '../../store/uiStore.js';

interface ChatPanelProps {
  roomId: string;
}

const QUICK_EMOJIS = ['👋', '🔥', '❤️', '👏', '😂', '✨', '🎧'];

export const ChatPanel: React.FC<ChatPanelProps> = ({ roomId }) => {
  const { profile } = useAuthStore();
  const { showToast } = useUiStore();
  const {
    messages,
    typingUsers,
    isLoading,
    fetchMessages,
    sendMessage,
    toggleReaction,
    deleteMessage,
    addMessage,
    updateReaction,
    setUserTyping,
  } = useChatStore();

  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Fetch initial messages and register socket listeners for this room
  useEffect(() => {
    useChatStore.getState().clearChat();
    fetchMessages(roomId);

    const unsubMsg = socketClient.on('chat:new_message', (data: any) => {
      if (data.roomId === roomId) {
        addMessage({ ...data.message, client_message_id: data.clientMessageId });
      }
    });

    const unsubTyping = socketClient.on('chat:user_typing', (data: any) => {
      if (data.roomId === roomId) {
        setUserTyping(data.userId, data.displayName, data.isTyping);
      }
    });

    const unsubReaction = socketClient.on('chat:reaction_updated', (data: any) => {
      if (data.roomId === roomId) {
        updateReaction(data.messageId, data.reactions);
      }
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      unsubMsg();
      unsubTyping();
      unsubReaction();
    };
  }, [roomId]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);

    // Emit typing indicator
    socketClient.emit('chat:typing', {
      roomId,
      isTyping: true,
      displayName: profile?.display_name || 'Someone',
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketClient.emit('chat:typing', {
        roomId,
        isTyping: false,
      });
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const content = inputContent;
    setInputContent('');

    try {
      await sendMessage(roomId, content);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Message could not be sent');
    }
  };

  const handleQuickEmoji = async (emoji: string) => {
    await sendMessage(roomId, emoji);
  };

  return (
    <div className="flex flex-col h-full rounded-3xl bg-[#121824] border border-white/10 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Room Live Chat
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Real-time • Screened</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs">
            Loading conversations...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-600 mb-1" />
            <p className="text-xs font-bold text-slate-300">No messages yet.</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Say hello or react with quick emojis below!
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              onToggleReaction={(msgId, emoji) => toggleReaction(roomId, msgId, emoji)}
              onDeleteMessage={(msgId) => deleteMessage(msgId)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Quick Emojis Bar on Mobile */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-white/5 bg-[#0e131d] overflow-x-auto">
        <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Quick:</span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleQuickEmoji(emoji)}
            className="p-1 rounded-lg text-sm hover:bg-white/10 active:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#0a0d14]/90">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputContent}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all touch-target"
          />
          <button
            type="submit"
            disabled={!inputContent.trim()}
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-600 text-white transition-all shadow-md shadow-indigo-600/30 active-scale touch-target shrink-0"
            title="Send Message"
            aria-label="Send Message"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
