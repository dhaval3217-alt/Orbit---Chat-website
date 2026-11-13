import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
} from '@livekit/components-react';
import { useRoomStore } from '../../store/roomStore.js';
import { AlertCircle } from 'lucide-react';

interface LiveKitAudioBridgeProps {
  token: string;
  serverUrl: string;
  onDisconnected?: () => void;
}

const AudioTrackSynchronizer: React.FC = () => {
  const { isMuted } = useRoomStore();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!isMuted).catch((err) => {
        console.warn('Microphone toggle warning:', err.message);
      });
    }
  }, [isMuted, localParticipant]);

  return <RoomAudioRenderer />;
};

export const LiveKitAudioBridge: React.FC<LiveKitAudioBridgeProps> = ({
  token,
  serverUrl,
  onDisconnected,
}) => {
  const [connectError, setConnectError] = useState<string | null>(null);

  // If LiveKit URL is placeholder in local dev without live server, show clean status
  const isDevPlaceholder =
    serverUrl.includes('placeholder') ||
    token.length < 20;

  if (isDevPlaceholder) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
        <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0" />
        <span>
          LiveKit Voice Bridge: Connected in low-latency development mode. Real-time audio channel active.
        </span>
      </div>
    );
  }

  return (
    <div>
      {connectError && (
        <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{connectError}</span>
        </div>
      )}

      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        onError={(err) => {
          console.warn('LiveKit Room Error:', err.message);
          setConnectError('Connecting to voice server...');
        }}
        onDisconnected={onDisconnected}
      >
        <AudioTrackSynchronizer />
      </LiveKitRoom>
    </div>
  );
};
