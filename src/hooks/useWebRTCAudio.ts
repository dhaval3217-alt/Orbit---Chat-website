/**
 * useWebRTCAudio — real browser WebRTC peer-to-peer audio hook.
 *
 * Works on local WiFi without any LiveKit or external TURN server
 * for connections on the same network. For cross-network calls a
 * TURN server is required; the hook attempts STUN first and falls
 * back gracefully if ICE fails.
 *
 * Usage:
 *   const { startCall, acceptCall, hangUp, toggleMute, isMuted, callState } = useWebRTCAudio(partnerId);
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { socketClient } from '../socket/socketClient.js';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'error';

interface UseWebRTCAudioResult {
  callState: CallState;
  isMuted: boolean;
  error: string | null;
  startCall: () => Promise<void>;
  acceptCall: (sdp: RTCSessionDescriptionInit) => Promise<void>;
  hangUp: () => void;
  toggleMute: () => void;
  incomingOffer: RTCSessionDescriptionInit | null;
  callerUserId: string | null;
  clearIncoming: () => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Add TURN credentials here for cross-network calls:
  // { urls: 'turn:your-turn-server:3478', username: 'user', credential: 'pass' }
];

export function useWebRTCAudio(partnerId: string | null): UseWebRTCAudioResult {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [callerUserId, setCallerUserId] = useState<string | null>(null);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, []);

  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && partnerId) {
        socketClient.emit('webrtc:ice_candidate', { peerId: partnerId, candidate: candidate.toJSON() });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteAudioRef.current) {
        remoteAudioRef.current = new Audio();
        remoteAudioRef.current.autoplay = true;
      }
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
      setCallState('connected');
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setCallState('ended');
        cleanup();
      }
    };

    return pc;
  }, [partnerId, cleanup]);

  const getMic = async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return stream;
  };

  const startCall = useCallback(async () => {
    if (!partnerId) return;
    try {
      setError(null);
      setCallState('calling');
      cleanup();

      const stream = await getMic();
      localStreamRef.current = stream;

      const pc = createPC();
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      socketClient.emit('webrtc:offer', { peerId: partnerId, sdp: offer });
    } catch (err: any) {
      setError(err.message || 'Could not start call. Check microphone permissions.');
      setCallState('error');
      cleanup();
    }
  }, [partnerId, cleanup, createPC]);

  const acceptCall = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if (!partnerId) return;
    try {
      setError(null);
      cleanup();

      const stream = await getMic();
      localStreamRef.current = stream;

      const pc = createPC();
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketClient.emit('webrtc:answer', { peerId: partnerId, sdp: answer });
      setCallState('connected');
      setIncomingOffer(null);
      setCallerUserId(null);
    } catch (err: any) {
      setError(err.message || 'Could not accept call. Check microphone permissions.');
      setCallState('error');
      cleanup();
    }
  }, [partnerId, cleanup, createPC]);

  const hangUp = useCallback(() => {
    if (partnerId) {
      socketClient.emit('webrtc:hangup', { peerId: partnerId });
    }
    cleanup();
    setCallState('ended');
    setIncomingOffer(null);
    setCallerUserId(null);
  }, [partnerId, cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  const clearIncoming = useCallback(() => {
    setIncomingOffer(null);
    setCallerUserId(null);
  }, []);

  // Socket listeners
  useEffect(() => {
    const unsubOffer = socketClient.on(
      'webrtc:offer',
      (data: { fromUserId: string; sdp: RTCSessionDescriptionInit }) => {
        setIncomingOffer(data.sdp);
        setCallerUserId(data.fromUserId);
        setCallState('ringing');
      }
    );

    const unsubAnswer = socketClient.on(
      'webrtc:answer',
      async (data: { fromUserId: string; sdp: RTCSessionDescriptionInit }) => {
        const pc = pcRef.current;
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } catch (err: any) {
          setError('Failed to establish audio connection: ' + err.message);
        }
      }
    );

    const unsubICE = socketClient.on(
      'webrtc:ice_candidate',
      async (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
        const pc = pcRef.current;
        if (!pc || !data.candidate) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {
          // Benign: sometimes ICE candidates arrive before remote description
        }
      }
    );

    const unsubHangup = socketClient.on('webrtc:hangup', () => {
      cleanup();
      setCallState('ended');
      setIncomingOffer(null);
      setCallerUserId(null);
    });

    return () => {
      unsubOffer();
      unsubAnswer();
      unsubICE();
      unsubHangup();
    };
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  return {
    callState,
    isMuted,
    error,
    startCall,
    acceptCall,
    hangUp,
    toggleMute,
    incomingOffer,
    callerUserId,
    clearIncoming,
  };
}
