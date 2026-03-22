import { STORAGE_KEYS } from '@/lib/game/constants';

interface UserData {
  username: string;
  highScore: number;
  selectedSkin: string;
  privateSkins?: string[];
}

interface LeaderboardEntry {
  username: string;
  highScore: number;
  selectedSkin: string;
}

// Cache for user data
let userCache: UserData | null = null;

// Get currently logged in username (from localStorage session)
export function getUsername(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.currentUser) || '';
}

// Login/Sign up a user via API
export async function login(username: string, password?: string, selectedSkin?: string): Promise<{ success: boolean; isNew?: boolean; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'Server-side' };

  const trimmedName = username.trim();
  if (!trimmedName) return { success: false, error: 'Username required' };

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: trimmedName, password, selectedSkin })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    // Store session locally
    localStorage.setItem(STORAGE_KEYS.currentUser, data.username.toLowerCase());
    userCache = data;

    return { success: true, isNew: data.isNew };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error' };
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  userCache = null;
}

// Get user data from API
async function fetchUserData(): Promise<UserData | null> {
  const username = getUsername();
  if (!username) return null;

  if (userCache) return userCache;

  try {
    const response = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
    if (!response.ok) return null;

    userCache = await response.json();
    return userCache;
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
}

// Get high score (async)
export async function getHighScore(): Promise<number> {
  const user = await fetchUserData();
  return user?.highScore || 0;
}

// Get high score sync (from cache, returns 0 if not cached)
export function getHighScoreSync(): number {
  return userCache?.highScore || 0;
}

// Set high score via API
export async function setHighScore(score: number): Promise<void> {
  const username = getUsername();
  if (!username) return;

  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, highScore: score })
    });

    if (response.ok) {
      const data = await response.json();
      if (userCache) {
        userCache.highScore = data.highScore;
      }
    }
  } catch (error) {
    console.error('Set high score error:', error);
  }
}

// Check if tutorial has been seen (local only)
export function hasSeenTutorial(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.tutorialSeen) === 'true';
}

// Mark tutorial as seen (local only)
export function markTutorialSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.tutorialSeen, 'true');
}

// Get selected skin (async)
export async function getSelectedSkin(): Promise<string> {
  const user = await fetchUserData();
  return user?.selectedSkin || 'classic';
}

// Get selected skin sync (from cache)
export function getSelectedSkinSync(): string {
  return userCache?.selectedSkin || 'classic';
}

// Get private skins (async)
export async function getPrivateSkins(): Promise<string[]> {
  const user = await fetchUserData();
  return user?.privateSkins || [];
}

// Get private skins sync (from cache)
export function getPrivateSkinsSync(): string[] {
  return userCache?.privateSkins || [];
}

// Set selected skin via API
export async function setSelectedSkin(skinId: string): Promise<void> {
  const username = getUsername();
  if (!username) return;

  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, selectedSkin: skinId })
    });

    if (response.ok) {
      if (userCache) {
        userCache.selectedSkin = skinId;
      }
    }
  } catch (error) {
    console.error('Set skin error:', error);
  }
}

// Get top N players from API
export async function getTopPlayers(count: number = 3): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`/api/leaderboard?limit=${count}`);
    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return [];
  }
}

// Get total visit count from API
export async function getVisitCount(): Promise<number> {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    return data.visits || 0;
  } catch {
    return 0;
  }
}

// Increment visit count via API
export async function incrementVisitCount(): Promise<number> {
  try {
    const res = await fetch('/api/stats', { method: 'POST' });
    const data = await res.json();
    return data.visits || 0;
  } catch {
    return 0;
  }
}

// Clear user cache (call after logout)
export function clearUserCache() {
  userCache = null;
}
