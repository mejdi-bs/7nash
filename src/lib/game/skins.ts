// Snake skins - unlockable based on high score
export interface SnakeSkin {
  id: string;
  name: string;
  headColor: string;
  bodyColor: (index: number) => string;
  glowColor: string;
  unlockScore: number;
}

export const SNAKE_SKINS: SnakeSkin[] = [
  {
    id: 'classic',
    name: 'Classic',
    headColor: '#4ecca3',
    bodyColor: (i) => `rgb(78, ${Math.max(100, 204 - i * 5)}, 163)`,
    glowColor: '#4ecca3',
    unlockScore: 0,
  },
  {
    id: 'fire',
    name: 'Fire',
    headColor: '#ff6b35',
    bodyColor: (i) => `rgb(255, ${Math.max(80, 150 - i * 6)}, 0)`,
    glowColor: '#ff6b35',
    unlockScore: 10,
  },
  {
    id: 'ice',
    name: 'Ice',
    headColor: '#00d4ff',
    bodyColor: (i) => `rgb(0, ${Math.max(150, 212 - i * 4)}, 255)`,
    glowColor: '#00d4ff',
    unlockScore: 25,
  },
  {
    id: 'gold',
    name: 'Gold',
    headColor: '#ffd700',
    bodyColor: (i) => `rgb(255, ${Math.max(180, 215 - i * 3)}, 0)`,
    glowColor: '#ffd700',
    unlockScore: 50,
  },
  {
    id: 'purple',
    name: 'Royal',
    headColor: '#9b59b6',
    bodyColor: (i) => `rgb(${Math.max(120, 155 - i * 4)}, ${Math.max(60, 89 - i * 3)}, 182)`,
    glowColor: '#9b59b6',
    unlockScore: 75,
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    headColor: '#ff0080',
    bodyColor: (i) => `hsl(${(i * 30) % 360}, 80%, 60%)`,
    glowColor: '#ff0080',
    unlockScore: 100,
  },
];

export function getUnlockedSkins(highScore: number): SnakeSkin[] {
  return SNAKE_SKINS.filter((skin) => highScore >= skin.unlockScore);
}

export function getSkinById(id: string): SnakeSkin {
  return SNAKE_SKINS.find((skin) => skin.id === id) || SNAKE_SKINS[0];
}

// Particle type for eating effects
export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  type: 'blast' | 'trail';
}

let particleId = 0;

export function createParticles(
  x: number,
  y: number,
  color: string,
  count: number = 8
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    particles.push({
      id: ++particleId,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: 2 + Math.random() * 2,
      life: 1,
      type: 'blast',
    });
  }
  return particles;
}

export function createTrailParticle(
  x: number,
  y: number,
  color: string
): Particle {
  return {
    id: ++particleId,
    x,
    y,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    color,
    size: 4 + Math.random() * 4,
    life: 0.5,
    type: 'trail',
  };
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.type === 'blast' ? p.vy + 0.1 : p.vy, // Gravity only for blast
      life: p.life - (p.type === 'blast' ? 0.03 : 0.05),
      size: p.size * (p.type === 'blast' ? 0.97 : 0.95),
    }))
    .filter((p) => p.life > 0);
}
