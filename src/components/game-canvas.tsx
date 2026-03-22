'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Position, Direction } from '@/types';
import { CANVAS_SIZE } from '@/lib/game/constants';
import { drawGame } from '@/lib/game/renderer';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  bomb: Position | null;
  pineapple: Position | null;
  direction: Direction;
  onTouchStart?: () => void;
  onSwipe?: (direction: Direction) => void;
}

export function GameCanvas({
  snake,
  food,
  bomb,
  pineapple,
  direction,
  onTouchStart,
  onSwipe,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGame(ctx, CANVAS_SIZE, snake, food, bomb, pineapple, direction, Date.now());
  }, [snake, food, bomb, pineapple, direction]);

  // Animation loop for smooth rendering (especially bomb animation)
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      onTouchStart?.();
    },
    [onTouchStart]
  );

  // Handle touch end (swipe detection)
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchEndX - touchStartRef.current.x;
      const diffY = touchEndY - touchStartRef.current.y;

      // Detect swipe direction (need minimum 30px swipe)
      if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          // Horizontal swipe
          if (diffX > 0) {
            onSwipe?.('RIGHT');
          } else {
            onSwipe?.('LEFT');
          }
        } else {
          // Vertical swipe
          if (diffY > 0) {
            onSwipe?.('DOWN');
          } else {
            onSwipe?.('UP');
          }
        }
      }

      touchStartRef.current = null;
    },
    [onSwipe]
  );

  // Prevent scrolling when touching the canvas
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="gameCanvas"
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="block mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    />
  );
}
