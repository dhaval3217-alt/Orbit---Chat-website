import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore.js';
import { useUiStore } from '../store/uiStore.js';
import { LiveKitAudioBridge } from '../components/audio/LiveKitAudioBridge.js';
import { AudioControls } from '../components/audio/AudioControls.js';
import { ParticipantList } from '../components/audio/ParticipantList.js';
import { ChatPanel } from '../components/chat/ChatPanel.js';
import { SafetyGuidelinesModal } from '../components/safety/SafetyGuidelinesModal.js';
import { socketClient } from '../socket/socketClient.js';
import {
  Radio,
  Users,
  ShieldAlert,
  ArrowLeft,
  MessageSquare,
  Info,
  Share2,
  X,
} from 'lucide-react';

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useUiStore();

  const {
    currentRoom,
    participants,
    liveKitToken,
    liveKitUrl,
    joinRoom,
    leaveRoom,
    updateParticipant,
    removeParticipant,
    setCurrentRoom,
  } = useRoomStore();

  const [activeMobileTab, setActiveMobileTab] = useState<'stage' | 'chat'>(
    searchParams.get('tab') === 'chat' ? 'chat' : 'stage'
  );
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    if (!currentRoom || currentRoom.id !== roomId) {
      joinRoom(roomId);
    }

    const unsubJoined = socketClient.on('room:participant_joined', (data: any) => {
      if (data.roomId === roomId && data.participant) {
        updateParticipant(data.participant);
      }
    });

    const unsubLeft = socketClient.on('room:participant_left', (data: any) => {
      if (data.roomId === roomId) {
        removeParticipant(data.userId);
      }
    });

    const unsubUpdated = socketClient.on('room:participant_updated', (data: any) => {
      if (data.roomId === roomId && data.participant) {
        updateParticipant(data.participant);
      }
    });

    const unsubRoomUpdate = socketClient.on('room:update', (data: any) => {
      if (data.room && data.room.id === roomId) {
        setCurrentRoom(data.room);
      }
    });

    const unsubNewMsg = socketClient.on('chat:new_message', (data: any) => {
      if (data.roomId === roomId && activeMobileTab !== 'chat') {
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubJoined();
      unsubLeft();
      unsubUpdated();
      unsubRoomUpdate();
      unsubNewMsg();
    };
  }, [roomId, activeMobileTab]);

  const handleLeave = async () => {
    setShowLeaveConfirm(false);
    await leaveRoom();
    navigate('/dashboard');
  };

  const handleSwitchTab = (tab: 'stage' | 'chat') => {
    setActiveMobileTab(tab);
    if (tab === 'chat') {
      setUnreadChatCount(0);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Orbit Lounge: ${currentRoom?.title || 'Live Audio'}`,
          text: 'Hop into this live Orbit audio room with me!',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Room link copied to clipboard!');
    }
  };

  if (!currentRoom || !roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] text-slate-400 text-sm gap-3">
        <Radio className="h-8 w-8 text-indigo-400 animate-pulse" />
        <p className="font-semibold text-slate-200">Connecting to live audio lounge...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 lg:pb-0">
      {/* Mobile Top App Bar for Audio Room */}
      <div className="flex items-center justify-between p-3.5 sm:p-5 rounded-3xl bg-[#121824] border border-white/10 shadow-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 active-scale touch-target shrink-0 transition-colors"
            title="Leave Room"
            aria-label="Leave Room"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <h1 className="text-base sm:text-lg font-extrabold text-white truncate">
                {currentRoom.title}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentRoom.mood_label ? `✨ Vibe: ${currentRoom.mood_label}` : 'Live Anonymous Audio'}
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleSwitchTab('stage')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold active-scale"
          >
            <Users className="h-3.5 w-3.5" />
            <span>{participants.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active-scale touch-target"
            title="Share Room Link"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>

          <button
            onClick={() => setShowRoomInfo(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active-scale touch-target"
            title="Room Details & Safety"
          >
            <Info className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible on mobile screens) */}
      <div className="lg:hidden flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
        <button
          onClick={() => handleSwitchTab('stage')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeMobileTab === 'stage'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Stage ({participants.length})</span>
        </button>

        <button
          onClick={() => handleSwitchTab('chat')}
          className={`relative flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeMobileTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Room Chat</span>
          {unreadChatCount > 0 && activeMobileTab !== 'chat' && (
            <span className="min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center">
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>

      {/* LiveKit Real-Time Voice Bridge */}
      {liveKitToken && liveKitUrl && (
        <LiveKitAudioBridge
          token={liveKitToken}
          serverUrl={liveKitUrl}
          onDisconnected={handleLeave}
        />
      )}

      {/* Main Content Layout: Responsive Dual Grid on Desktop, Tabbed on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[480px]">
        {/* Stage / Participants Stage Area */}
        <div
          className={`lg:col-span-7 flex flex-col justify-between space-y-4 ${
            activeMobileTab === 'chat' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-5 sm:p-6 rounded-3xl bg-[#121824] border border-white/10 flex-1 shadow-2xl">
            <ParticipantList participants={participants} />
          </div>

          <div className="hidden lg:block">
            <AudioControls onLeave={() => setShowLeaveConfirm(true)} />
          </div>
        </div>

        {/* Live Chat Panel Area */}
        <div
          className={`lg:col-span-5 h-[520px] lg:h-auto ${
            activeMobileTab === 'stage' ? 'hidden lg:block' : 'block'
          }`}
        >
          <ChatPanel roomId={roomId} />
        </div>
      </div>

      {/* Mobile Floating Bottom Audio Controls Dock */}
      <AudioControls
        onLeave={handleLeave}
        activeTab={activeMobileTab}
        onToggleTab={handleSwitchTab}
        unreadCount={unreadChatCount}
        onOpenParticipants={() => handleSwitchTab('stage')}
      />

      {/* Room Information Sheet Modal */}
      {showRoomInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#121824] border border-white/10 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowRoomInfo(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentRoom.title}</h3>
                <p className="text-xs text-slate-400">{currentRoom.type}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Vibe:</span>
                <span className="font-bold text-white">{currentRoom.mood_label || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacity:</span>
                <span className="font-bold text-white">
                  {participants.length} / {currentRoom.max_participants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audio Privacy:</span>
                <span className="text-emerald-400 font-bold">Anonymous Voice</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowRoomInfo(false);
                  setShowSafetyModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                <span>View Community Guidelines</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Guidelines Modal */}
      <SafetyGuidelinesModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
      />

      {/* Leave Room Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#121824] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Leave this room?</h3>
                <p className="text-xs text-slate-400">Your audio and chat will disconnect.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                Stay
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-600/20"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

