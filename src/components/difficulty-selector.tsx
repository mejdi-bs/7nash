'use client';

import type { Difficulty } from '@/types';
import { DIFFICULTY_SPEEDS } from '@/lib/game/constants';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled: boolean;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function DifficultySelector({
  difficulty,
  onChange,
  disabled,
}: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="flex justify-center items-center gap-4 mb-6 text-game-cyan text-sm bg-black/20 py-2.5 px-5 rounded-xl">
      <span>Speed:</span>
      {difficulties.map((diff) => (
        <button
          key={diff}
          onClick={() => !disabled && onChange(diff)}
          disabled={disabled}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            difficulty === diff
              ? 'bg-gradient-to-br from-game-teal to-game-teal-dark text-game-dark font-bold shadow-[0_0_10px_rgba(78,204,163,0.3)]'
              : 'bg-white/5 text-game-cyan border border-white/10 hover:bg-white/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {DIFFICULTY_LABELS[diff]}
        </button>
      ))}
    </div>
  );
}
