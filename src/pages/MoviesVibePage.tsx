import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Clapperboard,
  Volume2,
  VolumeX,
  Heart,
  MessageSquare,
  ShieldAlert,
  Trash2,
  PlusCircle,
  Search,
  Send,
  X,
  CheckCircle,
} from 'lucide-react';
import { useMovieVideoStore } from '../store/movieVideoStore.js';
import { useAuthStore } from '../store/authStore.js';
import { MovieVideo } from '../types/index.js';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Comedy', 'Drama', 'Animation', 'Horror', 'Romance'];

// Sample movie clip presets if user doesn't have a direct MP4 link
const SAMPLE_PRESETS = [
  {
    title: 'Interstellar Docking Scene - No Time for Caution',
    movie_name: 'Interstellar (2014)',
    genre: 'Sci-Fi',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration_seconds: 90,
  },
  {
    title: 'Blade Runner 2049 - Cyberpunk City Flight',
    movie_name: 'Blade Runner 2049',
    genre: 'Sci-Fi',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_seconds: 60,
  },
  {
    title: 'Whiplash - Finale Drum Solo Intensity',
    movie_name: 'Whiplash',
    genre: 'Drama',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_seconds: 45,
  },
];

export const MoviesVibePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    videos,
    fetchVideos,
    uploadVideo,
    deleteVideo,
    toggleLike,
    comments,
    fetchComments,
    addComment,
    reportVideo,
  } = useMovieVideoStore();

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadMovieName, setUploadMovieName] = useState('');
  const [uploadGenre, setUploadGenre] = useState('Sci-Fi');
  const [uploadVideoUrl, setUploadVideoUrl] = useState('');
  const [uploadDuration, setUploadDuration] = useState(60);
  const [uploadFileSizeMB, setUploadFileSizeMB] = useState(15);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Comments Drawer
  const [activeCommentsVideo, setActiveCommentsVideo] = useState<MovieVideo | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Report Modal
  const [reportingVideo, setReportingVideo] = useState<MovieVideo | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    fetchVideos(selectedGenre, searchQuery);
  }, [selectedGenre]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(selectedGenre, searchQuery);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // Validate requirements: <=25MB, <=120s
    if (uploadDuration > 120) {
      setUploadError('Clip duration must be 120 seconds (2 minutes) or less.');
      return;
    }
    if (uploadFileSizeMB > 25) {
      setUploadError('File size must not exceed 25MB.');
      return;
    }

    setSubmitting(true);
    try {
      await uploadVideo({
        title: uploadTitle,
        movie_name: uploadMovieName,
        genre: uploadGenre,
        video_url: uploadVideoUrl,
        duration_seconds: uploadDuration,
        file_size_bytes: uploadFileSizeMB * 1024 * 1024,
      });
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadMovieName('');
      setUploadVideoUrl('');
      fetchVideos(selectedGenre, searchQuery);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload video clip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (window.confirm('Delete this movie clip?')) {
      try {
        await deleteVideo(videoId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenComments = async (vid: MovieVideo) => {
    setActiveCommentsVideo(vid);
    await fetchComments(vid.id);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeCommentsVideo) return;
    try {
      await addComment(activeCommentsVideo.id, commentInput.trim());
      setCommentInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingVideo) return;
    try {
      await reportVideo(reportingVideo.id, reportReason, reportDetails);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportingVideo(null);
        setReportDetails('');
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 pb-28">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-amber-950/40 border border-red-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold mb-3">
                <Clapperboard className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                VIBE: CINEMA & MOVIE CLIPS
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-red-200 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                Movie Clip Lounge
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Discover iconic movie scenes, iconic dialogues, short edits (max 120s / 25MB), and discuss cinema with
                enthusiasts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Upload Clip
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition"
              >
                Back to Vibes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movie clips, movie titles, scenes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0d111c] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md"
          >
            Search
          </button>
        </form>

        {/* Genre Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#0d111c] border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Clips Grid */}
      <div className="max-w-6xl mx-auto">
        {videos.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0d111c] border border-white/10 text-center">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No movie clips found</h3>
            <p className="text-gray-400 text-xs mb-4">Be the first to upload an iconic film scene!</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
            >
              Upload First Clip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => {
              const isOwner = user?.id === vid.user_id;
              const isPlaying = activePlayingId === vid.id;
              return (
                <div
                  key={vid.id}
                  className="bg-[#0d111c] border border-white/10 hover:border-red-500/40 rounded-3xl overflow-hidden transition-all duration-200 flex flex-col justify-between group shadow-xl"
                >
                  {/* Video Player Box */}
                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    <video
                      src={vid.video_url}
                      poster={vid.thumbnail_url}
                      muted={isMuted}
                      loop
                      playsInline
                      autoPlay={isPlaying}
                      className="w-full h-full object-cover"
                      onPlay={() => setActivePlayingId(vid.id)}
                      onPause={() => {
                        if (activePlayingId === vid.id) setActivePlayingId(null);
                      }}
                    />

                    {/* Inline Quick Play Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-3 pointer-events-none">
                      <div className="flex items-center justify-between pointer-events-auto">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-red-300 border border-red-500/30 text-[10px] font-bold">
                          {vid.genre || 'Cinema'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:text-red-300 transition"
                          >
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pointer-events-auto">
                        <span className="text-[10px] text-gray-300 font-mono bg-black/60 px-2 py-0.5 rounded-full">
                          {vid.duration_seconds || 60}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clip Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-red-400 mb-1">{vid.movie_name}</div>
                      <h3 className="text-base font-bold text-white group-hover:text-red-200 transition-colors mb-2 line-clamp-2">
                        {vid.title}
                      </h3>
                      {vid.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{vid.description}</p>
                      )}
                    </div>

                    {/* Footer Interactions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLike(vid.id)}
                          className={`flex items-center gap-1 text-xs font-semibold transition ${
                            vid.liked_by_me ? 'text-pink-400' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${vid.liked_by_me ? 'fill-current' : ''}`} />
                          <span>{vid.likes_count || 0}</span>
                        </button>

                        <button
                          onClick={() => handleOpenComments(vid)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white font-semibold transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{vid.comments_count || 0}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setReportingVideo(vid)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 transition"
                          title="Report Clip"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>

                        {isOwner && (
                          <button
                            onClick={() => handleDelete(vid.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition"
                            title="Delete Clip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Video Clip Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Upload Short Movie Clip</h3>
                <p className="text-xs text-gray-400 mt-0.5">Maximum duration: 120s | Maximum file size: 25MB</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                {uploadError}
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Or Pick a Classic Preset Clip</label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUploadTitle(p.title);
                      setUploadMovieName(p.movie_name);
                      setUploadGenre(p.genre);
                      setUploadVideoUrl(p.video_url);
                      setUploadDuration(p.duration_seconds);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
                  >
                    <div className="text-[11px] font-bold text-red-300 line-clamp-1">{p.movie_name}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{p.title}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Scene / Clip Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., The Dark Knight - Interrogation Room"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Movie Name *</label>
                  <input
                    type="text"
                    required
                    value={uploadMovieName}
                    onChange={(e) => setUploadMovieName(e.target.value)}
                    placeholder="e.g., The Dark Knight (2008)"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Genre</label>
                  <select
                    value={uploadGenre}
                    onChange={(e) => setUploadGenre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070c] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    {GENRES.filter((g) => g !== 'All').map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Video Stream URL (MP4/WebM) *</label>
                <input
                  type="url"
                  required
                  value={uploadVideoUrl}
                  onChange={(e) => setUploadVideoUrl(e.target.value)}
                  placeholder="https://.../scene.mp4"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Duration (Seconds, max 120s)</label>
                  <input
                    type="number"
                    max={120}
                    min={5}
                    value={uploadDuration}
                    onChange={(e) => setUploadDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">File Size (MB, max 25MB)</label>
                  <input
                    type="number"
                    max={25}
                    min={1}
                    value={uploadFileSizeMB}
                    onChange={(e) => setUploadFileSizeMB(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-red-600/30"
                >
                  {submitting ? 'Uploading...' : 'Publish Clip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer */}
      {activeCommentsVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-red-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{activeCommentsVideo.title}</h3>
                <span className="text-xs text-red-400">{activeCommentsVideo.movie_name} Discussion</span>
              </div>
              <button onClick={() => setActiveCommentsVideo(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No comments yet. What did you think of this scene?
                </div>
              ) : (
                comments.map((c) => {
                  const authorName = c.user?.display_name || c.user_name || 'Orbit User';
                  const authorAvatar = c.user?.avatar || c.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';

                  return (
                    <div key={c.id} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-6 h-6 rounded-full object-cover border border-red-500/30"
                          />
                          <span className="text-xs font-bold text-white">{authorName}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 pl-8">{c.comment}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your thoughts on this scene..."
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-yellow-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-yellow-400" />
              Report Movie Clip
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Help Orbit stay safe and copyright compliant. Select a reason below.
            </p>

            {reportSuccess ? (
              <div className="p-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Report submitted to Orbit moderators. Thank you.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070c] border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Copyright Violation">Copyright Infringement</option>
                    <option value="Inappropriate Content">Inappropriate Content / NSFW</option>
                    <option value="Violent / Graphic">Excessive Violence / Graphic</option>
                    <option value="Spam / Misleading">Spam or Misleading Clip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Details (Optional)</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional context for moderators..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingVideo(null)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold transition shadow-md"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
