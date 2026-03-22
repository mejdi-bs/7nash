'use client';

import { Gamepad2, Target, Keyboard, AlertTriangle, Rocket } from 'lucide-react';

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  return (
    <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-[1000]">
      <div className="bg-gradient-to-br from-[#232931] to-[#393e46] p-8 rounded-2xl text-center max-w-md border-3 border-game-teal shadow-[0_0_30px_rgba(78,204,163,0.3)]">
        <h2 className="text-game-teal text-3xl font-bold mb-5 flex items-center justify-center gap-2">
          <Gamepad2 className="w-8 h-8" /> Welcome to Snake!
        </h2>

        <div className="mb-5 text-left">
          <h3 className="text-game-red text-lg font-semibold mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" /> Goal
          </h3>
          <p className="text-game-cyan">
            Eat the red apple to grow longer and score points!
          </p>
        </div>

        <div className="mb-5 text-left">
          <h3 className="text-game-red text-lg font-semibold mb-2 flex items-center gap-2">
            <Keyboard className="w-5 h-5" /> Controls
          </h3>
          <div className="flex flex-col items-center gap-1 my-4">
            <div className="flex gap-1">
              <span className="w-11 h-11 bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark rounded-lg flex justify-center items-center font-bold text-lg shadow-[0_3px_0_#2d9b73]">
                Z
              </span>
            </div>
            <div className="flex gap-1">
              <span className="w-11 h-11 bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark rounded-lg flex justify-center items-center font-bold text-lg shadow-[0_3px_0_#2d9b73]">
                Q
              </span>
              <span className="w-11 h-11 bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark rounded-lg flex justify-center items-center font-bold text-lg shadow-[0_3px_0_#2d9b73]">
                S
              </span>
              <span className="w-11 h-11 bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark rounded-lg flex justify-center items-center font-bold text-lg shadow-[0_3px_0_#2d9b73]">
                D
              </span>
            </div>
          </div>
          <p className="text-game-cyan text-center">
            Or use the buttons below the game!
          </p>
        </div>

        <div className="mb-5 text-left">
          <h3 className="text-game-red text-lg font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Watch Out!
          </h3>
          <p className="text-game-cyan">
            Don&apos;t hit the walls or your own tail!
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-10 py-4 text-xl bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold rounded-lg flex items-center justify-center gap-2 mx-auto hover:scale-105 hover:shadow-[0_5px_20px_rgba(78,204,163,0.5)] transition-all"
        >
          <Rocket className="w-6 h-6" /> Let&apos;s Play!
        </button>
      </div>
    </div>
  );
}
