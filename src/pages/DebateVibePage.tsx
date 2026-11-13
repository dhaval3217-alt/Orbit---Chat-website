import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareQuote,
  Flame,
  Users,
  PlusCircle,
  Radio,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Award,
  Vote,
  Filter,
} from 'lucide-react';
import { useDebateStore, DebateTopic } from '../store/debateStore.js';
import { useAuthStore } from '../store/authStore.js';

const CATEGORIES = ['All', 'Tech & AI', 'Society & Ethics', 'Gaming & Entertainment', 'Philosophy & Culture'];

export const DebateVibePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    topics,
    activeRooms,
    selectedTopic,
    myStance,
    fetchTopics,
    fetchRooms,
    setSelectedTopic,
    setMyStance,
    createDebateRoom,
    isLoading,
  } = useDebateStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customProLabel, setCustomProLabel] = useState('Pro / Agree');
  const [customConLabel, setCustomConLabel] = useState('Con / Disagree');
  const [modalStance, setModalStance] = useState<'PRO' | 'CON' | 'NEUTRAL'>('NEUTRAL');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTopics();
    fetchRooms();
  }, []);

  const filteredTopics = topics.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleStartDebate = async (topic?: DebateTopic) => {
    setCreating(true);
    try {
      if (topic) {
        const room = await createDebateRoom({
          topic_id: topic.id,
          initial_stance: modalStance,
        });
        setShowCreateModal(false);
        navigate(`/room/${room.id}`);
      } else {
        const room = await createDebateRoom({
          custom_topic: customTopicTitle,
          initial_stance: modalStance,
        });
        setShowCreateModal(false);
        navigate(`/room/${room.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 pb-28">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950/40 via-red-950/30 to-purple-950/40 border border-orange-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold mb-3">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                VIBE: DEBATE ARENA
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-200 via-amber-300 to-red-200 bg-clip-text text-transparent">
                Live Debate & Discourse
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Engage in civil, structured audio debates. Pick your stance, challenge opinions, or moderate trending
                topics in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Host Debate Room
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

      {/* Live Active Debate Rooms */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Live Debate Stages</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold">
              {activeRooms.length} Active
            </span>
          </div>
        </div>

        {activeRooms.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#0d111c] border border-white/10 text-center">
            <MessageSquareQuote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-semibold mb-1">No active debate stages right now</p>
            <p className="text-gray-500 text-xs mb-4">Be the first to create a room on one of the topics below!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition"
            >
              Start First Stage
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRooms.map((room) => (
              <div
                key={room.id}
                className="p-5 rounded-3xl bg-[#0d111c] border border-orange-500/20 hover:border-orange-500/50 transition-all shadow-lg hover:shadow-orange-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                      LIVE STAGE
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      <span>{room.participant_count || 1} Debaters</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 line-clamp-2">{room.topic || room.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                    Join this room to listen or raise your hand to speak on your stance.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Audio Room</span>
                  <button
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold transition shadow-md"
                  >
                    Enter Stage
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Topics Directory */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-amber-400" />
              Debate Topics Directory
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Choose a topic to take a stand and launch an audio debate</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="p-6 rounded-3xl bg-[#0d111c] border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-medium">
                    {topic.category}
                  </span>
                  <span className="text-xs text-orange-400 font-semibold">Ready for Debate</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-orange-200 transition-colors mb-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{topic.description}</p>

                {/* Stance Indicators */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-2 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-center p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block">
                      PRO STANCE
                    </span>
                    <span className="text-xs text-gray-200 font-medium">{topic.pro_label}</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                      CON STANCE
                    </span>
                    <span className="text-xs text-gray-200 font-medium">{topic.con_label}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-500">Structured 2-Side Audio</span>
                <button
                  onClick={() => {
                    setSelectedTopic(topic);
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-md active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Debate This Topic
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Debate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d111c] border border-orange-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scale-in">
            <h3 className="text-2xl font-black text-white mb-1">
              {selectedTopic ? 'Host Debate on Topic' : 'Host Custom Debate Stage'}
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Create a live audio room. You will enter as host with your declared stance.
            </p>

            {selectedTopic ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <div className="text-xs text-orange-400 font-bold mb-1">{selectedTopic.category}</div>
                <div className="text-base font-bold text-white mb-2">{selectedTopic.title}</div>
                <div className="text-xs text-gray-400">{selectedTopic.description}</div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Debate Topic Title</label>
                  <input
                    type="text"
                    value={customTopicTitle}
                    onChange={(e) => setCustomTopicTitle(e.target.value)}
                    placeholder="e.g., Should AI-generated art be copyrightable?"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Context / Description</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Brief background or debate rules..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Stance Choice */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-300 mb-2">Select Your Initial Stance</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModalStance('PRO')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    modalStance === 'PRO'
                      ? 'bg-green-500/20 border-green-500 text-green-300 shadow-lg shadow-green-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold uppercase">PRO</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">In Favor</div>
                </button>
                <button
                  type="button"
                  onClick={() => setModalStance('CON')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    modalStance === 'CON'
                      ? 'bg-red-500/20 border-red-500 text-red-300 shadow-lg shadow-red-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold uppercase">CON</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Opposed</div>
                </button>
                <button
                  type="button"
                  onClick={() => setModalStance('NEUTRAL')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    modalStance === 'NEUTRAL'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold uppercase">MODERATOR</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Neutral</div>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartDebate(selectedTopic || undefined)}
                disabled={creating || (!selectedTopic && !customTopicTitle.trim())}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30"
              >
                {creating ? 'Creating Room...' : 'Launch Debate Stage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
