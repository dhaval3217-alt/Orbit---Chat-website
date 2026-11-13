import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Search,
  PlusCircle,
  Copy,
  Check,
  Heart,
  MessageSquare,
  Trash2,
  Edit3,
  Sparkles,
  Layers,
  Send,
  X,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useCodingNoteStore } from '../store/codingNoteStore.js';
import { useAuthStore } from '../store/authStore.js';
import { CodingNote } from '../types/index.js';

const CATEGORIES = ['All', 'DSA', 'Web Dev', 'Python', 'Java', 'C++', 'JavaScript', 'SQL & DB', 'System Design'];
const LANGUAGES = ['All', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'SQL', 'Rust', 'Go'];

export const CodingVibePage: React.FC = () => {
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
  } = useCodingNoteStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState('DSA');
  const [formLanguage, setFormLanguage] = useState('TypeScript');
  const [submitting, setSubmitting] = useState(false);

  // Comments Drawer
  const [activeCommentsNote, setActiveCommentsNote] = useState<CodingNote | null>(null);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    fetchNotes(selectedCategory, selectedLanguage, searchQuery);
  }, [selectedCategory, selectedLanguage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes(selectedCategory, selectedLanguage, searchQuery);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCode('');
    setFormCategory('DSA');
    setFormLanguage('TypeScript');
    setShowModal(true);
  };

  const handleOpenEditModal = (note: CodingNote) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormDescription(note.description);
    setFormCode(note.code_snippet);
    setFormCategory(note.category || 'DSA');
    setFormLanguage(note.language || 'TypeScript');
    setShowModal(true);
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCode.trim()) return;

    setSubmitting(true);
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, {
          title: formTitle,
          description: formDescription,
          code_snippet: formCode,
          category: formCategory,
          language: formLanguage,
        });
      } else {
        await createNote({
          title: formTitle,
          description: formDescription,
          code_snippet: formCode,
          category: formCategory,
          language: formLanguage,
        });
      }
      setShowModal(false);
      fetchNotes(selectedCategory, selectedLanguage, searchQuery);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this coding snippet?')) {
      try {
        await deleteNote(noteId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenComments = async (note: CodingNote) => {
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                VIBE: DEVELOPER & CODE
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-200 via-blue-300 to-indigo-200 bg-clip-text text-transparent">
                Developer Community & Snippets
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Explore algorithms, web patterns, architecture notes, and share code snippets with fellow programmers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Post Snippet
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

      {/* Filter and Search Controls */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code snippets, algorithms, topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0d111c] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500 transition shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#0d111c] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-gray-900">
                  {lang === 'All' ? 'All Languages' : lang}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-[#0d111c] border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Feed Grid */}
      <div className="max-w-6xl mx-auto">
        {notes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0d111c] border border-white/10 text-center">
            <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No code snippets found</h3>
            <p className="text-gray-400 text-xs mb-4">Be the first developer to share a note in this category!</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
            >
              Share Snippet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map((note) => {
              const isOwner = user?.id === note.user_id;
              return (
                <div
                  key={note.id}
                  className="bg-[#0d111c] border border-white/10 hover:border-cyan-500/40 rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    {/* Header: Author & Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={note.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={note.user?.display_name}
                          className="w-9 h-9 rounded-full object-cover border border-cyan-500/30"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{note.user?.display_name || 'Developer'}</div>
                          <div className="text-[11px] text-gray-400">@{note.user?.username || 'coder'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono font-semibold">
                          {note.language || 'Code'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold">
                          {note.category || 'DSA'}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors mb-2">
                      {note.title}
                    </h3>
                    {note.description && (
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed line-clamp-3">{note.description}</p>
                    )}

                    {/* Code Snippet Box */}
                    <div className="relative rounded-2xl bg-[#05070c] border border-white/10 overflow-hidden mb-4">
                      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs text-gray-400">
                        <span className="font-mono">{note.language || 'snippet'}</span>
                        <button
                          onClick={() => handleCopyCode(note.id, note.code_snippet)}
                          className="flex items-center gap-1 text-[11px] hover:text-white transition"
                        >
                          {copiedId === note.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto max-h-56 scrollbar-thin">
                        <code>{note.code_snippet}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLike(note.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          note.liked_by_me
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${note.liked_by_me ? 'fill-current' : ''}`} />
                        <span>{note.likes_count || 0}</span>
                      </button>

                      <button
                        onClick={() => handleOpenComments(note)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{note.comments_count || 0} Comments</span>
                      </button>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(note)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                          title="Edit snippet"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          title="Delete snippet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingNoteId ? 'Edit Code Snippet' : 'Share New Code Snippet'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Snippet Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Two Pointer Trapping Rain Water Solution"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#05070c] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Language</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#05070c] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {LANGUAGES.filter((l) => l !== 'All').map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Explanation / Notes</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain algorithm intuition, time/space complexity, or usage..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Code Snippet *</label>
                <textarea
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Paste your formatted code here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-[#05070c] border border-cyan-500/30 font-mono text-cyan-300 text-xs focus:outline-none focus:border-cyan-400"
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-cyan-600/30"
                >
                  {submitting ? 'Saving...' : editingNoteId ? 'Update Snippet' : 'Publish Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer Modal */}
      {activeCommentsNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-cyan-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{activeCommentsNote.title}</h3>
                <span className="text-xs text-cyan-400">Discussion & Code Review</span>
              </div>
              <button onClick={() => setActiveCommentsNote(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No comments yet. Share your thoughts or suggestions!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={c.user?.display_name}
                          className="w-6 h-6 rounded-full object-cover border border-cyan-500/30"
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

            {/* Comment Input */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment or code improvement..."
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
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
