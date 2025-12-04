// ============================================
// Avatar State Logic
// ============================================
// Derives avatar state from current session and time.

import type { AvatarState, Session } from './types';

/**
 * Check if current time is "night" (23:00 - 06:00)
 */
export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 6;
}

/**
 * Derive avatar state from current data
 * 
 * Rules:
 * - If there is an active session → WORKING
 * - If no active session and it's night time → RESTING
 * - Otherwise → IDLE
 */
export function getAvatarState(activeSession: Session | undefined): AvatarState {
  if (activeSession) {
    return 'WORKING';
  }
  
  if (isNightTime()) {
    return 'RESTING';
  }
  
  return 'IDLE';
}

/**
 * Get avatar emoji based on state
 */
export function getAvatarEmoji(state: AvatarState): string {
  switch (state) {
    case 'WORKING':
      return '🔥';
    case 'RESTING':
      return '😴';
    case 'IDLE':
    default:
      return '✨';
  }
}

/**
 * Get avatar status message
 */
export function getAvatarMessage(state: AvatarState): string {
  switch (state) {
    case 'WORKING':
      return 'In the zone...';
    case 'RESTING':
      return 'Recharging...';
    case 'IDLE':
    default:
      return 'Ready for action!';
  }
}

