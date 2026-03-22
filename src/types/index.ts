export interface Position {
  x: number;
  y: number;
}

// Entity with spawn timestamp for animations
export interface GameEntity extends Position {
  spawnTime: number;
}

// Direction types
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Game status
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

// Main game state interface
export interface GameState {
  snake: Position[];
  food: GameEntity;
  bomb: GameEntity | null;
  pineapple: GameEntity | null;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  difficulty: Difficulty;
  status: GameStatus;
  lastMoveTime: number;
  lastEatTime: number;
  lastEatType: 'food' | 'pineapple' | null;
}

// Game action types for reducer
export type GameAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'GAME_OVER' }
  | { type: 'TICK' }
  | { type: 'CHANGE_DIRECTION'; payload: Direction }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_HIGH_SCORE'; payload: number }
  | { type: 'SPAWN_BOMB'; payload: Position }
  | { type: 'SPAWN_PINEAPPLE'; payload: Position }
  | { type: 'CLEAR_BOMB' }
  | { type: 'CLEAR_PINEAPPLE' };

// Sound types
export type SoundType = 'eat' | 'gameOver' | 'start' | 'move' | 'bomb' | 'pineapple';

// Canvas dimensions
export interface CanvasDimensions {
  width: number;
  height: number;
}
