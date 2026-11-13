import React, { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore.js';
import { useUiStore } from '../store/uiStore.js';
import { Radio, Users, XCircle } from 'lucide-react';

export const AdminRoomsPage: React.FC = () => {
  const { rooms, fetchAdminRooms, closeRoom } = useAdminStore();
  const { showToast } = useUiStore();

  useEffect(() => {
    fetchAdminRooms();
  }, []);

  const handleCloseRoom = async (roomId: string) => {
    try {
      await closeRoom(roomId);
      showToast('success', 'Room terminated by administrator');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to terminate room');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-white/10">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Radio className="h-6 w-6 text-cyan-400" />
          Live Room Operations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor all active audio lounges and terminate problematic rooms in real time.
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121824] border border-white/10 text-center text-slate-400 text-sm">
          No active rooms currently running.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl bg-[#121824] border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {room.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {room.participant_count || 0} / {room.max_participants}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{room.title}</h3>
                <p className="text-xs text-indigo-400">Vibe: {room.mood_label || 'None'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  LK: {room.livekit_room_name}
                </span>
                <button
                  onClick={() => handleCloseRoom(room.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Close Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
