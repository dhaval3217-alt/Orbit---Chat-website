import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Utensils,
  DollarSign,
  Calendar,
  Sparkles,
  PlusCircle,
  Search,
  Heart,
  MessageSquare,
  Trash2,
  Edit3,
  Send,
  X,
  ShieldCheck,
  Camera,
  Navigation,
} from 'lucide-react';
import { useTravelNoteStore } from '../store/travelNoteStore.js';
import { useAuthStore } from '../store/authStore.js';
import { TravelNote } from '../types/index.js';

const CATEGORIES = [
  'All',
  'India',
  'International',
  'Budget Travel',
  'Solo Trips',
  'Adventure & Treks',
  'Beach & Island',
  'Mountain Escapes',
];

export const TravelVibePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notes,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleLike,
    comments,
    fetchComments,
    addComment,
    isLoading,
  } = useTravelNoteStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('India');
  const [experience, setExperience] = useState('');
  const [placesVisitedInput, setPlacesVisitedInput] = useState('');
  const [foodEaten, setFoodEaten] = useState('');
  const [budget, setBudget] = useState('');
  const [safetyTips, setSafetyTips] = useState('');
  const [bestSeason, setBestSeason] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments Drawer
  const [activeCommentsNote, setActiveCommentsNote] = useState<TravelNote | null>(null);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    fetchNotes(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes(selectedCategory, searchQuery);
  };

  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setDestination('');
    setCategory('India');
    setExperience('');
    setPlacesVisitedInput('');
    setFoodEaten('');
    setBudget('');
    setSafetyTips('');
    setBestSeason('');
    setCoverImage('');
    setShowModal(true);
  };

  const handleOpenEdit = (note: TravelNote) => {
    setEditingNoteId(note.id);
    setDestination(note.destination);
    setCategory(note.category || 'India');
    setExperience(note.experience);
    setPlacesVisitedInput(note.places_visited?.join(', ') || '');
    setFoodEaten(note.food_eaten || '');
    setBudget(note.budget || '');
    setSafetyTips(note.safety_tips || '');
    setBestSeason(note.best_season || '');
    setCoverImage(note.cover_image || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !experience.trim()) return;

    setSubmitting(true);
    const placesArray = placesVisitedInput
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      const payload: Partial<TravelNote> = {
        destination,
        category,
        experience,
        places_visited: placesArray,
        food_eaten: foodEaten,
        budget,
        safety_tips: safetyTips,
        best_season: bestSeason,
        cover_image:
          coverImage.trim() ||
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
      };

      if (editingNoteId) {
        await updateNote(editingNoteId, payload);
      } else {
        await createNote(payload);
      }
      setShowModal(false);
      fetchNotes(selectedCategory, searchQuery);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this travel diary note?')) {
      try {
        await deleteNote(noteId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenComments = async (note: TravelNote) => {
    setActiveCommentsNote(note);
    await fetchComments(note.id);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeCommentsNote) return;

    try {
      await addComment(activeCommentsNote.id, commentInput.trim());
      setCommentInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 pb-28">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-teal-950/40 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
                <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                VIBE: TRAVEL DIARIES & EXPLORATION
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-200 via-orange-300 to-teal-200 bg-clip-text text-transparent">
                Wanderlust Travel Lounge
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Discover authentic travel itineraries, hidden gems, budget breakdowns, and local food recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Write Travel Diary
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
              placeholder="Search destinations (e.g. Manali, Bali, Tokyo, Gokarna)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0d111c] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md"
          >
            Search
          </button>
        </form>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-[#0d111c] border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Travel Notes Feed */}
      <div className="max-w-6xl mx-auto">
        {notes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0d111c] border border-white/10 text-center">
            <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No travel notes found</h3>
            <p className="text-gray-400 text-xs mb-4">Share your recent travel adventures and tips with the community!</p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
            >
              Write First Diary
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map((note) => {
              const isOwner = user?.id === note.user_id;
              return (
                <div
                  key={note.id}
                  className="bg-[#0d111c] border border-white/10 hover:border-amber-500/40 rounded-3xl overflow-hidden transition-all duration-200 flex flex-col justify-between group shadow-xl"
                >
                  {/* Cover Image & Destination Tag */}
                  <div className="relative h-52 bg-gray-900 overflow-hidden">
                    <img
                      src={
                        note.cover_image ||
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop'
                      }
                      alt={note.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d111c] via-transparent to-black/40" />

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {note.destination}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-gray-300 text-[11px] font-semibold">
                        {note.category || 'Travel'}
                      </span>
                    </div>

                    {/* Author banner */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <img
                        src={note.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={note.user?.display_name}
                        className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                      />
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {note.user?.display_name || 'Traveler'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Experience Story */}
                      <p className="text-xs text-gray-300 leading-relaxed mb-4 line-clamp-4">{note.experience}</p>

                      {/* Travel Highlights Badges */}
                      <div className="space-y-2 mb-4">
                        {note.places_visited && note.places_visited.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              Visited:
                            </span>
                            {note.places_visited.map((p, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[11px]"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}

                        {note.food_eaten && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Utensils className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span className="text-gray-400">Must Try Food:</span>
                            <span className="text-white font-medium">{note.food_eaten}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1">
                          {note.budget && (
                            <span className="text-green-400 font-mono flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              Budget: {note.budget}
                            </span>
                          )}
                          {note.best_season && (
                            <span className="text-cyan-300 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Best: {note.best_season}
                            </span>
                          )}
                        </div>

                        {note.safety_tips && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Tip:</strong> {note.safety_tips}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Interactions */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLike(note.id)}
                          className={`flex items-center gap-1 text-xs font-semibold transition ${
                            note.liked_by_me ? 'text-pink-400' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${note.liked_by_me ? 'fill-current' : ''}`} />
                          <span>{note.likes_count || 0}</span>
                        </button>

                        <button
                          onClick={() => handleOpenComments(note)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white font-semibold transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{note.comments_count || 0} Comments</span>
                        </button>
                      </div>

                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(note)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Travel Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingNoteId ? 'Edit Travel Diary' : 'Share Travel Diary'}
                </h3>
                <p className="text-xs text-gray-400">Share your itinerary, budget, and local gems</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Manali & Spiti Valley"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#05070c] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Travel Experience / Itinerary *</label>
                <textarea
                  required
                  rows={4}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Share your story, day-wise route, highlights, and vibe..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Places Visited (Comma Separated)
                </label>
                <input
                  type="text"
                  value={placesVisitedInput}
                  onChange={(e) => setPlacesVisitedInput(e.target.value)}
                  placeholder="e.g., Solang Valley, Rohtang Pass, Old Manali Cafes"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Famous Food / Cafes</label>
                  <input
                    type="text"
                    value={foodEaten}
                    onChange={(e) => setFoodEaten(e.target.value)}
                    placeholder="e.g., Siddu, Trout Fish, Dylan's Cafe"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., ₹12,000 / 4 days"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Best Season to Visit</label>
                  <input
                    type="text"
                    value={bestSeason}
                    onChange={(e) => setBestSeason(e.target.value)}
                    placeholder="e.g., Oct - Feb (Snow)"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://.../photo.jpg"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Safety & Travel Tips</label>
                <input
                  type="text"
                  value={safetyTips}
                  onChange={(e) => setSafetyTips(e.target.value)}
                  placeholder="e.g., Book rental scooters early, carry warm thermal layers"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30"
                >
                  {submitting ? 'Saving...' : editingNoteId ? 'Update Diary' : 'Publish Diary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer */}
      {activeCommentsNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-amber-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{activeCommentsNote.destination}</h3>
                <span className="text-xs text-amber-400">Traveler Questions & Advice</span>
              </div>
              <button onClick={() => setActiveCommentsNote(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No comments yet. Ask questions or share tips about this destination!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={c.user?.display_name}
                          className="w-6 h-6 rounded-full object-cover border border-amber-500/30"
                        />
                        <span className="text-xs font-bold text-white">{c.user?.display_name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 pl-8">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Ask a question or add a travel tip..."
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
