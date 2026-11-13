import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore.js';
import { useConnectionStore } from '../../store/connectionStore.js';
import { UserCheck, X, ShieldCheck, Sparkles } from 'lucide-react';

export const ConnectionModal: React.FC = () => {
  const { connectionModal, closeConnectionModal, showToast } = useUiStore();
  const { sendRequest } = useConnectionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!connectionModal.isOpen) return null;

  const handleSend = async () => {
    if (!connectionModal.targetUserId) return;
    setIsSubmitting(true);

    try {
      await sendRequest(connectionModal.targetUserId);
      showToast('success', 'Connection request sent! Profile details are revealed only when both sides consent.');
      closeConnectionModal();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send connection request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#121824] border border-white/10 p-6 shadow-2xl">
        <button
          onClick={closeConnectionModal}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Request Connection</h3>
            <p className="text-xs text-slate-400">
              Connect with {connectionModal.targetUserName || 'User'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-2 mb-6">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Mutual Consent Privacy Guarantee</span>
          </div>
          <p className="leading-relaxed">
            Orbit profiles remain completely anonymous by default. Real names and profiles are only revealed once both users mutually agree to connect.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={closeConnectionModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isSubmitting ? 'Sending...' : 'Send Connection Request'}
          </button>
        </div>
      </div>
    </div>
  );
};
