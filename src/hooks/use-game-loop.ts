'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Difficulty } from '@/types';
import { DIFFICULTY_SPEEDS } from '@/lib/game/constants';

interface UseGameLoopOptions {
  difficulty: Difficulty;
  isRunning: boolean;
  isPaused: boolean;
  onTick: () => void;
}

export function useGameLoop({
  difficulty,
  isRunning,
  isPaused,
  onTick,
}: UseGameLoopOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTickRef = useRef(onTick);

  // Keep onTick callback updated
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Get speed based on difficulty
  const speed = DIFFICULTY_SPEEDS[difficulty];

  // Start/stop game loop
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        onTickRef.current();
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, speed]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { stop };
}
