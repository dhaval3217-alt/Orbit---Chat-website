import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore.js';
import { api } from '../../services/api.js';
import { ShieldAlert, X } from 'lucide-react';

const REASON_OPTIONS = [
  'Harassment or Hate Speech',
  'Inappropriate or Toxic Language',
  'Spamming or Commercial Solicitation',
  'Impersonation or False Identity',
  'Disruptive Audio Behavior',
  'Other Safety Violation',
];

export const ReportModal: React.FC = () => {
  const { reportModal, closeReportModal, showToast } = useUiStore();
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportModal.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/safety/report', {
        reported_user_id: reportModal.reportedUserId,
        reported_message_id: reportModal.reportedMessageId,
        reason: selectedReason,
        details,
      });

      showToast('success', 'Report submitted to moderators. Thank you for keeping Orbit safe.');
      closeReportModal();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#121824] border border-white/10 p-6 shadow-2xl">
        <button
          onClick={closeReportModal}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Report Content or User</h3>
            <p className="text-xs text-slate-400">
              {reportModal.reportedUserName ? `Reporting ${reportModal.reportedUserName}` : 'Anonymous Moderation Report'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Reason for Report
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {REASON_OPTIONS.map((r) => (
                <option key={r} value={r} className="bg-[#121824] text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what occurred..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={closeReportModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
