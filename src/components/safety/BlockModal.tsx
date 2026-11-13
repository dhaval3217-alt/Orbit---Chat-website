import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore.js';
import { api } from '../../services/api.js';
import { UserX, X } from 'lucide-react';

export const BlockModal: React.FC = () => {
  const { blockModal, closeBlockModal, showToast } = useUiStore();
  const [reason] = useState('Inappropriate conduct');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!blockModal.isOpen) return null;

  const handleBlock = async () => {
    if (!blockModal.blockedUserId) return;
    setIsSubmitting(true);

    try {
      await api.post('/safety/block', {
        blocked_id: blockModal.blockedUserId,
        reason,
      });

      showToast('success', `User ${blockModal.blockedUserName || ''} has been blocked.`);
      closeBlockModal();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to block user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#121824] border border-rose-500/30 p-6 shadow-2xl">
        <button
          onClick={closeBlockModal}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Block User</h3>
            <p className="text-xs text-slate-400">
              {blockModal.blockedUserName ? `Block @${blockModal.blockedUserName}` : 'Block this participant'}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Blocked users cannot see your presence, join direct chats, match with you, or hear your voice in audio rooms.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={closeBlockModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleBlock}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
          >
            {isSubmitting ? 'Blocking...' : 'Confirm Block'}
          </button>
        </div>
      </div>
    </div>
  );
};
