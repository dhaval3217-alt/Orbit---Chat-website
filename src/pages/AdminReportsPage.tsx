import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../store/adminStore.js';
import { useUiStore } from '../store/uiStore.js';
import { formatTimestamp } from '../utils/formatters.js';
import { api } from '../services/api.js';
import { AlertTriangle, CheckCircle2, Ban, VolumeX, Trash2, Film, Music, Code2, FileText, User } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { reports, fetchReports, resolveReport, isLoading } = useAdminStore();
  const { showToast } = useUiStore();
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchReports(statusFilter || undefined);
  }, [statusFilter]);

  const handleAction = async (
    reportId: string,
    status: 'REVIEWED' | 'RESOLVED' | 'DISMISSED',
    action_taken?:
      | 'MUTE_USER'
      | 'BAN_USER'
      | 'DELETE_MESSAGE'
      | 'DELETE_CONTENT'
      | 'WARNING_ISSUED'
      | 'NO_ACTION'
  ) => {
    try {
      await resolveReport(reportId, {
        status,
        action_taken,
        moderator_notes: `Processed by moderator: ${action_taken || status}`,
      });
      showToast('success', `Report marked as ${status}`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update report');
    }
  };

  const handleDeleteReportedContent = async (report: any) => {
    if (!window.confirm(`Delete this reported ${report.content_type || 'content'}?`)) return;
    try {
      if (report.content_type === 'VIDEO' && report.content_id) {
        await api.delete(`/movie-videos/${report.content_id}`);
      } else if (report.content_type === 'SONG' && report.content_id) {
        await api.delete(`/songs/${report.content_id}`);
      } else if (report.content_type === 'CODING_NOTE' && report.content_id) {
        await api.delete(`/coding-notes/${report.content_id}`);
      } else if (report.content_type === 'TRAVEL_NOTE' && report.content_id) {
        await api.delete(`/travel-notes/${report.content_id}`);
      }
      await handleAction(report.id, 'RESOLVED', 'DELETE_CONTENT');
      showToast('success', 'Reported content deleted and report resolved.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete reported content');
    }
  };

  const renderContentTypeBadge = (type?: string) => {
    switch (type) {
      case 'VIDEO':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
            <Film className="w-3 h-3" /> VIDEO
          </span>
        );
      case 'SONG':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
            <Music className="w-3 h-3" /> SONG
          </span>
        );
      case 'CODING_NOTE':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1">
            <Code2 className="w-3 h-3" /> CODE
          </span>
        );
      case 'TRAVEL_NOTE':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
            <FileText className="w-3 h-3" /> TRAVEL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-gray-300 text-[10px] font-bold flex items-center gap-1">
            <User className="w-3 h-3" /> USER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 pb-28 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#121824] border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
            Community Moderation & UGC Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user flags, toxic messages, reported videos, songs, notes, and enforce safety rules.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
          {['', 'PENDING', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st || 'All Reports'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {isLoading && reports.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Loading moderation queue...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121824] border border-white/10 text-center text-slate-400 text-sm">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          No moderation reports in this view.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-3xl bg-[#121824] border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      r.status === 'PENDING'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : r.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {r.status}
                  </span>
                  {renderContentTypeBadge(r.content_type)}
                  <span className="text-xs font-bold text-white">Reason: {r.reason}</span>
                </div>
                <span className="text-xs text-slate-400">{formatTimestamp(r.created_at)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-slate-400">Reported User:</span>{' '}
                  <strong className="text-white">{r.reported_user_name || r.reported_user_id}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Reporter:</span>{' '}
                  <span className="text-slate-300">{r.reporter_name || r.reporter_id}</span>
                </div>
                {r.item_title && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Item Title:</span>{' '}
                    <span className="text-purple-300 font-bold">{r.item_title}</span>
                  </div>
                )}
                {r.details && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Details:</span>{' '}
                    <span className="text-slate-200">{r.details}</span>
                  </div>
                )}
                {r.reported_message_content && (
                  <div className="sm:col-span-2 p-2 rounded-xl bg-black/40 border border-rose-500/20 text-rose-300 italic">
                    Reported Message: "{r.reported_message_content}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/5">
                {r.status === 'PENDING' && (
                  <>
                    {r.content_id && (
                      <button
                        onClick={() => handleDeleteReportedContent(r)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Content
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(r.id, 'RESOLVED', 'WARNING_ISSUED')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
                    >
                      Issue Warning
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'RESOLVED', 'MUTE_USER')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <VolumeX className="h-3.5 w-3.5" />
                      Mute User
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'RESOLVED', 'BAN_USER')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Ban Account
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'DISMISSED', 'NO_ACTION')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
