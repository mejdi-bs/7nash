import { STORAGE_KEYS } from '@/lib/game/constants';

// Get high score from localStorage
export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEYS.highScore);
  return stored ? parseInt(stored, 10) : 0;
}

// Set high score in localStorage
export function setHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.highScore, score.toString());
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

// Get selected skin from localStorage
export function getSelectedSkin(): string {
  if (typeof window === 'undefined') return 'classic';
  return localStorage.getItem(STORAGE_KEYS.selectedSkin) || 'classic';
}

// Set selected skin in localStorage
export function setSelectedSkin(skinId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.selectedSkin, skinId);
}
