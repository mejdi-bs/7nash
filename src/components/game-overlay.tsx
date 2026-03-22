'use client';

import { Frown, RefreshCw, Menu } from 'lucide-react';

interface GameOverlayProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverlay({ score, highScore, onRestart, onMenu }: GameOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
      <div className="bg-gradient-to-br from-[#232931] to-[#393e46] p-10 rounded-2xl text-center border-3 border-game-red">
        <h2 className="text-game-red text-3xl font-bold mb-5 flex items-center justify-center gap-2">
          <Frown className="w-8 h-8" /> Game Over!
        </h2>
        <p className="text-white text-xl mb-2">Your Score: {score}</p>
        <p className="text-white text-xl mb-6">Best Score: {highScore}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="px-8 py-3 text-lg bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold rounded-lg flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-transform"
          >
            <RefreshCw className="w-5 h-5" /> Play Again
          </button>
          <button
            onClick={onMenu}
            className="px-8 py-3 text-lg bg-gradient-to-br from-game-cyan/30 to-game-cyan/10 text-game-cyan font-bold rounded-lg flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-transform border border-game-cyan/30"
          >
            <Menu className="w-5 h-5" /> Menu
          </button>
        </div>
      </div>
    </div>
  );
}
