import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useConnectionStore } from '../store/connectionStore.js';
import { useTalkStore } from '../store/talkStore.js';
import { useGameStore } from '../store/gameStore.js';
import { useUiStore } from '../store/uiStore.js';
import { api } from '../services/api.js';
import { InterestTag as InterestTagType, User, Song, CodingNote, TravelNote, MovieVideo } from '../types/index.js';
import { InterestTag } from '../components/cards/InterestTag.js';
import { DEFAULT_AVATARS } from '../utils/avatars.js';
import { SafetyGuidelinesModal } from '../components/safety/SafetyGuidelinesModal.js';
import {
  Save,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Lock,
  UserPlus,
  CheckCircle2,
  Clock,
  UserCheck,
  PhoneCall,
  Gamepad2,
  Radio,
  Music,
  Code2,
  Compass,
  Film,
  Ban,
  Flag,
  ArrowLeft,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { user, profile, updateProfile, logout, isLoading } = useAuthStore();
  const { showToast } = useUiStore();

  const isOwnProfile = !userId || userId === user?.id;

  // Connection store for viewing other profiles
  const {
    myConnections,
    incomingRequests,
    sentRequests,
    fetchConnections,
    sendRequest,
    respondToRequest,
    cancelRequest,
    removeConnection,
  } = useConnectionStore();

  const { sendTalkRequest } = useTalkStore();
  const { sendChallenge } = useGameStore();

  // Target User Profile State (when viewing another user)
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [userNotes, setUserNotes] = useState<CodingNote[]>([]);
  const [userTravel, setUserTravel] = useState<TravelNote[]>([]);
  const [userVideos, setUserVideos] = useState<MovieVideo[]>([]);
  const [activeContentTab, setActiveContentTab] = useState<'SONGS' | 'NOTES' | 'TRAVEL' | 'VIDEOS'>('SONGS');

  // Own profile form states
  const [availableTags, setAvailableTags] = useState<InterestTagType[]>([]);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || DEFAULT_AVATARS[0]);
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    profile?.interests?.map((i) => i.id) || []
  );
  const [realName, setRealName] = useState(profile?.real_name || '');
  const [realBio, setRealBio] = useState(profile?.real_bio || '');
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (isOwnProfile) {
      api.get<InterestTagType[]>('/profiles/tags').then(setAvailableTags).catch(console.error);
      if (profile) {
        setDisplayName(profile.display_name);
        setAvatarUrl(profile.avatar_url);
        setBio(profile.bio || '');
        setSelectedTagIds(profile.interests?.map((i) => i.id) || []);
        setRealName(profile.real_name || '');
        setRealBio(profile.real_bio || '');
      }
    } else if (userId) {
      setTargetLoading(true);
      api
        .get<User>(`/profiles/${userId}`)
        .then((u) => {
          setTargetUser(u);
          const name = u.display_name || '';
          if (name) {
            api.get<Song[]>(`/songs?search=${name}`).then(setUserSongs).catch(() => {});
            api.get<CodingNote[]>(`/coding-notes?search=${name}`).then(setUserNotes).catch(() => {});
            api.get<TravelNote[]>(`/travel-notes?search=${name}`).then(setUserTravel).catch(() => {});
            api.get<MovieVideo[]>(`/movie-videos?search=${name}`).then(setUserVideos).catch(() => {});
          }
        })
        .catch(() => {
          showToast('error', 'User not found');
        })
        .finally(() => setTargetLoading(false));
    }
  }, [userId, isOwnProfile, profile]);

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(selectedTagIds.filter((t) => t !== id));
    } else {
      if (selectedTagIds.length >= 5) {
        showToast('warning', 'You can select up to 5 interests.');
        return;
      }
      setSelectedTagIds([...selectedTagIds, id]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('error', 'Display name cannot be empty');
      return;
    }
    if (selectedTagIds.length < 3) {
      showToast('error', 'Please select at least 3 interests');
      return;
    }

    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        interest_ids: selectedTagIds,
        real_name: realName,
        real_bio: realBio,
      });
      showToast('success', 'Profile updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Connection State for Target User
  const isConnected = myConnections.some(
    (c) => c.partner?.id === userId || c.requester_id === userId || c.recipient_id === userId
  );
  const incomingReq = incomingRequests.find(
    (r) => r.partner?.id === userId || r.requester_id === userId
  );
  const sentReq = sentRequests.find(
    (r) => r.partner?.id === userId || r.recipient_id === userId
  );

  const handleSendTalk = async () => {
    if (!userId) return;
    try {
      await sendTalkRequest(userId);
      showToast('success', 'Request to Talk sent!');
    } catch (err: any) {
      showToast('error', err.message || 'Could not send talk request');
    }
  };

  const handleSendGame = async () => {
    if (!userId) return;
    try {
      await sendChallenge(userId, 'SNAKE');
      showToast('success', 'Game challenge sent!');
    } catch (err: any) {
      showToast('error', err.message || 'Could not send game challenge');
    }
  };

  const handleBlockUser = async () => {
    if (!userId || !window.confirm('Are you sure you want to block this user?')) return;
    try {
      await api.post(`/safety/block`, { blocked_user_id: userId });
      showToast('info', 'User has been blocked.');
      navigate('/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to block user');
    }
  };

  const handleReportUser = async () => {
    if (!userId) return;
    const reason = window.prompt('Please enter the reason for reporting this user:');
    if (!reason) return;
    try {
      await api.post('/safety/reports', {
        reported_user_id: userId,
        content_type: 'USER',
        reason,
      });
      showToast('success', 'Report submitted to moderators.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit report');
    }
  };

  const isAdminOrMod = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  // --------------------------------------------------------------------------
  // VIEWING ANOTHER USER'S PROFILE
  // --------------------------------------------------------------------------
  if (!isOwnProfile) {
    if (targetLoading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
        </div>
      );
    }

    if (!targetUser) {
      return (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#0d111c] border border-white/10 text-center text-white mt-12">
          <h2 className="text-xl font-bold mb-2">User Not Found</h2>
          <p className="text-xs text-gray-400 mb-6">The profile you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => navigate('/connections')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Back to Connections
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-28 text-white">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Target Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#0d111c] to-purple-950/40 border border-indigo-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img
                src={targetUser.avatar || targetUser.avatar_url || DEFAULT_AVATARS[0]}
                alt={targetUser.display_name || 'User'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-indigo-500 shadow-xl shadow-indigo-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[#0d111c]" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{targetUser.display_name || 'Orbit Member'}</h1>
                  <p className="text-xs text-indigo-300 font-mono">@{targetUser.username || 'user'}</p>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold self-center sm:self-auto">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  {targetUser.current_vibe || 'Orbit Member'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed mb-6">
                {targetUser.bio || 'Exploring vibes and connecting on Orbit!'}
              </p>

              {/* Dynamic Connection Status & Actions Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                {/* 1. Connection State Button */}
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      <UserCheck className="w-4 h-4" />
                      Connected
                    </span>
                    <button
                      onClick={() => removeConnection(userId!)}
                      className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-xs font-semibold transition"
                      title="Remove Connection"
                    >
                      Remove
                    </button>
                  </div>
                ) : incomingReq ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await respondToRequest(incomingReq.id, 'ACCEPT');
                        showToast('success', 'Connection request accepted!');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Request
                    </button>
                    <button
                      onClick={async () => {
                        await respondToRequest(incomingReq.id, 'DECLINE');
                        showToast('info', 'Connection request declined.');
                      }}
                      className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold transition"
                    >
                      Decline
                    </button>
                  </div>
                ) : sentReq ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      Request Sent (Pending)
                    </span>
                    <button
                      onClick={() => cancelRequest(sentReq.id)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => sendRequest(targetUser.id)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    Send Connection Request
                  </button>
                )}

                {/* 2. Instant Voice Talk */}
                <button
                  onClick={handleSendTalk}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-bold transition active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Request to Talk
                </button>

                {/* 3. Challenge Game */}
                <button
                  onClick={handleSendGame}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-300 text-xs font-bold transition active:scale-95"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  Arcade Challenge
                </button>

                {/* 4. Safety options */}
                <button
                  onClick={handleReportUser}
                  className="p-2 rounded-xl bg-white/5 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-300 transition"
                  title="Report User"
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBlockUser}
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition"
                  title="Block User"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User's Published Content Tabs */}
        <div className="bg-[#0d111c] border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveContentTab('SONGS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeContentTab === 'SONGS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Shared Songs ({userSongs.length})
            </button>
            <button
              onClick={() => setActiveContentTab('NOTES')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeContentTab === 'NOTES'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code Snippets ({userNotes.length})
            </button>
            <button
              onClick={() => setActiveContentTab('TRAVEL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeContentTab === 'TRAVEL'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Travel Diaries ({userTravel.length})
            </button>
            <button
              onClick={() => setActiveContentTab('VIDEOS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeContentTab === 'VIDEOS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movie Clips ({userVideos.length})
            </button>
          </div>

          {/* Content Lists */}
          {activeContentTab === 'SONGS' && (
            <div className="space-y-3">
              {userSongs.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-6">No songs uploaded yet.</p>
              ) : (
                userSongs.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={s.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                        alt={s.title}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{s.title}</div>
                        <div className="text-[11px] text-gray-400">{s.artist}</div>
                      </div>
                    </div>
                    <span className="text-xs text-purple-400 font-mono">{s.genre}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeContentTab === 'NOTES' && (
            <div className="space-y-3">
              {userNotes.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-6">No code snippets shared yet.</p>
              ) : (
                userNotes.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                      <span className="text-[10px] text-cyan-400 font-mono">{n.language}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{n.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeContentTab === 'TRAVEL' && (
            <div className="space-y-3">
              {userTravel.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-6">No travel diaries shared yet.</p>
              ) : (
                userTravel.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-sm font-bold text-amber-300">{t.destination}</h4>
                    <p className="text-xs text-gray-300 line-clamp-2 mt-1">{t.experience}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeContentTab === 'VIDEOS' && (
            <div className="space-y-3">
              {userVideos.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-6">No movie clips shared yet.</p>
              ) : (
                userVideos.map((v) => (
                  <div key={v.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-sm font-bold text-red-300">{v.movie_name}</h4>
                    <p className="text-xs text-gray-300">{v.title}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEWING OWN PROFILE
  // --------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-28 text-white">
      {/* Profile Card Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121824] border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-8 pb-6 border-b border-white/10">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="Current Avatar"
              className="h-20 w-20 rounded-3xl bg-indigo-950 p-1 border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#121824] text-[10px] text-white">
              ✓
            </span>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold text-white">{displayName || 'Your Profile'}</h1>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span>
                Phone: <span className="text-slate-200 font-mono">{user?.phone}</span>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[11px] border border-indigo-500/30">
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              {DEFAULT_AVATARS.map((url) => (
                <button
                  type="button"
                  key={url}
                  onClick={() => setAvatarUrl(url)}
                  className={`relative p-1 rounded-xl transition-all ${
                    avatarUrl === url
                      ? 'ring-2 ring-indigo-500 bg-indigo-500/20 scale-105'
                      : 'hover:scale-105 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="Avatar" className="h-10 w-10 rounded-lg object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Public Alias / Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Interests */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Interests (Choose 3–5)
              </label>
              <span className="text-xs font-semibold text-indigo-400">
                {selectedTagIds.length} / 5 selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
              {availableTags.map((tag) => (
                <InterestTag
                  key={tag.id}
                  tag={tag}
                  isSelected={selectedTagIds.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                />
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Public Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are your favorite conversation topics?"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Private Reveal Information */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Lock className="h-4 w-4 text-indigo-400" />
              <span>Private Identity (Only visible after mutual consent)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Real Name (e.g. Alex Smith)"
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={realBio}
                onChange={(e) => setRealBio(e.target.value)}
                placeholder="Real Bio / Contact Handle"
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active-scale touch-target"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Account Quick Navigation Menu */}
      <div className="p-4 rounded-3xl bg-[#121824] border border-white/10 shadow-xl space-y-2">
        <h3 className="px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Preferences & Controls
        </h3>

        <Link
          to="/connections"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">My Connections & Requests</p>
              <p className="text-[10px] text-slate-400">Manage friends, requests & suggested users</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </Link>

        <Link
          to="/settings"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Audio & Blocked Users</p>
              <p className="text-[10px] text-slate-400">Manage audio and privacy controls</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </Link>

        <button
          onClick={() => setIsGuidelinesOpen(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Community Safety Guidelines</p>
              <p className="text-[10px] text-slate-400">Read safety rules & privacy practices</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </button>

        {isAdminOrMod && (
          <Link
            to="/admin/dashboard"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/40 text-slate-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Admin Console</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-[9px] text-indigo-300 font-extrabold">
                    STAFF
                  </span>
                </p>
                <p className="text-[10px] text-indigo-300">Moderate reports, users, & active lounges</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-indigo-400" />
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <LogOut className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-200">Log Out</p>
              <p className="text-[10px] text-rose-400/80">End current mobile session</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-rose-500" />
        </button>
      </div>

      <SafetyGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />
    </div>
  );
};
