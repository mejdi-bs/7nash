import type { Difficulty, Direction } from '@/types';

// Grid settings
export const GRID_SIZE = 20; // Size of each square in pixels
export const TILE_COUNT = 35; // Number of squares (35x35 = 700px)
export const CANVAS_SIZE = GRID_SIZE * TILE_COUNT; // 700px

// Speed settings (ms per tick) - lower = faster
export const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 150,
  medium: 100,
  hard: 60,
};

// Direction vectors
export const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

// Opposite directions (can't reverse)
export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

// Initial snake position
export const INITIAL_SNAKE = [
  { x: 10, y: 10 }, // Head
  { x: 9, y: 10 }, // Body
  { x: 8, y: 10 }, // Tail
];

// Initial food position
export const INITIAL_FOOD = { x: 15, y: 15 };

// Initial direction
export const INITIAL_DIRECTION: Direction = 'RIGHT';

// Spawn chances
export const BOMB_SPAWN_CHANCE = 0.2; // 20% chance after eating
export const PINEAPPLE_SPAWN_CHANCE = 0.1; // 10% chance after eating

// Bomb timing (ms)
export const BOMB_MIN_DURATION = 5000;
export const BOMB_MAX_DURATION = 10000;

// Pineapple timing (ms)
export const PINEAPPLE_MIN_DURATION = 3000;
export const PINEAPPLE_MAX_DURATION = 6000;

// Score values
export const FOOD_SCORE = 1;
export const PINEAPPLE_SCORE = 5;

// Colors
export const COLORS = {
  background: '#1a1a2e',
  gridLine: 'rgba(78, 204, 163, 0.1)',
  snakeHead: '#4ecca3',
  snakeBody: (index: number) => {
    const greenValue = Math.max(100, 204 - index * 5);
    return `rgb(78, ${greenValue}, 163)`;
  },
  snakeEye: '#1a1a2e',
  food: '#e94560',
  foodGlow: '#e94560',
  foodStem: '#4ecca3',
  bombBody: '#2d2d2d',
  bombHighlight: '#4a4a4a',
  bombFuse: '#8b4513',
  bombSpark: '#ff6600',
  bombGlow: '#ff0000',
  pineappleBody: '#f4a020',
  pineapplePattern: '#c67b00',
  pineappleCrown: '#228b22',
  pineappleGlow: '#ffd700',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  highScore: 'snakeHighScore',
  tutorialSeen: 'snakeTutorialSeen',
  selectedSkin: 'snakeSelectedSkin',
  username: 'snakeUsername',
  users: 'snakeUsers',
  currentUser: 'snakeCurrentUser',
  visits: 'snakeVisits',
} as const;
