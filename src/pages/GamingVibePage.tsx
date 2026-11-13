import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Trophy,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Swords,
  Bot,
  Users,
  Zap,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Pause,
  ChevronRight,
  Flame,
  Award,
  Send,
  CheckCircle,
  XCircle,
  PhoneOff,
  Radio,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useConnectionStore } from '../store/connectionStore.js';
import { useUiStore } from '../store/uiStore.js';
import { socketClient } from '../socket/socketClient.js';

// Sound synth using Web Audio API
const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.08) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext may be restricted before user interaction
  }
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;

export const GamingVibePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUiStore();
  const {
    activeGame,
    setActiveGame,
    board,
    isXNext,
    winner,
    winningLine,
    score,
    gameMode,
    opponent,
    setGameMode,
    playMove,
    resetTicTacToe,
    snakeScore,
    snakeHighScore,
    updateSnakeScore,
    challenges,
    fetchChallenges,
    sendChallenge,
    respondChallenge,
    initSocketListeners,
  } = useGameStore();

  const { connections, fetchConnections } = useConnectionStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'SNAKE' | 'TIC_TAC_TOE' | 'CHALLENGES'>('SNAKE');

  // Snake State
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [isSnakeRunning, setIsSnakeRunning] = useState(false);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const [snakeSpeed, setSnakeSpeed] = useState<number>(100); // ms per tick
  const [speedLevel, setSpeedLevel] = useState<'CHILL' | 'STANDARD' | 'INSANE'>('STANDARD');

  // Challenge modal
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [challengeSentSuccess, setChallengeSentSuccess] = useState(false);

  useEffect(() => {
    fetchChallenges();
    fetchConnections();
    const unsub = initSocketListeners();
    return () => {
      unsub();
    };
  }, []);

  // Generate random food not on snake
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetSnakeGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('UP');
    setNextDirection('UP');
    setSnakeGameOver(false);
    updateSnakeScore(0);
    setIsSnakeRunning(false);
  };

  const handleSpeedChange = (level: 'CHILL' | 'STANDARD' | 'INSANE') => {
    setSpeedLevel(level);
    if (level === 'CHILL') setSnakeSpeed(150);
    else if (level === 'STANDARD') setSnakeSpeed(100);
    else setSnakeSpeed(60);
    resetSnakeGame();
  };

  // Keyboard navigation for Snake
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'SNAKE') return;
      if (['ArrowUp', 'KeyW'].includes(e.code) && direction !== 'DOWN') {
        e.preventDefault();
        setNextDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && direction !== 'UP') {
        e.preventDefault();
        setNextDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && direction !== 'RIGHT') {
        e.preventDefault();
        setNextDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && direction !== 'LEFT') {
        e.preventDefault();
        setNextDirection('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsSnakeRunning((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, activeTab]);

  // Snake game loop
  useEffect(() => {
    if (!isSnakeRunning || snakeGameOver || activeTab !== 'SNAKE') return;

    const timer = setInterval(() => {
      setDirection(nextDirection);

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        let newHead: Point;

        switch (nextDirection) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          if (soundEnabled) playTone(160, 'sawtooth', 0.25);
          setSnakeGameOver(true);
          setIsSnakeRunning(false);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          if (soundEnabled) playTone(140, 'sawtooth', 0.25);
          setSnakeGameOver(true);
          setIsSnakeRunning(false);
          return prevSnake;
        }

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          if (soundEnabled) playTone(587.33, 'triangle', 0.1);
          const newScore = snakeScore + 10;
          updateSnakeScore(newScore);
          setFood(generateFood([newHead, ...prevSnake]));
          return [newHead, ...prevSnake];
        }

        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, snakeSpeed);

    return () => clearInterval(timer);
  }, [isSnakeRunning, snakeGameOver, nextDirection, food, snakeScore, snakeSpeed, activeTab, soundEnabled, generateFood]);

  const handleSendChallenge = async () => {
    if (!selectedFriend) return;
    try {
      await sendChallenge(selectedFriend, activeTab === 'SNAKE' ? 'SNAKE' : 'TIC_TAC_TOE');
      setChallengeSentSuccess(true);
      setTimeout(() => setChallengeSentSuccess(false), 3000);
      setSelectedFriend('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner) return;
    if (gameMode === 'PVP_ONLINE' && !isXNext) return; // not your turn
    if (soundEnabled) playTone(isXNext ? 440 : 660, 'sine', 0.08);
    playMove(idx);
  };

  const handleLeaveOnlineGame = () => {
    if (opponent) {
      socketClient.emit('game:session_end', { partnerId: opponent.id, challengeId: '' });
    }
    setGameMode('AI');
    resetTicTacToe();
    showToast('info', 'You left the online game session.');
  };

  const handleRespondChallenge = async (challengeId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      await respondChallenge(challengeId, action);
      if (action === 'ACCEPT') {
        setActiveTab('TIC_TAC_TOE');
        showToast('success', 'Game session started! You play as X.');
      } else {
        showToast('info', 'Challenge declined.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to respond to challenge');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 pb-28">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-pink-900/40 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
                <Gamepad2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                VIBE: GAMING ARCADE
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-200 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
                Neon Retro Arcade
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Play classic retro games, challenge peers, track high scores, or relax with casual mini-games.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-2xl border transition-all ${
                  soundEnabled
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title="Toggle Sound Effects"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition"
              >
                Back to Vibes
              </button>
            </div>
          </div>

          {/* Game Switcher Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('SNAKE')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'SNAKE'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              Cyber Snake
            </button>
            <button
              onClick={() => setActiveTab('TIC_TAC_TOE')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'TIC_TAC_TOE'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Swords className="w-4 h-4 text-pink-400" />
              Tic-Tac-Toe Arena
            </button>
            <button
              onClick={() => setActiveTab('CHALLENGES')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'CHALLENGES'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Friend Challenges
              {challenges.incoming.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-xs font-bold animate-pulse">
                  {challenges.incoming.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto">
        {/* TAB 1: CYBER SNAKE */}
        {activeTab === 'SNAKE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Game Canvas Area */}
            <div className="lg:col-span-2 bg-[#0d111c] border border-purple-500/20 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              {/* Score HUD */}
              <div className="w-full flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-gray-400 text-xs font-mono tracking-wider">SCORE</span>
                  <span className="text-2xl font-black text-green-400 font-mono">{snakeScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400 text-xs font-mono tracking-wider">HIGH SCORE</span>
                  <span className="text-2xl font-black text-yellow-400 font-mono">{snakeHighScore}</span>
                </div>
              </div>

              {/* Grid Canvas */}
              <div className="relative w-full max-w-[420px] aspect-square bg-[#05070c] border-2 border-purple-500/30 rounded-2xl p-2 shadow-inner overflow-hidden">
                {/* Background grid scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                {/* Snake Rendering */}
                <div
                  className="w-full h-full relative"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                  }}
                >
                  {/* Food */}
                  <div
                    className="relative z-10 flex items-center justify-center animate-bounce"
                    style={{
                      gridColumnStart: food.x + 1,
                      gridRowStart: food.y + 1,
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899] border border-pink-200" />
                  </div>

                  {/* Snake Segments */}
                  {snake.map((segment, idx) => {
                    const isHead = idx === 0;
                    return (
                      <div
                        key={idx}
                        className="relative z-20 flex items-center justify-center p-[1px]"
                        style={{
                          gridColumnStart: segment.x + 1,
                          gridRowStart: segment.y + 1,
                        }}
                      >
                        <div
                          className={`w-full h-full rounded-sm transition-all duration-75 ${
                            isHead
                              ? 'bg-gradient-to-tr from-cyan-400 to-green-400 shadow-[0_0_12px_#22d3ee] rounded-md'
                              : 'bg-green-500/90 shadow-[0_0_6px_#10b981]'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Overlay Game Over */}
                {snakeGameOver && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-3">
                      <Flame className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-black text-red-400 mb-1 tracking-wider">GAME OVER</h3>
                    <p className="text-gray-300 text-sm mb-4">Final Score: {snakeScore}</p>
                    <button
                      onClick={resetSnakeGame}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-600/30 transition transform active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </button>
                  </div>
                )}

                {/* Overlay Pause/Start Screen */}
                {!isSnakeRunning && !snakeGameOver && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-3">
                      <Play className="w-8 h-8 text-purple-400 ml-1" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ready to slither?</h3>
                    <p className="text-gray-400 text-xs mb-4">Use keyboard Arrow keys/WASD or the D-Pad below</p>
                    <button
                      onClick={() => setIsSnakeRunning(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition transform active:scale-95"
                    >
                      <Play className="w-4 h-4" />
                      {snakeScore > 0 ? 'Resume Game' : 'Start Game'}
                    </button>
                  </div>
                )}
              </div>

              {/* On-Screen Touch / D-Pad Controls for Mobile & Desktop */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    if (direction !== 'DOWN') setNextDirection('UP');
                    if (!isSnakeRunning && !snakeGameOver) setIsSnakeRunning(true);
                  }}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-purple-600/40 border border-white/15 text-white active:scale-90 transition shadow-md"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (direction !== 'RIGHT') setNextDirection('LEFT');
                      if (!isSnakeRunning && !snakeGameOver) setIsSnakeRunning(true);
                    }}
                    className="p-3.5 rounded-2xl bg-white/10 hover:bg-purple-600/40 border border-white/15 text-white active:scale-90 transition shadow-md"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setIsSnakeRunning(!isSnakeRunning)}
                    className="p-3.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 active:scale-90 transition shadow-md"
                  >
                    {isSnakeRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => {
                      if (direction !== 'LEFT') setNextDirection('RIGHT');
                      if (!isSnakeRunning && !snakeGameOver) setIsSnakeRunning(true);
                    }}
                    className="p-3.5 rounded-2xl bg-white/10 hover:bg-purple-600/40 border border-white/15 text-white active:scale-90 transition shadow-md"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (direction !== 'UP') setNextDirection('DOWN');
                    if (!isSnakeRunning && !snakeGameOver) setIsSnakeRunning(true);
                  }}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-purple-600/40 border border-white/15 text-white active:scale-90 transition shadow-md"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Right 1 Col: Difficulty & Rules & Challenge */}
            <div className="space-y-6">
              {/* Difficulty Speed Selection */}
              <div className="bg-[#0d111c] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Speed & Difficulty
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['CHILL', 'STANDARD', 'INSANE'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleSpeedChange(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        speedLevel === lvl
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span>Current Speed:</span>
                  <span className="font-mono text-purple-300 font-bold">{snakeSpeed}ms / tick</span>
                </div>
              </div>

              {/* Controls guide */}
              <div className="bg-[#0d111c] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-3">Controls</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>Move Up / Down / Left / Right</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-gray-200 font-mono">Arrow Keys / WASD</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>Pause / Resume</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-gray-200 font-mono">Spacebar</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Mobile / Tablet</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-gray-200 font-mono">On-screen D-Pad</span>
                  </div>
                </div>
              </div>

              {/* Quick Challenge Friend */}
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-pink-400" />
                  Challenge a Connected Friend
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Send an arcade challenge to your orbit friends to beat your high score!
                </p>

                {challengeSentSuccess && (
                  <div className="p-3 mb-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Challenge sent successfully!
                  </div>
                )}

                <div className="flex gap-2">
                  <select
                    value={selectedFriend}
                    onChange={(e) => setSelectedFriend(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="" className="bg-gray-900">
                      Select connected peer...
                    </option>
                    {connections
                      .map((c) => {
                        const user = c.user ?? c.partner ?? null;
                        if (!user || !user.id) return null;
                        return (
                          <option key={c.id} value={user.id} className="bg-gray-900">
                            {user.display_name} (@{user.username || 'user'})
                          </option>
                        );
                      })
                      .filter(Boolean)}
                  </select>
                  <button
                    onClick={handleSendChallenge}
                    disabled={!selectedFriend}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIC-TAC-TOE ARENA */}
        {activeTab === 'TIC_TAC_TOE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Online session banner */}
            {gameMode === 'PVP_ONLINE' && opponent && (
              <div className="lg:col-span-3 flex items-center justify-between gap-3 p-4 rounded-2xl bg-purple-950/50 border border-purple-500/30">
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                  <img
                    src={opponent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent.id}`}
                    alt={opponent.name}
                    className="h-8 w-8 rounded-xl object-cover border border-purple-500/30"
                  />
                  <div>
                    <p className="text-xs font-bold text-purple-300">Online match vs {opponent.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {isXNext ? 'Your turn (X)' : `${opponent.name}'s turn (O)`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLeaveOnlineGame}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/20 transition"
                >
                  <PhoneOff className="w-4 h-4" /> Leave Game
                </button>
              </div>
            )}

            {/* Left 2 Cols: Tic Tac Toe Arena */}
            <div className="lg:col-span-2 bg-[#0d111c] border border-purple-500/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-2xl">
              {/* Game Mode Selector — hidden during online match */}
              {gameMode !== 'PVP_ONLINE' && (
              <div className="flex items-center gap-2 mb-6 p-1.5 rounded-2xl bg-white/5 border border-white/10">
                <button
                  onClick={() => {
                    setGameMode('AI');
                    resetTicTacToe();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    gameMode === 'AI'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  Vs Smart AI
                </button>
                <button
                  onClick={() => {
                    setGameMode('PVP_LOCAL');
                    resetTicTacToe();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    gameMode === 'PVP_LOCAL'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Pass & Play
                </button>
              </div>
              )}

              {/* Status Header */}
              <div className="text-center mb-6">
                {winner ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-200 font-bold text-base animate-bounce">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    {winner === 'DRAW' ? "It's a Draw!" : `Player ${winner} Wins!`}
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-400">
                    Turn:{' '}
                    <span className={`font-bold ${isXNext ? 'text-cyan-400' : 'text-pink-400'}`}>
                      {isXNext ? 'Player X' : gameMode === 'AI' ? 'AI (O)' : 'Player O'}
                    </span>
                  </div>
                )}
              </div>

              {/* 3x3 Grid Board */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[340px] aspect-square p-2 bg-[#05070c] rounded-3xl border border-white/10 shadow-2xl">
                {board.map((cell, idx) => {
                  const isWinningCell = winningLine?.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleCellClick(idx)}
                      disabled={!!cell || !!winner}
                      className={`relative flex items-center justify-center rounded-2xl text-4xl sm:text-5xl font-black transition-all transform active:scale-95 ${
                        cell
                          ? isWinningCell
                            ? 'bg-purple-600/30 border-2 border-purple-400 shadow-[0_0_15px_#a855f7]'
                            : 'bg-white/5 border border-white/10'
                          : 'bg-white/5 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {cell === 'X' && (
                        <span className="text-cyan-400 drop-shadow-[0_0_10px_#22d3ee] animate-scale-in">X</span>
                      )}
                      {cell === 'O' && (
                        <span className="text-pink-400 drop-shadow-[0_0_10px_#ec4899] animate-scale-in">O</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Reset Game Button */}
              <div className="mt-8">
                <button
                  onClick={resetTicTacToe}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition transform active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Match
                </button>
              </div>
            </div>

            {/* Right 1 Col: Scoreboard & Challenge */}
            <div className="space-y-6">
              {/* Scoreboard */}
              <div className="bg-[#0d111c] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  Arena Scoreboard
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                    <div className="text-xs text-cyan-300 font-semibold mb-1">Player (X)</div>
                    <div className="text-2xl font-black text-cyan-400 font-mono">{score.player}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-500/10 border border-gray-500/20">
                    <div className="text-xs text-gray-300 font-semibold mb-1">Draws</div>
                    <div className="text-2xl font-black text-gray-400 font-mono">{score.draws}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                    <div className="text-xs text-pink-300 font-semibold mb-1">
                      {gameMode === 'AI' ? 'AI (O)' : 'Opponent'}
                    </div>
                    <div className="text-2xl font-black text-pink-400 font-mono">{score.opponentOrAI}</div>
                  </div>
                </div>
              </div>

              {/* Tips & Strategy */}
              <div className="bg-[#0d111c] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-3">AI Intelligence</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The Orbit AI evaluates minimax game trees, blocks immediate win conditions, and aims for corner
                  and center control. Can you defeat it?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FRIEND CHALLENGES */}
        {activeTab === 'CHALLENGES' && (
          <div className="space-y-6">
            {/* Incoming Challenges */}
            <div className="bg-[#0d111c] border border-purple-500/20 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-pink-400" />
                Incoming Game Challenges ({challenges.incoming.length})
              </h2>

              {challenges.incoming.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No pending game challenges right now. Challenge your friends to a match!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.incoming.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ch.sender.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={ch.sender.name}
                          className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{ch.sender.name}</div>
                          <div className="text-xs text-purple-300">Challenged you to {ch.game_type}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondChallenge(ch.id, 'ACCEPT')}
                          className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondChallenge(ch.id, 'DECLINE')}
                          className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Challenges */}
            <div className="bg-[#0d111c] border border-white/10 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                Sent Challenges ({challenges.sent.length})
              </h2>

              {challenges.sent.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">You haven't sent any challenges yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.sent.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{ch.game_type} Challenge</div>
                        <div className="text-xs text-gray-400">Status: {ch.status}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        {ch.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
