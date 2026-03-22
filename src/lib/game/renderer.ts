import type { Position, Direction } from '@/types';
import { GRID_SIZE, CANVAS_SIZE, COLORS } from './constants';

// Draw grid lines
export function drawGrid(ctx: CanvasRenderingContext2D, canvasSize: number): void {
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 0.5;
  const tileCount = canvasSize / GRID_SIZE;

  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvasSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvasSize, i * GRID_SIZE);
    ctx.stroke();
  }
}

// Draw snake
export function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Position[],
  direction: Direction
): void {
  snake.forEach((segment, index) => {
    // Head has different color and glow
    if (index === 0) {
      ctx.fillStyle = COLORS.snakeHead;
      ctx.shadowColor = COLORS.snakeHead;
      ctx.shadowBlur = 10;
    } else {
      // Gradient from head to tail
      ctx.fillStyle = COLORS.snakeBody(index);
      ctx.shadowBlur = 0;
    }

    // Draw rounded rectangle for each segment
    const padding = 1;
    ctx.beginPath();
    ctx.roundRect(
      segment.x * GRID_SIZE + padding,
      segment.y * GRID_SIZE + padding,
      GRID_SIZE - padding * 2,
      GRID_SIZE - padding * 2,
      5
    );
    ctx.fill();

    // Draw eyes on the head
    if (index === 0) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = COLORS.snakeEye;

      // Position eyes based on direction
      let eye1X: number, eye1Y: number, eye2X: number, eye2Y: number;

      if (direction === 'RIGHT') {
        eye1X = segment.x * GRID_SIZE + 13;
        eye1Y = segment.y * GRID_SIZE + 6;
        eye2X = segment.x * GRID_SIZE + 13;
        eye2Y = segment.y * GRID_SIZE + 13;
      } else if (direction === 'LEFT') {
        eye1X = segment.x * GRID_SIZE + 6;
        eye1Y = segment.y * GRID_SIZE + 6;
        eye2X = segment.x * GRID_SIZE + 6;
        eye2Y = segment.y * GRID_SIZE + 13;
      } else if (direction === 'UP') {
        eye1X = segment.x * GRID_SIZE + 6;
        eye1Y = segment.y * GRID_SIZE + 6;
        eye2X = segment.x * GRID_SIZE + 13;
        eye2Y = segment.y * GRID_SIZE + 6;
      } else {
        // DOWN
        eye1X = segment.x * GRID_SIZE + 6;
        eye1Y = segment.y * GRID_SIZE + 13;
        eye2X = segment.x * GRID_SIZE + 13;
        eye2Y = segment.y * GRID_SIZE + 13;
      }

      ctx.beginPath();
      ctx.arc(eye1X, eye1Y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eye2X, eye2Y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Draw food (apple)
export function drawFood(ctx: CanvasRenderingContext2D, food: Position): void {
  const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;

  // Glow effect
  ctx.shadowColor = COLORS.foodGlow;
  ctx.shadowBlur = 15;

  // Apple body
  ctx.fillStyle = COLORS.food;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 2, 7, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.foodStem;
  ctx.fillRect(centerX - 1, centerY - 8, 2, 5);

  // Leaf
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY - 5, 3, 2, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
}

// Draw bomb (hazard)
export function drawBomb(ctx: CanvasRenderingContext2D, bomb: Position, time: number): void {
  const centerX = bomb.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = bomb.y * GRID_SIZE + GRID_SIZE / 2;

  // Pulsing glow effect
  const pulse = Math.sin(time / 150) * 3 + 12;
  ctx.shadowColor = COLORS.bombGlow;
  ctx.shadowBlur = pulse;

  // Bomb body (dark circle)
  ctx.fillStyle = COLORS.bombBody;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.bombHighlight;
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY - 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Fuse
  ctx.strokeStyle = COLORS.bombFuse;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 8);
  ctx.quadraticCurveTo(centerX + 5, centerY - 12, centerX + 3, centerY - 15);
  ctx.stroke();

  // Spark (animated)
  const sparkVisible = Math.sin(time / 100) > 0;
  if (sparkVisible) {
    ctx.fillStyle = COLORS.bombSpark;
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY - 15, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw pineapple (bonus)
export function drawPineapple(ctx: CanvasRenderingContext2D, pineapple: Position): void {
  const centerX = pineapple.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = pineapple.y * GRID_SIZE + GRID_SIZE / 2;

  // Golden glow
  ctx.shadowColor = COLORS.pineappleGlow;
  ctx.shadowBlur = 15;

  // Pineapple body (oval)
  ctx.fillStyle = COLORS.pineappleBody;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 2, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pattern on body
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.pineapplePattern;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      ctx.beginPath();
      ctx.arc(centerX + i * 3, centerY + 2 + j * 3, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Crown leaves
  ctx.fillStyle = COLORS.pineappleCrown;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(centerX + i * 2, centerY - 6);
    ctx.lineTo(centerX + i * 2 + (i > 0 ? 2 : -2), centerY - 12);
    ctx.lineTo(centerX + i * 2 - (i > 0 ? 2 : -2), centerY - 12);
    ctx.closePath();
    ctx.fill();
  }
}

// Draw entire game
export function drawGame(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  snake: Position[],
  food: Position,
  bomb: Position | null,
  pineapple: Position | null,
  direction: Direction,
  time: number
): void {
  // Clear the canvas
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw grid lines
  drawGrid(ctx, canvasSize);

  // Draw food
  drawFood(ctx, food);

  // Draw bomb if exists
  if (bomb) {
    drawBomb(ctx, bomb, time);
  }

  // Draw pineapple if exists
  if (pineapple) {
    drawPineapple(ctx, pineapple);
  }

  // Draw snake
  drawSnake(ctx, snake, direction);

  // Reset shadow
  ctx.shadowBlur = 0;
}
