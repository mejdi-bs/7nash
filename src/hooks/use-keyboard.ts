'use client';

import { useEffect, useCallback } from 'react';
import type { Direction, GameStatus } from '@/types';
import { isValidDirectionChange, getDirectionFromKey } from '@/lib/game/engine';

interface UseKeyboardOptions {
  currentDirection: Direction;
  status: GameStatus;
  onDirectionChange: (direction: Direction) => void;
  onPause: () => void;
  onStart: () => void;
}

export function useKeyboard({
  currentDirection,
  status,
  onDirectionChange,
  onPause,
  onStart,
}: UseKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;

      // Start game on control key if idle
      if (status === 'idle') {
        const direction = getDirectionFromKey(key);
        if (direction) {
          onStart();
        }
      }

      // Handle direction changes
      const newDirection = getDirectionFromKey(key);
      if (newDirection && isValidDirectionChange(currentDirection, newDirection)) {
        onDirectionChange(newDirection);
      }

      // Handle pause
      if (key === ' ' || key === 'Spacebar') {
        e.preventDefault();
        if (status === 'playing' || status === 'paused') {
          onPause();
        }
      }
    },
    [currentDirection, status, onDirectionChange, onPause, onStart]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
