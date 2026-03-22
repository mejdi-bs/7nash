'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, Gamepad2 } from 'lucide-react';
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
  setHighScore as saveHighScore,
  hasSeenTutorial,
  markTutorialSeen,
  getSelectedSkin,
  setSelectedSkin as saveSelectedSkin,
} from '@/lib/utils/storage';
import { useGameLoop } from '@/hooks/use-game-loop';
import { useSound } from '@/hooks/use-sound';
import { useKeyboard } from '@/hooks/use-keyboard';
import { GameCanvas } from './game-canvas';
import { ScoreDisplay } from './score-display';
import { DifficultySelector } from './difficulty-selector';
import { GameControls } from './game-controls';
import { GameOverlay } from './game-overlay';
import { Tutorial } from './tutorial';
import { SkinSelector } from './skin-selector';
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
  const [mounted, setMounted] = useState(false);

  const bombTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pineappleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const floatingScoreIdRef = useRef(0);

  const { playSound } = useSound();

  // Load initial state from localStorage safely after mount
  useEffect(() => {
    const highScore = getHighScore();
    const savedSkinId = getSelectedSkin();
    const tutorialSeen = hasSeenTutorial();

    setGameState((prev) => ({ ...prev, highScore }));
    setSelectedSkin(getSkinById(savedSkinId));
    setShowTutorial(!tutorialSeen);
    setMounted(true);
  }, []);

  // Sync high score to localStorage whenever it changes
  useEffect(() => {
    if (mounted && gameState.highScore > 0) {
      saveHighScore(gameState.highScore);
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

  // Game tick handler
  const handleTick = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.status !== 'playing') return prevState;

      const { newState, ateFood, hitBomb, atePineapple } = moveSnake(prevState);

      // Handle game over
      if (newState.status === 'gameOver') {
        if (hitBomb) {
          playSound('bomb');
        } else {
          playSound('gameOver');
        }
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return newState;
      }

      // Handle food eaten
      if (ateFood) {
        playSound('eat');
        showFloatingScoreAtHead(newState.snake, '+1', '#4ecca3');

        // Create particles at food position
        const foodX = prevState.food.x * 20 + 10;
        const foodY = prevState.food.y * 20 + 10;
        setParticles((prev) => [...prev, ...createParticles(foodX, foodY, '#4ecca3', 8)]);

        // Spawn new food
        const newFood = spawnFood(newState.snake);
        newState.food = newFood;

        // Maybe spawn bomb
        if (!newState.bomb && shouldSpawnBomb()) {
          const newBomb = spawnBomb(newState.snake, newFood);
          newState.bomb = newBomb;
          bombTimerRef.current = setTimeout(() => {
            setGameState((s) => ({ ...s, bomb: null }));
          }, getBombDuration());
        }

        // Maybe spawn pineapple
        if (!newState.pineapple && shouldSpawnPineapple()) {
          const newPineapple = spawnPineapple(newState.snake, newFood, newState.bomb);
          newState.pineapple = newPineapple;
          pineappleTimerRef.current = setTimeout(() => {
            setGameState((s) => ({ ...s, pineapple: null }));
          }, getPineappleDuration());
        }
      }

      // Handle pineapple eaten
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

  // Use game loop
  useGameLoop({
    difficulty: gameState.difficulty,
    isRunning: gameState.status === 'playing',
    isPaused: gameState.status === 'paused',
    onTick: handleTick,
  });

  // Update particles animation
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) => updateParticles(prev));
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  // Emit trail particles on move
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const newTrail: Particle[] = [];
    gameState.snake.forEach((segment, index) => {
      // Only emit from head and every few segments to keep it clean and performant
      if (index % 2 === 0) {
        const x = segment.x * 20 + 10;
        const y = segment.y * 20 + 10;
        const color = selectedSkin.bodyColor(index);
        newTrail.push(createTrailParticle(x, y, color));
      }
    });

    setParticles((prev) => [...prev.slice(-50), ...newTrail]);
  }, [gameState.lastMoveTime, gameState.status, selectedSkin]);

  // Start game
  const startGame = useCallback(() => {
    playSound('start');
    // Clear timers
    if (bombTimerRef.current) {
      clearTimeout(bombTimerRef.current);
      bombTimerRef.current = null;
    }
    if (pineappleTimerRef.current) {
      clearTimeout(pineappleTimerRef.current);
      pineappleTimerRef.current = null;
    }
    setGameState((prev) => ({
      ...getInitialState(),
      highScore: prev.highScore,
      difficulty: prev.difficulty,
      status: 'playing',
    }));
  }, [playSound]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev.status === 'playing') {
        return { ...prev, status: 'paused' };
      }
      if (prev.status === 'paused') {
        return { ...prev, status: 'playing' };
      }
      return prev;
    });
  }, []);

  // Change direction
  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState((prev) => {
      if (prev.status !== 'playing' && prev.status !== 'idle') return prev;
      if (isValidDirectionChange(prev.direction, newDirection)) {
        return { ...prev, nextDirection: newDirection };
      }
      return prev;
    });
  }, []);

  // Change difficulty
  const changeDifficulty = useCallback((difficulty: Difficulty) => {
    setGameState((prev) => ({ ...prev, difficulty }));
  }, []);

  // Close tutorial
  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    markTutorialSeen();
  }, []);

  // Change skin
  const changeSkin = useCallback((skin: SnakeSkin) => {
    setSelectedSkin(skin);
    saveSelectedSkin(skin.id);
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Go to menu
  const goToMenu = useCallback(() => {
    if (bombTimerRef.current) {
      clearTimeout(bombTimerRef.current);
      bombTimerRef.current = null;
    }
    if (pineappleTimerRef.current) {
      clearTimeout(pineappleTimerRef.current);
      pineappleTimerRef.current = null;
    }
    setGameState((prev) => ({
      ...getInitialState(),
      highScore: prev.highScore,
      difficulty: prev.difficulty,
    }));
  }, []);

  // Keyboard controls
  useKeyboard({
    currentDirection: gameState.direction,
    status: gameState.status,
    onDirectionChange: changeDirection,
    onPause: togglePause,
    onStart: startGame,
  });

  // Handle swipe from canvas
  const handleSwipe = useCallback(
    (direction: Direction) => {
      if (gameState.status === 'idle') {
        startGame();
      }
      changeDirection(direction);
    },
    [gameState.status, startGame, changeDirection]
  );

  return (
    <div className="min-h-screen flex justify-center items-center p-5 relative overflow-hidden bg-game-dark">
      {/* Background animations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-blob absolute -top-25 -left-25" />
        <div className="bg-blob absolute -bottom-25 -right-25 [animation-delay:-5s] [animation-duration:25s]" />
        <div className="bg-blob bg-blob-red absolute top-2/5 left-[30%] w-[300px] h-[300px] [animation-delay:-10s]" />
        <div className="bg-snake absolute top-[20%] -left-[400px]" />
        <div className="bg-snake absolute bottom-[30%] -right-[400px] [animation-delay:-15s] [animation-direction:reverse]" />
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
          style={{
            left: fs.x,
            top: fs.y,
            color: fs.color,
            textShadow: '0 0 10px currentColor',
          }}
        >
          {fs.text}
        </div>
      ))}

      {/* Game Container */}
      <div
        className={`glass-container p-8 text-center ${isShaking ? 'animate-shake' : ''}`}
      >
        <h1 className="text-game-teal text-4xl font-bold mb-1 flex items-center justify-center gap-2 [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
          🐍 Snake Game
        </h1>
        <p className="text-game-cyan mb-5">Made by Chahine</p>

        <ScoreDisplay score={gameState.score} highScore={gameState.highScore} />

        <DifficultySelector
          difficulty={gameState.difficulty}
          onChange={changeDifficulty}
          disabled={gameState.status === 'playing'}
        />

        <SkinSelector
          skins={SNAKE_SKINS}
          selectedSkin={selectedSkin}
          highScore={gameState.highScore}
          onSelect={changeSkin}
          disabled={gameState.status === 'playing'}
        />

        <GameCanvas
          state={gameState}
          skin={selectedSkin}
          particles={particles}
          onTouchStart={startGame}
          onSwipe={handleSwipe}
        />

        {/* Control Buttons */}
        <div className="mt-5 flex justify-center gap-4">
          <button
            onClick={() => {
              if (gameState.status !== 'playing') {
                restartGame();
              }
            }}
            className="px-8 py-3 text-lg bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold rounded-lg flex items-center gap-2 hover:scale-105 hover:shadow-[0_5px_15px_rgba(78,204,163,0.4)] transition-all"
          >
            {gameState.status === 'playing' ? (
              <>
                <Gamepad2 className="w-5 h-5" /> Playing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> Start Game
              </>
            )}
          </button>
          <button
            onClick={togglePause}
            disabled={gameState.status !== 'playing' && gameState.status !== 'paused'}
            className="px-8 py-3 text-lg bg-gradient-to-br from-game-red to-game-red-dark text-white font-bold rounded-lg flex items-center gap-2 hover:scale-105 hover:shadow-[0_5px_15px_rgba(233,69,96,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameState.status === 'paused' ? (
              <>
                <Play className="w-5 h-5" /> Resume
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            )}
          </button>
        </div>

        {/* Mobile Controls */}
        <GameControls
          onDirectionChange={changeDirection}
          onStart={startGame}
          isRunning={gameState.status === 'playing'}
        />
      </div>
    </div>
  );
}
