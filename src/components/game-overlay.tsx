'use client';

import { Frown, RefreshCw } from 'lucide-react';

interface GameOverlayProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export function GameOverlay({ score, highScore, onRestart }: GameOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
      <div className="bg-gradient-to-br from-[#232931] to-[#393e46] p-10 rounded-2xl text-center border-3 border-game-red">
        <h2 className="text-game-red text-3xl font-bold mb-5 flex items-center justify-center gap-2">
          <Frown className="w-8 h-8" /> Game Over!
        </h2>
        <p className="text-white text-xl mb-2">Your Score: {score}</p>
        <p className="text-white text-xl mb-5">Best Score: {highScore}</p>
        <button
          onClick={onRestart}
          className="px-8 py-3 text-lg bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold rounded-lg flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-transform"
        >
          <RefreshCw className="w-5 h-5" /> Play Again
        </button>
      </div>
    </div>
  );
}
