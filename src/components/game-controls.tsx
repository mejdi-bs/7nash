'use client';

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Direction } from '@/types';

interface GameControlsProps {
  onDirectionChange: (direction: Direction) => void;
  onStart: () => void;
  isRunning: boolean;
}

export function GameControls({
  onDirectionChange,
  onStart,
  isRunning,
}: GameControlsProps) {
  const handleDirectionClick = (direction: Direction) => {
    if (!isRunning) onStart();
    onDirectionChange(direction);
  };

  return (
    <div className="flex flex-col items-center gap-1 mt-5">
      <button
        onClick={() => handleDirectionClick('UP')}
        className="w-[70px] h-[60px] text-lg bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold flex justify-center items-center rounded-lg active:scale-95 transition-transform"
      >
        Z <ChevronUp className="w-4 h-4" />
      </button>
      <div className="flex gap-1">
        <button
          onClick={() => handleDirectionClick('LEFT')}
          className="w-[70px] h-[60px] text-lg bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold flex justify-center items-center rounded-lg active:scale-95 transition-transform"
        >
          Q <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDirectionClick('DOWN')}
          className="w-[70px] h-[60px] text-lg bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold flex justify-center items-center rounded-lg active:scale-95 transition-transform"
        >
          S <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDirectionClick('RIGHT')}
          className="w-[70px] h-[60px] text-lg bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold flex justify-center items-center rounded-lg active:scale-95 transition-transform"
        >
          D <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
