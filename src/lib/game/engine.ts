import type { Position, Direction, GameState } from '@/types';
import {
  TILE_COUNT,
  DIRECTION_VECTORS,
  OPPOSITE_DIRECTIONS,
  BOMB_SPAWN_CHANCE,
  PINEAPPLE_SPAWN_CHANCE,
  FOOD_SCORE,
  PINEAPPLE_SCORE,
  BOMB_MIN_DURATION,
  BOMB_MAX_DURATION,
  PINEAPPLE_MIN_DURATION,
  PINEAPPLE_MAX_DURATION,
  INITIAL_SNAKE,
  INITIAL_FOOD,
  INITIAL_DIRECTION,
} from './constants';

// Generate random position within grid
export function getRandomPosition(): Position {
  return {
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT),
  };
}

// Check if position is occupied by snake
export function isOnSnake(position: Position, snake: Position[]): boolean {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}

// Check if position is occupied by food
export function isOnFood(position: Position, food: Position): boolean {
  return position.x === food.x && position.y === food.y;
}

// Check if position is occupied by bomb
export function isOnBomb(position: Position, bomb: Position | null): boolean {
  return bomb !== null && position.x === bomb.x && position.y === bomb.y;
}

// Check if position is occupied by pineapple
export function isOnPineapple(position: Position, pineapple: Position | null): boolean {
  return pineapple !== null && position.x === pineapple.x && position.y === pineapple.y;
}

// Spawn food at valid position
export function spawnFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = getRandomPosition();
  } while (isOnSnake(food, snake));
  return food;
}

// Spawn bomb at valid position
export function spawnBomb(snake: Position[], food: Position): Position {
  let bomb: Position;
  do {
    bomb = getRandomPosition();
  } while (isOnSnake(bomb, snake) || isOnFood(bomb, food));
  return bomb;
}

// Spawn pineapple at valid position
export function spawnPineapple(
  snake: Position[],
  food: Position,
  bomb: Position | null
): Position {
  let pineapple: Position;
  do {
    pineapple = getRandomPosition();
  } while (
    isOnSnake(pineapple, snake) ||
    isOnFood(pineapple, food) ||
    isOnBomb(pineapple, bomb)
  );
  return pineapple;
}

// Check wall collision
function checkWallCollision(head: Position): boolean {
  return head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT;
}

// Check self collision (skip tail since it will move)
function checkSelfCollision(head: Position, snake: Position[]): boolean {
  for (let i = 0; i < snake.length - 1; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

// Get new head position based on direction
function getNewHead(snake: Position[], direction: Direction): Position {
  const { dx, dy } = DIRECTION_VECTORS[direction];
  return {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
  };
}

// Check if direction change is valid (can't reverse)
export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return OPPOSITE_DIRECTIONS[current] !== next;
}

// Get direction from key
export function getDirectionFromKey(key: string): Direction | null {
  const keyLower = key.toLowerCase();
  switch (keyLower) {
    case 'z':
    case 'arrowup':
      return 'UP';
    case 's':
    case 'arrowdown':
      return 'DOWN';
    case 'q':
    case 'arrowleft':
      return 'LEFT';
    case 'd':
    case 'arrowright':
      return 'RIGHT';
    default:
      return null;
  }
}

// Get initial game state
export function getInitialState(): GameState {
  return {
    snake: [...INITIAL_SNAKE],
    food: { ...INITIAL_FOOD },
    bomb: null,
    pineapple: null,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    score: 0,
    highScore: 0,
    difficulty: 'easy',
    status: 'idle',
  };
}

// Move snake and return new state with flags
export function moveSnake(state: GameState): {
  newState: GameState;
  ateFood: boolean;
  hitBomb: boolean;
  atePineapple: boolean;
} {
  const { snake, food, bomb, pineapple, nextDirection } = state;

  // Update direction
  const direction = nextDirection;

  // Get new head position
  const newHead = getNewHead(snake, direction);

  // Check wall collision
  if (checkWallCollision(newHead)) {
    return {
      newState: { ...state, direction, status: 'gameOver' },
      ateFood: false,
      hitBomb: false,
      atePineapple: false,
    };
  }

  // Check self collision
  if (checkSelfCollision(newHead, snake)) {
    return {
      newState: { ...state, direction, status: 'gameOver' },
      ateFood: false,
      hitBomb: false,
      atePineapple: false,
    };
  }

  // Check bomb collision
  const hitBomb = isOnBomb(newHead, bomb);
  if (hitBomb) {
    return {
      newState: { ...state, direction, status: 'gameOver' },
      ateFood: false,
      hitBomb: true,
      atePineapple: false,
    };
  }

  // Check pineapple collision
  const atePineapple = isOnPineapple(newHead, pineapple);

  // Create new snake with new head
  const newSnake = [newHead, ...snake];

  // Check if snake ate food
  const ateFood = isOnFood(newHead, food);

  // Remove tail if no food eaten
  if (!ateFood) {
    newSnake.pop();
  }

  // Calculate new score
  let newScore = state.score;
  if (ateFood) {
    newScore += FOOD_SCORE;
  }
  if (atePineapple) {
    newScore += PINEAPPLE_SCORE;
  }

  // Update high score if needed
  const newHighScore = Math.max(newScore, state.highScore);

  return {
    newState: {
      ...state,
      snake: newSnake,
      direction,
      score: newScore,
      highScore: newHighScore,
      pineapple: atePineapple ? null : pineapple,
    },
    ateFood,
    hitBomb,
    atePineapple,
  };
}

// Should spawn bomb (random chance after eating)
export function shouldSpawnBomb(): boolean {
  return Math.random() < BOMB_SPAWN_CHANCE;
}

// Should spawn pineapple (random chance after eating)
export function shouldSpawnPineapple(): boolean {
  return Math.random() < PINEAPPLE_SPAWN_CHANCE;
}

// Get random bomb duration
export function getBombDuration(): number {
  return BOMB_MIN_DURATION + Math.random() * (BOMB_MAX_DURATION - BOMB_MIN_DURATION);
}

// Get random pineapple duration
export function getPineappleDuration(): number {
  return PINEAPPLE_MIN_DURATION + Math.random() * (PINEAPPLE_MAX_DURATION - PINEAPPLE_MIN_DURATION);
}
