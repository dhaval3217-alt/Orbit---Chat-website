import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMoodStore } from '../store/moodStore.js';
import { useMatchingStore } from '../store/matchingStore.js';
import { useUiStore } from '../store/uiStore.js';
import { MoodCard } from '../components/cards/MoodCard.js';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

const VIBE_PATHS: Record<string, string> = {
  travel: '/travel',
  'just-talk': '/lets-chat',
  movies: '/movies',
  'threat-detection': '/security',
  fitness: '/fitness',
  music: '/music',
  gaming: '/gaming',
};

export const MoodSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { moods, selectedMood, fetchMoods, selectMood, isLoading } = useMoodStore();
  const { startSearch } = useMatchingStore();
  const { showToast } = useUiStore();

  useEffect(() => {
    fetchMoods();
  }, []);

  const handleSelectMood = async (moodId: string) => {
    try {
      await selectMood(moodId);
      showToast('success', 'Vibe updated across Orbit real-time presence');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update mood');
    }
  };

  const handleFindMatch = async (moodId: string) => {
    try {
      await handleSelectMood(moodId);
      if (moodId === 'just-talk') {
        navigate('/lets-chat');
        return;
      }
      startSearch(moodId);
      navigate('/matching');
    } catch (err: any) {
      showToast('error', err.message || 'Could not start matching');
    }
  };

  // Filter out legacy or deprecated moods while keeping the current Orbit experience focused on secure social interactions.
  const activeMoods = moods.filter((m) => !['study-break', 'coding', 'debate', 'chill', 'walk-and-talk'].includes(m.id));

  return (
    <div className="space-y-6">
      {/* Mobile Page Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#121824] via-indigo-950/50 to-[#121824] border border-white/10 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Choose Your Social Vibe</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Choose Your Vibe
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl leading-relaxed">
              Discover unique experiences for every vibe: unwind with Chill with Music, share media, play mini-games, or run safe security checks with Threat Detection.
            </p>
          </div>

          {selectedMood && !['travel', 'movies', 'threat-detection', 'fitness'].includes(selectedMood.id) && (
            <button
              onClick={() => handleFindMatch(selectedMood.id)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active-scale touch-target transition-all"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>{selectedMood.id === 'just-talk' ? "Open Let's Chat" : `Match in ${selectedMood.label} Now`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mood Cards Grid */}
      {isLoading && activeMoods.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading Orbit vibes...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeMoods.map((mood) => {
            const isSelected = selectedMood?.id === mood.id;
            const vibePath = VIBE_PATHS[mood.id] || '/dashboard';

            return (
              <div
                key={mood.id}
                className="flex flex-col justify-between p-2 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2.5"
              >
                <MoodCard
                  mood={mood}
                  isSelected={isSelected}
                  onClick={() => handleSelectMood(mood.id)}
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate(vibePath)}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center justify-center gap-1 active-scale touch-target"
                  >
                    <span>Open Hub</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>

                  {!['travel', 'movies', 'threat-detection', 'fitness'].includes(mood.id) && (
                    <button
                      onClick={() => handleFindMatch(mood.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all active-scale touch-target flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>{mood.id === 'just-talk' ? "Let's Chat" : 'Match'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
