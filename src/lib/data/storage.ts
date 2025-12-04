// ============================================
// Storage Layer - Browser localStorage wrapper
// ============================================
// This module handles all localStorage operations.
// All other modules should use this, not localStorage directly.
// Safe for SSR - returns defaults when not in browser.

const STORAGE_KEYS = {
  GOALS: 'life-sim:goals',
  TASKS: 'life-sim:tasks',
  SESSIONS: 'life-sim:sessions',
} as const;

/**
 * Check if we're running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Generic get from localStorage with JSON parsing
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Generic set to localStorage with JSON serialization
 */
export function setToStorage<T>(key: string, value: T): boolean {
  if (!isBrowser()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Generate a unique ID (simple UUID v4 alternative)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current ISO timestamp
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString.startsWith(today());
}

export { STORAGE_KEYS };

