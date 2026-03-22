import { GRID_SIZE, COLORS, DIFFICULTY_SPEEDS } from './constants';
import type { SnakeSkin, Particle } from './skins';
import type { Position, Direction, GameEntity, GameState } from '@/types';

// Helper for rounded rectangles
function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Draw grid lines
export function drawGrid(ctx: CanvasRenderingContext2D, canvasSize: number): void {
  ctx.save();
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
  ctx.restore();
}

// Draw a single segment of the snake with animation
function drawSnakeSegment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  index: number,
  skin: SnakeSkin,
  isHead: boolean,
  time: number
) {
  const padding = 1;
  const size = GRID_SIZE - padding * 2;

  // Slither Wiggle
  const wiggleSpeed = 180;
  const wiggleAmt = isHead ? 0 : Math.sin((time / wiggleSpeed) + (index * 0.5)) * 1.8;

  const rx = x * GRID_SIZE + padding + wiggleAmt;
  const ry = y * GRID_SIZE + padding;

  if (isHead) {
    ctx.fillStyle = skin.headColor || '#4ecca3';
    ctx.shadowColor = skin.glowColor || '#4ecca3';
    const pulse = Math.sin(time / 200) * 5 + 10;
    ctx.shadowBlur = pulse;
  } else {
    ctx.fillStyle = skin.bodyColor(index);
    ctx.shadowBlur = 0;
  }

  fillRoundedRect(ctx, rx, ry, size, size, 6);
  ctx.shadowBlur = 0;
}

// Draw eyes on the head
function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: Direction
) {
  ctx.fillStyle = COLORS.snakeEye;
  const rx = x * GRID_SIZE;
  const ry = y * GRID_SIZE;

  let eye1X: number, eye1Y: number, eye2X: number, eye2Y: number;

  if (direction === 'RIGHT') {
    eye1X = rx + 14; eye1Y = ry + 6;
    eye2X = rx + 14; eye2Y = ry + 14;
  } else if (direction === 'LEFT') {
    eye1X = rx + 6; eye1Y = ry + 6;
    eye2X = rx + 6; eye2Y = ry + 14;
  } else if (direction === 'UP') {
    eye1X = rx + 6; eye1Y = ry + 6;
    eye2X = rx + 14; eye2Y = ry + 6;
  } else {
    eye1X = rx + 6; eye1Y = ry + 14;
    eye2X = rx + 14; eye2Y = ry + 14;
  }

  ctx.beginPath();
  ctx.arc(eye1X, eye1Y, 2.5, 0, Math.PI * 2);
  ctx.arc(eye2X, eye2Y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// Draw detailed Apple (Food)
export function drawFood(ctx: CanvasRenderingContext2D, food: GameEntity, time: number): void {
  const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;

  const age = time - (food.spawnTime || 0);
  const scale = age < 0 ? 1 : Math.min(1, age / 300);
  const bounce = Math.sin(time / 200) * 0.05 + 1;
  const finalScale = scale * bounce;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(finalScale, finalScale);
  ctx.translate(-centerX, -centerY);

  // Apple shadow glow
  ctx.shadowColor = COLORS.foodGlow;
  ctx.shadowBlur = 15;

  // Body
  ctx.fillStyle = COLORS.food; // Red
  ctx.beginPath();
  ctx.arc(centerX, centerY + 2, 7, 0, Math.PI * 2);
  ctx.fill();

  // Highlights
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(centerX - 3, centerY - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.fillStyle = COLORS.foodStem; // Brown/Green
  ctx.fillRect(centerX - 1, centerY - 8, 2, 5);

  // Leaf
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY - 6, 3, 2, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw detailed Pineapple
export function drawPineapple(ctx: CanvasRenderingContext2D, pineapple: GameEntity, time: number): void {
  const centerX = pineapple.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = pineapple.y * GRID_SIZE + GRID_SIZE / 2;

  const age = time - (pineapple.spawnTime || 0);
  const scale = age < 0 ? 1 : Math.min(1, age / 400);
  const hover = Math.sin(time / 250) * 3;

  ctx.save();
  ctx.translate(centerX, centerY + hover);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -(centerY + hover));

  ctx.shadowColor = COLORS.pineappleGlow;
  ctx.shadowBlur = 15;

  // Body
  ctx.fillStyle = COLORS.pineappleBody; // Orange/Yellow
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 2, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Scales pattern
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.pineapplePattern;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      ctx.beginPath();
      ctx.arc(centerX + i * 3, centerY + 2 + j * 3, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Green Crown
  ctx.fillStyle = COLORS.pineappleCrown;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(centerX + i * 2, centerY - 6);
    ctx.lineTo(centerX + i * 2 + (i > 0 ? 2 : -2), centerY - 13);
    ctx.lineTo(centerX + i * 2 - (i > 0 ? 2 : -2), centerY - 13);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// Draw detailed Bomb
export function drawBomb(ctx: CanvasRenderingContext2D, bomb: GameEntity, time: number): void {
  const centerX = bomb.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = bomb.y * GRID_SIZE + GRID_SIZE / 2;

  const age = time - (bomb.spawnTime || 0);
  const scale = age < 0 ? 1 : Math.min(1, age / 400);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);

  // Glow
  const pulse = Math.sin(time / 150) * 3 + 12;
  ctx.shadowColor = COLORS.bombGlow;
  ctx.shadowBlur = pulse;

  // Body
  ctx.fillStyle = COLORS.bombBody;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Glint
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
  ctx.quadraticCurveTo(centerX + 6, centerY - 12, centerX + 4, centerY - 16);
  ctx.stroke();

  // Spark
  if (Math.sin(time / 100) > 0) {
    ctx.fillStyle = COLORS.bombSpark;
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY - 16, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw particles
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// Draw entire game
export function drawGame(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  state: GameState,
  time: number,
  skin: SnakeSkin,
  particles: Particle[]
): void {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  drawGrid(ctx, canvasSize);

  if (state.food) drawFood(ctx, state.food, time);
  if (state.bomb) drawBomb(ctx, state.bomb, time);
  if (state.pineapple) drawPineapple(ctx, state.pineapple, time);

  if (state.snake && state.snake.length > 0) {
    state.snake.forEach((segment, index) => {
      drawSnakeSegment(ctx, segment.x, segment.y, index, skin, index === 0, time);
      if (index === 0) {
        drawEyes(ctx, segment.x, segment.y, state.direction);
      }
    });
  }

  drawParticles(ctx, particles);
}
