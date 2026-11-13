import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Flame,
  HeartPulse,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  User,
  Zap,
  Activity,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  repsOrDuration: string;
  target: string;
  instructions: string;
  durationSec?: number;
}

interface Routine {
  id: string;
  title: string;
  audience: 'Boys' | 'Girls' | 'All';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Home' | 'Gym' | 'Cardio' | 'Strength' | 'Stretching' | 'Warm-up' | 'Cool-down';
  estimatedMinutes: number;
  caloriesBurn: number;
  description: string;
  exercises: Exercise[];
}

const ROUTINES: Routine[] = [
  {
    id: 'f1',
    title: 'Beginner Full Body Home Ignite',
    audience: 'All',
    level: 'Beginner',
    category: 'Home',
    estimatedMinutes: 20,
    caloriesBurn: 180,
    description: 'No equipment needed. Perfect jumpstart routine to build core strength and endurance.',
    exercises: [
      {
        id: 'e1',
        name: 'Jumping Jacks',
        sets: '3 sets',
        repsOrDuration: '45 sec',
        target: 'Full body cardio',
        instructions: 'Land softly on the balls of your feet, keep your core tight throughout.',
        durationSec: 45,
      },
      {
        id: 'e2',
        name: 'Bodyweight Squats',
        sets: '3 sets',
        repsOrDuration: '15 reps',
        target: 'Quads & Glutes',
        instructions: 'Chest up, knees tracking over toes, descend until thighs are parallel to ground.',
      },
      {
        id: 'e3',
        name: 'Knee Push-ups / Standard Push-ups',
        sets: '3 sets',
        repsOrDuration: '10-12 reps',
        target: 'Chest & Triceps',
        instructions: 'Keep your body in a straight plank line from shoulders to heels.',
      },
      {
        id: 'e4',
        name: 'Plank Hold',
        sets: '3 sets',
        repsOrDuration: '30 sec',
        target: 'Core & Abs',
        instructions: 'Engage glutes and core, do not let your lower back sag.',
        durationSec: 30,
      },
    ],
  },
  {
    id: 'f2',
    title: 'Men’s Upper Body Power Sculpt',
    audience: 'Boys',
    level: 'Intermediate',
    category: 'Strength',
    estimatedMinutes: 35,
    caloriesBurn: 320,
    description: 'Hypertrophy focused upper body workout for shoulders, chest, and lats.',
    exercises: [
      {
        id: 'e5',
        name: 'Incline Dumbbell Press / Diamond Push-ups',
        sets: '4 sets',
        repsOrDuration: '10-12 reps',
        target: 'Upper Chest',
        instructions: 'Controlled 2-second eccentric lowering, explosive push to the top.',
      },
      {
        id: 'e6',
        name: 'Overhead Shoulder Press',
        sets: '3 sets',
        repsOrDuration: '10-12 reps',
        target: 'Deltoids & Traps',
        instructions: 'Keep core braced and press directly overhead without hyperextending back.',
      },
      {
        id: 'e7',
        name: 'Pull-ups or Resistance Band Lat Pulldowns',
        sets: '4 sets',
        repsOrDuration: '8-10 reps',
        target: 'Lats & Biceps',
        instructions: 'Pull elbows down toward your back pockets, squeezing scapulae together.',
      },
      {
        id: 'e8',
        name: 'Dips / Bench Tricep Dips',
        sets: '3 sets',
        repsOrDuration: '12-15 reps',
        target: 'Triceps & Lower Chest',
        instructions: 'Lower until elbows reach a 90-degree angle, then press up.',
      },
    ],
  },
  {
    id: 'f3',
    title: 'Women’s Glute & Tone Fusion',
    audience: 'Girls',
    level: 'Beginner',
    category: 'Home',
    estimatedMinutes: 25,
    caloriesBurn: 240,
    description: 'Targeted glute activation, waist shaping, and hamstring tone with bodyweight & bands.',
    exercises: [
      {
        id: 'e9',
        name: 'Glute Bridges with 2-sec Pause',
        sets: '4 sets',
        repsOrDuration: '15 reps',
        target: 'Gluteus Maximus',
        instructions: 'Drive through your heels, squeeze glutes hard at peak contraction.',
      },
      {
        id: 'e10',
        name: 'Bulgarian Split Squats',
        sets: '3 sets each leg',
        repsOrDuration: '10 reps',
        target: 'Quads & Glutes',
        instructions: 'Rear foot elevated on couch or bench. Descend straight down smoothly.',
      },
      {
        id: 'e11',
        name: 'Donkey Kicks & Fire Hydrants',
        sets: '3 sets each side',
        repsOrDuration: '15 reps',
        target: 'Glute Medius',
        instructions: 'Keep hips square to the floor and isolate the glute movement.',
      },
      {
        id: 'e12',
        name: 'Russian Twists',
        sets: '3 sets',
        repsOrDuration: '20 reps total',
        target: 'Obliques & Core',
        instructions: 'Elevate feet slightly, rotate shoulders side to side with control.',
      },
    ],
  },
  {
    id: 'f4',
    title: 'High-Octane Cardio & HIIT Blast',
    audience: 'All',
    level: 'Advanced',
    category: 'Cardio',
    estimatedMinutes: 20,
    caloriesBurn: 290,
    description: 'Maximum calorie burn interval training designed to boost VO2 max and burn fat.',
    exercises: [
      {
        id: 'e13',
        name: 'High Knees Sprint',
        sets: '4 sets',
        repsOrDuration: '30 sec work / 15 sec rest',
        target: 'Cardio & Hip Flexors',
        instructions: 'Drive knees up to hip height at maximum sprint cadence.',
        durationSec: 30,
      },
      {
        id: 'e14',
        name: 'Burpees with Jump',
        sets: '4 sets',
        repsOrDuration: '30 sec work / 15 sec rest',
        target: 'Full Body Power',
        instructions: 'Drop chest to floor, snap feet forward, explosive jump reaching up.',
        durationSec: 30,
      },
      {
        id: 'e15',
        name: 'Mountain Climbers',
        sets: '4 sets',
        repsOrDuration: '30 sec work / 15 sec rest',
        target: 'Core & Endurance',
        instructions: 'Keep hips level while driving alternating knees to chest rapidly.',
        durationSec: 30,
      },
    ],
  },
  {
    id: 'f5',
    title: 'Deep Stretching & Joint Mobility Reset',
    audience: 'All',
    level: 'Beginner',
    category: 'Stretching',
    estimatedMinutes: 15,
    caloriesBurn: 70,
    description: 'Relieve posture strain, open tight hips, shoulders, and restore flexibility.',
    exercises: [
      {
        id: 'e16',
        name: 'Cat-Cow Spinal Flow',
        sets: '2 sets',
        repsOrDuration: '60 sec',
        target: 'Spine & Back Mobility',
        instructions: 'Inhale into cow pose (arching back), exhale into cat pose (rounding spine).',
        durationSec: 60,
      },
      {
        id: 'e17',
        name: 'World’s Greatest Stretch',
        sets: '2 sets each side',
        repsOrDuration: '45 sec',
        target: 'Hips, Thoracic Spine, Hamstrings',
        instructions: 'Lunge forward, place elbow inside front ankle, rotate open to ceiling.',
        durationSec: 45,
      },
      {
        id: 'e18',
        name: 'Pigeon Pose / Figure-4 Stretch',
        sets: '2 sets each side',
        repsOrDuration: '45 sec',
        target: 'Glutes & Piriformis',
        instructions: 'Sink hips toward floor, relax breathing into the stretch.',
        durationSec: 45,
      },
    ],
  },
  {
    id: 'f6',
    title: 'Pre-Workout Dynamic Warm-Up',
    audience: 'All',
    level: 'Beginner',
    category: 'Warm-up',
    estimatedMinutes: 8,
    caloriesBurn: 50,
    description: 'Elevate core temperature and lubricate joints before any heavy training.',
    exercises: [
      {
        id: 'e19',
        name: 'Arm Circles & Shoulder Dislocates',
        sets: '2 sets',
        repsOrDuration: '30 sec',
        target: 'Shoulders & Rotator Cuff',
        instructions: 'Gradually increase circle radius forward and backward.',
        durationSec: 30,
      },
      {
        id: 'e20',
        name: 'Leg Swings & Hip Openers',
        sets: '2 sets each leg',
        repsOrDuration: '30 sec',
        target: 'Hamstrings & Hip Flexors',
        instructions: 'Front-to-back and side-to-side swings with light momentum.',
        durationSec: 30,
      },
    ],
  },
];

const CATEGORIES = ['All', 'Home', 'Gym', 'Cardio', 'Strength', 'Stretching', 'Warm-up', 'Cool-down'];
const AUDIENCES = ['All', 'Boys', 'Girls'];

export const FitnessVibePage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(ROUTINES[0]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Interactive Workout Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(45);
  const [initialDuration, setInitialDuration] = useState<number>(45);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Sound Synth for timer
  const playChime = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 4 && prev > 1) {
            playChime(440); // countdown beep
          }
          if (prev === 1) {
            playChime(880); // finish high chime
            setIsTimerRunning(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const filteredRoutines = ROUTINES.filter((r) => {
    const matchesAudience = selectedAudience === 'All' || r.audience === selectedAudience || r.audience === 'All';
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesAudience && matchesCategory;
  });

  const toggleExerciseComplete = (id: string) => {
    setCompletedExercises((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const startExerciseTimer = (duration: number) => {
    setInitialDuration(duration);
    setTimerSeconds(duration);
    setIsTimerRunning(true);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 pb-28">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-indigo-950/40 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                VIBE: FITNESS & ENERGY
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                Orbit Workout Hub
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Structured guides, interval timers, strength and cardio splits tailored for boys, girls, home, or gym.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition"
            >
              Back to Vibes
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Target Audience */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        {/* Audience Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audience:</span>
          <div className="flex items-center gap-2 bg-[#0d111c] p-1 rounded-2xl border border-white/10">
            {AUDIENCES.map((aud) => (
              <button
                key={aud}
                onClick={() => setSelectedAudience(aud)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedAudience === aud
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {aud === 'Boys' ? 'For Him' : aud === 'Girls' ? 'For Her' : 'All / Unisex'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-[#0d111c] border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Routines List & Active Routine Viewer */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Routines Card List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Available Routines ({filteredRoutines.length})
          </h2>

          <div className="space-y-3">
            {filteredRoutines.map((routine) => {
              const isSelected = activeRoutine?.id === routine.id;
              return (
                <div
                  key={routine.id}
                  onClick={() => setActiveRoutine(routine)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-[#0d111c] border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-[11px] font-semibold">
                      {routine.category} • {routine.level}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ~{routine.estimatedMinutes} mins • {routine.caloriesBurn} kcal
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{routine.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{routine.description}</p>

                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>{routine.exercises.length} Exercises Included</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Routine Detail & Interactive Timer (7 cols) */}
        {activeRoutine && (
          <div className="lg:col-span-7 space-y-6">
            {/* Routine Header Card */}
            <div className="bg-[#0d111c] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
                    <Activity className="w-3.5 h-3.5" />
                    {activeRoutine.category} Workout
                  </div>
                  <h2 className="text-2xl font-black text-white">{activeRoutine.title}</h2>
                  <p className="text-xs text-gray-400 mt-1">{activeRoutine.description}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 text-right">
                  <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                    <Flame className="w-4 h-4 text-orange-400" />
                    {activeRoutine.caloriesBurn} kcal
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{activeRoutine.estimatedMinutes} Minutes</div>
                </div>
              </div>

              {/* Floating Rest / Interval Timer Widget */}
              <div className="p-4 rounded-2xl bg-[#07090e] border border-emerald-500/30 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-gray-200">Interval / Rest Timer</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                    style={{
                      width: `${initialDuration > 0 ? (timerSeconds / initialDuration) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {[30, 45, 60, 90].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => {
                          setInitialDuration(sec);
                          setTimerSeconds(sec);
                          setIsTimerRunning(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono font-medium transition"
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                        isTimerRunning
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isTimerRunning ? 'Pause' : 'Start Timer'}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(initialDuration);
                      }}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 transition"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Exercise List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Exercise Plan</h3>
                {activeRoutine.exercises.map((ex, idx) => {
                  const isDone = completedExercises.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleExerciseComplete(ex.id)}
                            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-400 text-black'
                                : 'border-white/30 text-transparent hover:border-emerald-400'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400">#{idx + 1}</span>
                              <h4
                                className={`text-sm font-bold text-white ${
                                  isDone ? 'line-through text-gray-400' : ''
                                }`}
                              >
                                {ex.name}
                              </h4>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{ex.instructions}</div>
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-bold font-mono block mb-1">
                            {ex.sets}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">{ex.repsOrDuration}</span>
                        </div>
                      </div>

                      {ex.durationSec && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400">Target: {ex.target}</span>
                          <button
                            onClick={() => startExerciseTimer(ex.durationSec!)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Set {ex.durationSec}s Timer
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
