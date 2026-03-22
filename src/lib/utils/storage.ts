import { STORAGE_KEYS } from '@/lib/game/constants';

interface UserData {
  password?: string;
  highScore: number;
  selectedSkin: string;
}

type UsersMap = Record<string, UserData>;

function getUsers(): UsersMap {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.users);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Failed to parse users:', err);
    return {};
  }
}

function saveUsers(users: UsersMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

// Get currently logged in username
export function getUsername(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.currentUser) || '';
}

// Login/Sign up a user
export function login(username: string, password?: string): boolean {
  if (typeof window === 'undefined') return false;

  const trimmedName = username.trim();
  if (!trimmedName) return false;

  const users = getUsers();
  const lowerName = trimmedName.toLowerCase();

  if (users[lowerName]) {
    // If the account HAS a password, check it
    if (users[lowerName].password && users[lowerName].password !== password) {
      return false;
    }
    // If it didn't have a password but user is trying to log in with one, 
    // we let them in and set the password for future protection
    if (!users[lowerName].password && password) {
      users[lowerName].password = password;
      saveUsers(users);
    }
  } else {
    // Create new user
    users[lowerName] = {
      password: password || undefined,
      highScore: 0,
      selectedSkin: 'classic'
    };
    saveUsers(users);
  }

  localStorage.setItem(STORAGE_KEYS.currentUser, lowerName);
  return true;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

// Get high score from localStorage (USER SPECIFIC)
export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const username = getUsername();
  if (!username) return 0;

  const users = getUsers();
  return users[username]?.highScore || 0;
}

// Set high score in localStorage (USER SPECIFIC)
export function setHighScore(score: number): void {
  const username = getUsername();
  if (!username) return;

  const users = getUsers();
  if (users[username]) {
    users[username].highScore = Math.max(users[username].highScore, score);
    saveUsers(users);
  }
}

// Check if tutorial has been seen
export function hasSeenTutorial(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.tutorialSeen) === 'true';
}

// Mark tutorial as seen
export function markTutorialSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.tutorialSeen, 'true');
}

// Get selected skin from localStorage (USER SPECIFIC)
export function getSelectedSkin(): string {
  const username = getUsername();
  if (!username) return 'classic';

  const users = getUsers();
  return users[username]?.selectedSkin || 'classic';
}

// Set selected skin in localStorage (USER SPECIFIC)
export function setSelectedSkin(skinId: string): void {
  const username = getUsername();
  if (!username) return;

  const users = getUsers();
  if (users[username]) {
    users[username].selectedSkin = skinId;
    saveUsers(users);
  }
}
// Get top N players by high score
export function getTopPlayers(count: number = 3): Array<{ name: string; highScore: number; skinId: string }> {
  const users = getUsers();
  return Object.entries(users)
    .map(([name, data]) => ({
      name,
      highScore: data.highScore,
      skinId: data.selectedSkin
    }))
    .sort((a, b) => b.highScore - a.highScore)
    .slice(0, count);
}

// Get total visit count
export function getVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEYS.visits);
  return stored ? parseInt(stored, 10) : 0;
}

// Increment visit count
export function incrementVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  const current = getVisitCount();
  const next = current + 1;
  localStorage.setItem(STORAGE_KEYS.visits, next.toString());
  return next;
}
