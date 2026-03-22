'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, Gamepad2, LogOut, Users, Eye, Loader2 } from 'lucide-react';
import type { GameState, Direction, Difficulty } from '@/types';
import {
  getInitialState,
  moveSnake,
  spawnFood,
  spawnBomb,
  spawnPineapple,
  shouldSpawnBomb,
  shouldSpawnPineapple,
  getBombDuration,
  getPineappleDuration,
  isValidDirectionChange,
} from '@/lib/game/engine';
import {
  getHighScore,
  getHighScoreSync,
  setHighScore as saveHighScore,
  hasSeenTutorial,
  markTutorialSeen,
  getSelectedSkin,
  getSelectedSkinSync,
  setSelectedSkin as saveSelectedSkin,
  login as performLogin,
  logout as performLogout,
  getUsername,
  getVisitCount,
  incrementVisitCount,
  getTopPlayers,
  clearUserCache,
} from '@/lib/utils/storage';
import { useGameLoop } from '@/hooks/use-game-loop';
import { useSound } from '@/hooks/use-sound';
import { useKeyboard } from '@/hooks/use-keyboard';
import { GameCanvas } from './game-canvas';
import { ScoreDisplay } from './score-display';
import { LoginForm } from './login-form';
import { DifficultySelector } from './difficulty-selector';
import { GameControls } from './game-controls';
import { GameOverlay } from './game-overlay';
import { Tutorial } from './tutorial';
import { SkinSelector } from './skin-selector';
import { BackgroundSnakes } from './background-snakes';
import {
  SNAKE_SKINS,
  getSkinById,
  getUnlockedSkins,
  createParticles,
  createTrailParticle,
  updateParticles,
  type SnakeSkin,
  type Particle,
} from '@/lib/game/skins';

export function Game() {
  const [gameState, setGameState] = useState<GameState>(() => getInitialState());
  const [showTutorial, setShowTutorial] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [floatingScores, setFloatingScores] = useState<
    Array<{ id: number; text: string; color: string; x: number; y: number }>
  >([]);
  const [selectedSkin, setSelectedSkin] = useState<SnakeSkin>(() => getSkinById('classic'));
  const [particles, setParticles] = useState<Particle[]>([]);
  const [username, setUsername] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [onlinePlayers, setOnlinePlayers] = useState(12);
  const [topPlayers, setTopPlayers] = useState<Array<{ username: string; highScore: number; selectedSkin: string }>>([]);

  const bombTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pineappleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const floatingScoreIdRef = useRef(0);

  const { playSound } = useSound();

  // Load initial state after mount
  useEffect(() => {
    const savedUsername = getUsername();
    const tutorialSeen = hasSeenTutorial();

    // Increment visit count on mount
    incrementVisitCount().then(setVisitCount).catch(() => {});

    if (savedUsername) {
      // Fetch user data from API
      Promise.all([
        getHighScore(),
        getSelectedSkin(),
        getTopPlayers(3)
      ]).then(([highScore, skinId, players]) => {
        setGameState(prev => ({ ...prev, highScore }));
        setSelectedSkin(getSkinById(skinId));
        setTopPlayers(players);
      });
    }

    setUsername(savedUsername);
    setShowTutorial(!tutorialSeen);
    setMounted(true);

    // Fetch real online count and update user activity
    const onlineInterval = setInterval(async () => {
      try {
        // Update current user's activity
        if (savedUsername) {
          fetch('/api/online', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: savedUsername })
          }).catch(() => { });
        }

        // Get online count
        const res = await fetch('/api/online');
        const data = await res.json();
        setOnlinePlayers(data.count || 1);
      } catch {
        setOnlinePlayers(1);
      }
    }, 30000);

    // Initial fetch
    fetch('/api/online').then(res => res.json()).then(data => setOnlinePlayers(data.count || 1)).catch(() => { });

    return () => clearInterval(onlineInterval);
  }, []);

  // Sync high score to API whenever it changes
  useEffect(() => {
    if (mounted && gameState.highScore > 0) {
      saveHighScore(gameState.highScore);
      getTopPlayers(3).then(setTopPlayers);
    }
  }, [gameState.highScore, mounted]);

  // Show floating score at snake head
  const showFloatingScoreAtHead = useCallback(
    (snake: GameState['snake'], text: string, color: string) => {
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const gridSize = 20;
      const x = rect.left + snake[0].x * gridSize + gridSize / 2;
      const y = rect.top + snake[0].y * gridSize;

      const id = floatingScoreIdRef.current++;
      setFloatingScores((prev) => [...prev, { id, text, color, x, y }]);

      setTimeout(() => {
        setFloatingScores((prev) => prev.filter((fs) => fs.id !== id));
      }, 800);
    },
    []
  );

  const handleTick = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.status !== 'playing') return prevState;
      const { newState, ateFood, hitBomb, atePineapple } = moveSnake(prevState);
      if (newState.status === 'gameOver') {
        if (hitBomb) playSound('bomb');
        else playSound('gameOver');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return newState;
      }
      if (ateFood) {
        playSound('eat');
        showFloatingScoreAtHead(newState.snake, '+1', '#4ecca3');
        const foodX = prevState.food.x * 20 + 10;
        const foodY = prevState.food.y * 20 + 10;
        setParticles((prev) => [...prev, ...createParticles(foodX, foodY, '#4ecca3', 8)]);
        const newFood = spawnFood(newState.snake);
        newState.food = newFood;
        if (!newState.bomb && shouldSpawnBomb()) {
          const newBomb = spawnBomb(newState.snake, newFood);
          newState.bomb = newBomb;
          bombTimerRef.current = setTimeout(() => {
            setGameState((s) => ({ ...s, bomb: null }));
          }, getBombDuration());
        }
        if (!newState.pineapple && shouldSpawnPineapple()) {
          const newPineapple = spawnPineapple(newState.snake, newFood, newState.bomb);
          newState.pineapple = newPineapple;
          pineappleTimerRef.current = setTimeout(() => {
            setGameState((s) => ({ ...s, pineapple: null }));
          }, getPineappleDuration());
        }
      }
      if (atePineapple) {
        playSound('pineapple');
        showFloatingScoreAtHead(newState.snake, '+5', '#ffd700');
        if (pineappleTimerRef.current) {
          clearTimeout(pineappleTimerRef.current);
          pineappleTimerRef.current = null;
        }
      }
      return newState;
    });
  }, [playSound, showFloatingScoreAtHead]);

  useGameLoop({
    difficulty: gameState.difficulty,
    isRunning: gameState.status === 'playing',
    isPaused: gameState.status === 'paused',
    onTick: handleTick,
  });

  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) => updateParticles(prev));
    }, 16);
    return () => clearInterval(interval);
  }, [particles.length]);

  useEffect(() => {
    if (gameState.status !== 'playing') return;
    const newTrail: Particle[] = [];
    gameState.snake.forEach((segment, index) => {
      if (index % 2 === 0) {
        const x = segment.x * 20 + 10;
        const y = segment.y * 20 + 10;
        const color = selectedSkin.bodyColor(index);
        newTrail.push(createTrailParticle(x, y, color));
      }
    });
    setParticles((prev) => [...prev.slice(-50), ...newTrail]);
  }, [gameState.lastMoveTime, gameState.status, selectedSkin]);

  const startGame = useCallback(() => {
    playSound('start');
    if (bombTimerRef.current) { clearTimeout(bombTimerRef.current); bombTimerRef.current = null; }
    if (pineappleTimerRef.current) { clearTimeout(pineappleTimerRef.current); pineappleTimerRef.current = null; }
    setGameState((prev) => ({
      ...getInitialState(),
      highScore: prev.highScore,
      difficulty: prev.difficulty,
      status: 'playing',
    }));
  }, [playSound]);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev.status === 'playing') return { ...prev, status: 'paused' };
      if (prev.status === 'paused') return { ...prev, status: 'playing' };
      return prev;
    });
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState((prev) => {
      if (prev.status !== 'playing' && prev.status !== 'idle') return prev;
      if (isValidDirectionChange(prev.direction, newDirection)) {
        return { ...prev, nextDirection: newDirection };
      }
      return prev;
    });
  }, []);

  const changeDifficulty = useCallback((difficulty: Difficulty) => {
    setGameState((prev) => ({ ...prev, difficulty }));
  }, []);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    markTutorialSeen();
  }, []);

  const changeSkin = useCallback((skin: SnakeSkin) => {
    setSelectedSkin(skin);
    saveSelectedSkin(skin.id);
  }, []);

  const handleLogin = useCallback(async (name: string, pass?: string) => {
    setIsLoading(true);
    try {
      const result = await performLogin(name, pass);
      if (result.success) {
        setUsername(name);
        const [highScore, skinId] = await Promise.all([
          getHighScore(),
          getSelectedSkin()
        ]);
        setGameState(prev => ({ ...prev, highScore }));
        setSelectedSkin(getSkinById(skinId));
        getTopPlayers(3).then(setTopPlayers);
        playSound('start');
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [playSound]);

  const handleLogout = useCallback(() => {
    performLogout();
    clearUserCache();
    setUsername('');
    setGameState(getInitialState());
  }, []);

  const restartGame = useCallback(() => startGame(), [startGame]);

  const goToMenu = useCallback(() => {
    if (bombTimerRef.current) { clearTimeout(bombTimerRef.current); bombTimerRef.current = null; }
    if (pineappleTimerRef.current) { clearTimeout(pineappleTimerRef.current); pineappleTimerRef.current = null; }
    setGameState((prev) => ({ ...getInitialState(), highScore: prev.highScore, difficulty: prev.difficulty }));
  }, []);

  useKeyboard({
    currentDirection: gameState.direction,
    status: gameState.status,
    onDirectionChange: changeDirection,
    onPause: togglePause,
    onStart: startGame,
  });

  const handleSwipe = useCallback(
    (direction: Direction) => {
      if (gameState.status === 'idle') startGame();
      changeDirection(direction);
    },
    [gameState.status, startGame, changeDirection]
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-5 relative overflow-hidden bg-[#0f172a]">
      {/* Background animations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="bg-blob absolute -top-25 -left-25 opacity-30" />
        <div className="bg-blob absolute -bottom-25 -right-25 [animation-delay:-5s] [animation-duration:25s] opacity-30" />
        <BackgroundSnakes topPlayers={topPlayers} />
      </div>

      {/* Tutorial */}
      {showTutorial && <Tutorial onClose={closeTutorial} />}

      {/* Game Over Overlay */}
      {gameState.status === 'gameOver' && (
        <GameOverlay
          score={gameState.score}
          highScore={gameState.highScore}
          onRestart={restartGame}
          onMenu={goToMenu}
        />
      )}

      {/* Floating Scores */}
      {floatingScores.map((fs) => (
        <div
          key={fs.id}
          className="fixed font-bold text-2xl pointer-events-none z-[1000] animate-float-score"
          style={{ left: fs.x, top: fs.y, color: fs.color, textShadow: '0 0 10px currentColor' }}
        >
          {fs.text}
        </div>
      ))}

      {/* Login Screen */}
      {!username && mounted && (
        <div className="relative z-50">
          <LoginForm onLogin={handleLogin} isLoading={isLoading} />
        </div>
      )}

      {/* Main Game Interface */}
      {username && mounted && (
        <div className={`glass-container w-[90vw] min-h-[90vh] p-4 sm:p-8 flex flex-col items-center justify-between relative z-20 overflow-y-auto ${isShaking ? 'animate-shake' : ''}`}>
          <div className="w-full flex justify-between items-center mb-4">
            <h1 className="text-game-teal text-3xl sm:text-4xl font-bold flex items-center gap-2 [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              🐍 Snake
            </h1>
            <div className="flex items-center gap-4">
              <p className="hidden sm:block text-game-cyan text-sm opacity-80">Welcome, <span className="text-white font-bold">{username}</span>!</p>
              <button onClick={handleLogout} className="p-2 text-white/40 hover:text-game-red transition-colors group relative bg-white/5 rounded-lg border border-white/10" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
            {/* Left Column: Stats & Difficulty */}
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <ScoreDisplay score={gameState.score} highScore={gameState.highScore} />
              <DifficultySelector
                difficulty={gameState.difficulty}
                onChange={changeDifficulty}
                disabled={gameState.status === 'playing'}
              />
              <div className="lg:block hidden">
                <GameControls onDirectionChange={changeDirection} onStart={startGame} isRunning={gameState.status === 'playing'} />
              </div>
            </div>

            {/* Middle Column: Canvas */}
            <div className="flex flex-col items-center order-1 lg:order-2">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-game-teal/20 to-game-cyan/20 rounded-xl blur-xl transition-all group-hover:blur-2xl opacity-50" />
                <GameCanvas
                  state={gameState}
                  skin={selectedSkin}
                  particles={particles}
                  onTouchStart={startGame}
                  onSwipe={handleSwipe}
                />
              </div>

              {/* Control Buttons - Desktop */}
              <div className="mt-6 flex justify-center gap-4 w-full">
                <button
                  onClick={() => gameState.status !== 'playing' && restartGame()}
                  className="flex-1 max-w-[200px] px-6 py-4 text-sm sm:text-base bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 hover:shadow-[0_8px_20px_rgba(78,204,163,0.4)] transition-all active:scale-95"
                >
                  {gameState.status === 'playing' ? <><Gamepad2 className="w-5 h-5" /> Playing...</> : <><Play className="w-5 h-5" /> Start Game</>}
                </button>
                <button
                  onClick={togglePause}
                  disabled={gameState.status !== 'playing' && gameState.status !== 'paused'}
                  className="flex-1 max-w-[200px] px-6 py-4 text-sm sm:text-base bg-gradient-to-br from-game-red to-game-red-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 hover:shadow-[0_8px_20px_rgba(233,69,96,0.4)] transition-all disabled:opacity-50 active:scale-95"
                >
                  {gameState.status === 'paused' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {gameState.status === 'paused' ? 'Resume' : 'Pause'}
                </button>
              </div>
            </div>

            {/* Right Column: Skins & Mobile Controls */}
            <div className="flex flex-col gap-6 order-3">
              <SkinSelector
                skins={SNAKE_SKINS}
                selectedSkin={selectedSkin}
                highScore={gameState.highScore}
                onSelect={changeSkin}
                disabled={gameState.status === 'playing'}
              />
              <div className="lg:hidden block">
                <GameControls onDirectionChange={changeDirection} onStart={startGame} isRunning={gameState.status === 'playing'} />
              </div>
            </div>
          </div>

          <div className="h-4" /> {/* Spacer */}
        </div>
      )}

      {/* Global Stats Footer */}
      {mounted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center gap-8 bg-black/20 backdrop-blur-md border-t border-white/5 z-40">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
            <Users className="w-4 h-4 text-game-teal animate-pulse" />
            <span>Online: <span className="text-white font-bold">{onlinePlayers}</span></span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
            <Eye className="w-4 h-4 text-game-cyan" />
            <span>Visits: <span className="text-white font-bold">{visitCount}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
