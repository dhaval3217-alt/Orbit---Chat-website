import React, { useEffect, useRef, useState } from 'react';
import { useSongStore } from '../store/songStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { useConnectionStore } from '../store/connectionStore.js';
import { useMusicSessionStore } from '../store/musicSessionStore.js';
import { Song } from '../types/index.js';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Heart,
  Headphones,
  Sparkles,
  Upload,
  X,
  Search,
  Disc3,
  Users,
  Radio,
  PhoneOff,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const GENRES = ['All', 'Synthwave', 'Electronic', 'Future Funk', 'Indie', 'Cyberpunk', 'Ambient'];

export const MusicVibePage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const {
    musicSongs,
    chillSongs,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    fetchSongs,
    uploadSong,
    uploadSongFile,
    deleteSong,
    toggleLike,
    playSong,
    pauseSong,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    isLoading,
  } = useSongStore();
  const { showToast } = useUiStore();
  const { connections, fetchConnections } = useConnectionStore();

  const {
    status: sessionStatus,
    pendingInvite,
    activeSession,
    sendInvite,
    cancelInvite,
    respondInvite,
    leaveSession,
    pushSync,
    initSocketListeners,
  } = useMusicSessionStore();

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTargetId, setInviteTargetId] = useState('');
  const previewUrlRef = useRef<string | null>(null);

  // Push sync every 5 s while session is active
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchSongs();
    fetchConnections();
    const unsub = initSocketListeners();
    return () => {
      unsub();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (sessionStatus === 'active' && currentTrack) {
      syncIntervalRef.current = setInterval(() => {
        pushSync(currentTrack.id, currentTime, isPlaying);
      }, 5000);
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [sessionStatus, currentTrack?.id, currentTime, isPlaying]);

  // Show toast when session invite arrives
  useEffect(() => {
    if (sessionStatus === 'invite_received' && pendingInvite) {
      showToast('info', `${pendingInvite.fromName} wants to listen together!`);
    }
  }, [sessionStatus, pendingInvite?.sessionId]);

  const handleAudioFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showToast('error', 'Audio files must be 50 MB or smaller.');
      return;
    }
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/oga'];
    const nameMatches = /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);
    if (!allowed.includes(file.type) && !nameMatches) {
      showToast('error', 'Unsupported audio format. Please choose MP3, WAV, M4A, AAC, or OGG.');
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(file);
    setSelectedAudioFile(file);
    setSelectedAudioName(file.name);
    setSelectedAudioSize(file.size);
    setAudioUrl(previewUrlRef.current);
  };

  // Upload Modal State
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('Synthwave');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [selectedAudioName, setSelectedAudioName] = useState('');
  const [selectedAudioSize, setSelectedAudioSize] = useState(0);

  const closeUploadModal = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setAudioUrl('');
    setSelectedAudioFile(null);
    setSelectedAudioName('');
    setSelectedAudioSize(0);
    setShowUploadModal(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !artistName.trim()) {
      showToast('error', 'Song title and artist are required');
      return;
    }
    if (!selectedAudioFile && !audioUrl.trim()) {
      showToast('error', 'Select a music file from your device or paste a URL to upload');
      return;
    }
    setIsUploading(true);
    try {
      if (selectedAudioFile) {
        const uploaded = await uploadSongFile({
          file: selectedAudioFile,
          title: songTitle.trim(),
          artist: artistName.trim(),
          genre: genre.trim() || 'Electronic',
          duration_seconds: 210,
          cover_url: coverUrl.trim() || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
          category: 'MUSIC',
          is_public: true,
        });
        showToast('success', `${uploaded.title} uploaded.`);
      } else {
        await uploadSong({
          title: songTitle.trim(),
          artist: artistName.trim(),
          genre: genre.trim() || 'Electronic',
          duration_seconds: 210,
          audio_url: audioUrl.trim(),
          cover_url: coverUrl.trim() || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
          category: 'MUSIC',
          is_public: true,
        });
        showToast('success', 'Song added!');
      }
      setSongTitle(''); setArtistName(''); setCoverUrl('');
      closeUploadModal();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload song');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (songId: string) => {
    if (!window.confirm('Delete this uploaded track?')) return;
    try {
      await deleteSong(songId);
      showToast('info', 'Track removed.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete track');
    }
  };

  const handleSendInvite = () => {
    if (!inviteTargetId || !currentTrack) return;
    const conn = connections.find((c) => {
      const peer = c.user ?? c.partner;
      return peer?.id === inviteTargetId;
    });
    const peer = conn?.user ?? conn?.partner;
    sendInvite(
      inviteTargetId,
      peer?.display_name || 'Orbit User',
      peer?.avatar_url ||
        (peer && 'avatar' in peer ? peer.avatar : undefined) ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${inviteTargetId}`,
      currentTrack
    );
    setShowInviteModal(false);
    setInviteTargetId('');
    showToast('info', 'Music session invite sent!');
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const librarySongs = [...musicSongs, ...chillSongs];
  const filteredSongs = librarySongs.filter((song) => {
    const matchesGenre = selectedGenre === 'All' || song.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.uploader_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const connectedPeers = connections
    .map((c) => c.user ?? c.partner)
    .filter((p): p is NonNullable<typeof p> => !!p?.id && p.id !== user?.id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* ── Incoming invite banner ── */}
      {sessionStatus === 'invite_received' && pendingInvite && (
        <div className="p-4 rounded-2xl bg-pink-950/60 border border-pink-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <img
              src={pendingInvite.fromAvatar}
              alt=""
              className="h-10 w-10 rounded-xl object-cover border border-pink-500/30"
            />
            <div>
              <p className="text-sm font-bold text-white">{pendingInvite.fromName} wants to listen together</p>
              <p className="text-xs text-pink-300 truncate">🎵 {pendingInvite.song.title} — {pendingInvite.song.artist}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => respondInvite(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              <CheckCircle className="h-4 w-4" /> Accept
            </button>
            <button
              onClick={() => respondInvite(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-500/30 transition"
            >
              <XCircle className="h-4 w-4" /> Decline
            </button>
          </div>
        </div>
      )}

      {/* ── Active session banner ── */}
      {sessionStatus === 'active' && activeSession && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <img
              src={activeSession.partnerAvatar}
              alt=""
              className="h-8 w-8 rounded-xl object-cover border border-emerald-500/30"
            />
            <div>
              <p className="text-xs font-bold text-emerald-300">Listening together with {activeSession.partnerName}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {activeSession.song.title} — {activeSession.song.artist}
              </p>
            </div>
          </div>
          <button
            onClick={() => { leaveSession(); showToast('info', 'Left the music session.'); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/20 transition"
          >
            <PhoneOff className="h-4 w-4" /> Leave Session
          </button>
        </div>
      )}

      {/* ── Sent invite pending ── */}
      {sessionStatus === 'invite_sent' && activeSession && (
        <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
            Waiting for <span className="font-bold text-white">{activeSession.partnerName}</span> to accept…
          </div>
          <button
            onClick={() => { cancelInvite(activeSession.partnerId); showToast('info', 'Invite cancelled.'); }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Vibe Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121824] via-pink-950/40 to-[#121824] border border-pink-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[11px] font-bold">
              <Disc3 className="h-3.5 w-3.5 animate-spin" />
              <span>Orbit Chill with Music Library</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Chill with Music 🎵</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Relax, discover tracks with friends, and share the vibes in a mellow social sound lounge.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {connectedPeers.length > 0 && currentTrack && sessionStatus === 'idle' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-2 transition"
              >
                <Users className="h-4 w-4" />
                <span>Listen Together</span>
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-pink-500/30 flex items-center gap-2 active-scale touch-target transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Music</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Music Player Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121824] to-slate-900/90 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentTrack?.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300'}
                alt="Track Artwork"
                className={`h-16 w-16 rounded-2xl object-cover border border-white/10 shadow-lg ${isPlaying ? 'ring-2 ring-pink-500' : ''}`}
              />
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-pink-400 animate-bounce rounded-full" />
                    <span className="w-1 h-5 bg-pink-400 animate-bounce delay-100 rounded-full" />
                    <span className="w-1 h-2 bg-pink-400 animate-bounce delay-200 rounded-full" />
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                {sessionStatus === 'active' ? `🎵 Synced with ${activeSession?.partnerName}` : isPlaying ? 'Now Playing' : 'Selected Track'}
              </span>
              <h3 className="text-base font-extrabold text-white truncate">
                {currentTrack?.title || 'Select a song from library below'}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {currentTrack ? `${currentTrack.artist} • ${currentTrack.uploader_name} • ${currentTrack.genre}` : 'Tap play to listen'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={prevTrack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active-scale touch-target" title="Previous">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                togglePlay();
                if (sessionStatus === 'active' && currentTrack) {
                  pushSync(currentTrack.id, currentTime, !isPlaying);
                }
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-xl shadow-pink-500/30 transition-all active-scale touch-target"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </button>
            <button onClick={nextTrack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active-scale touch-target" title="Next">
              <SkipForward className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
              <button onClick={toggleMute} className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-white/10 rounded-lg accent-pink-500 cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <input type="range" min={0} max={duration || 100} value={currentTime}
            onChange={(e) => {
              seekTo(parseFloat(e.target.value));
              if (sessionStatus === 'active' && currentTrack) {
                pushSync(currentTrack.id, parseFloat(e.target.value), isPlaying);
              }
            }}
            className="w-full h-2 bg-white/10 rounded-lg accent-pink-500 cursor-pointer transition-all" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || currentTrack?.duration_seconds || 180)}</span>
          </div>
        </div>
      </div>

      {/* Genre Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {GENRES.map((g) => (
            <button key={g} onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedGenre === g ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}>{g}</button>
          ))}
        </div>
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, artists..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500" />
        </div>
      </div>

      {/* Music Library */}
      <div className="space-y-3">
        {isLoading && librarySongs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">Loading music library...</div>
        ) : filteredSongs.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#121824] border border-white/10 text-center space-y-3">
            <Headphones className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No tracks found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload your own audio creations to share with fellow Orbit music lovers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((song) => {
              const isCurrent = currentTrack?.id === song.id;
              const isOwner = song.user_id === user?.id;
              return (
                <div key={song.id} className={`p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 group shadow-xl ${
                  isCurrent ? 'bg-gradient-to-br from-pink-950/60 to-[#121824] border-pink-500/50 ring-1 ring-pink-500/40'
                    : 'bg-[#121824] border-white/10 hover:border-white/20 hover:bg-[#182030]'
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => {
                        if (isCurrent && isPlaying) { pauseSong(); } else {
                          playSong(song, filteredSongs);
                          if (sessionStatus === 'active') pushSync(song.id, 0, true);
                        }
                      }}
                      className="relative h-12 w-12 rounded-2xl bg-indigo-950 shrink-0 overflow-hidden group/btn active-scale"
                    >
                      <img src={song.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300'} alt={song.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover/btn:opacity-100 transition-opacity">
                        {isCurrent && isPlaying ? <Pause className="h-5 w-5 text-pink-400 fill-current" /> : <Play className="h-5 w-5 text-white fill-current ml-0.5" />}
                      </div>
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">{song.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="text-pink-400 font-semibold">{song.genre}</span>
                        <span>•</span>
                        <span>by {song.uploader_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => toggleLike(song.id)}
                      className={`p-2 rounded-xl transition-all ${song.liked_by_me ? 'text-pink-400 bg-pink-500/10' : 'text-slate-400 hover:text-pink-400 hover:bg-white/5'}`}>
                      <Heart className={`h-4 w-4 ${song.liked_by_me ? 'fill-current' : ''}`} />
                      <span className="text-[10px] ml-1 font-bold">{song.likes_count}</span>
                    </button>
                    {isOwner && (
                      <button onClick={() => handleDelete(song.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Listen Together Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#121824] border border-indigo-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Listen Together</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            {currentTrack && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <img src={currentTrack.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300'} alt="" className="h-10 w-10 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Select a connection</label>
              <select value={inviteTargetId} onChange={(e) => setInviteTargetId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="">Choose someone…</option>
                {connectedPeers.map((p) => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition border border-white/10">
                Cancel
              </button>
              <button onClick={handleSendInvite} disabled={!inviteTargetId}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Send className="h-4 w-4" /> Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Song Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121824] border border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={closeUploadModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload to Chill with Music</h3>
                <p className="text-xs text-slate-400">Add a track from your phone or desktop storage</p>
              </div>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Track Title *</label>
                <input type="text" value={songTitle} onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon" required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Artist / Producer Name *</label>
                <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g. ElectroWave" required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500">
                  <option value="Synthwave">Synthwave</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Future Funk">Future Funk</option>
                  <option value="Indie">Indie</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Deep House">Deep House</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Music File from Device</label>
                <input type="file" accept="audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg"
                  onChange={handleAudioFileSelect}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white file:mr-3 file:rounded-full file:border-0 file:bg-pink-600 file:px-3 file:py-1.5 file:text-white file:font-bold" />
                {(selectedAudioName || audioUrl) && (
                  <div className="mt-2 rounded-xl border border-pink-500/30 bg-pink-500/5 p-3 text-[11px] text-pink-100">
                    <div className="font-bold">{selectedAudioName || 'Selected audio preview'}</div>
                    <div className="text-pink-200/80 mt-1">{selectedAudioSize ? `${(selectedAudioSize / (1024 * 1024)).toFixed(2)} MB` : 'Ready to upload'}</div>
                    {audioUrl && <audio controls src={audioUrl} className="mt-2 w-full h-8" />}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Or use a stream URL</label>
                <input type="url" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://… (optional if device file selected)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Cover Artwork URL (Optional)</label>
                <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/…"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={closeUploadModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30 transition-all flex items-center gap-1.5 active-scale">
                  <Sparkles className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading…' : '+ Add Music'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
