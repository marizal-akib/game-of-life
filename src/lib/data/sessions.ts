// ============================================
// Session Data Operations
// ============================================

import type { Session, DaySummary } from '../types';
import { 
  getFromStorage, 
  setToStorage, 
  generateId, 
  now,
  today,
  isToday,
  STORAGE_KEYS 
} from './storage';

/**
 * Get all sessions from storage
 */
export function getSessions(): Session[] {
  return getFromStorage<Session[]>(STORAGE_KEYS.SESSIONS, []);
}

/**
 * Get sessions for a specific task
 */
export function getSessionsByTask(taskId: string): Session[] {
  return getSessions().filter(s => s.taskId === taskId);
}

/**
 * Get the currently active session (started but not ended)
 */
export function getActiveSession(): Session | undefined {
  return getSessions().find(s => !s.endedAt);
}

/**
 * Check if a specific task has an active session
 */
export function hasActiveSession(taskId: string): boolean {
  const active = getActiveSession();
  return active?.taskId === taskId;
}

/**
 * Start a new session for a task
 * Returns the new session, or undefined if task already has active session
 */
export function startSession(taskId: string): Session {
  const sessions = getSessions();
  
  const newSession: Session = {
    id: generateId(),
    taskId,
    startedAt: now(),
  };
  
  sessions.push(newSession);
  setToStorage(STORAGE_KEYS.SESSIONS, sessions);
  return newSession;
}

/**
 * End a session by ID
 * Calculates duration and updates the session
 */
export function endSession(sessionId: string): Session | undefined {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  
  if (index < 0) return undefined;
  
  const session = sessions[index];
  if (session.endedAt) return session; // Already ended
  
  const endTime = now();
  const startTime = new Date(session.startedAt).getTime();
  const endTimeMs = new Date(endTime).getTime();
  const durationMinutes = Math.round((endTimeMs - startTime) / 60000);
  
  const updated: Session = {
    ...session,
    endedAt: endTime,
    durationMinutes,
  };
  
  sessions[index] = updated;
  setToStorage(STORAGE_KEYS.SESSIONS, sessions);
  return updated;
}

/**
 * End the currently active session (if any)
 */
export function endActiveSession(): Session | undefined {
  const active = getActiveSession();
  if (!active) return undefined;
  return endSession(active.id);
}

/**
 * End active session for a specific task
 */
export function endTaskSession(taskId: string): Session | undefined {
  const sessions = getSessions();
  const active = sessions.find(s => s.taskId === taskId && !s.endedAt);
  if (!active) return undefined;
  return endSession(active.id);
}

/**
 * Get today's sessions
 */
export function getTodaySessions(): Session[] {
  return getSessions().filter(s => isToday(s.startedAt));
}

/**
 * Get total focused minutes for today
 */
export function getTodayMinutes(): number {
  const todaySessions = getTodaySessions();
  return todaySessions.reduce((sum, s) => {
    if (s.durationMinutes) {
      return sum + s.durationMinutes;
    }
    // For active session, calculate current duration
    if (!s.endedAt) {
      const startTime = new Date(s.startedAt).getTime();
      const currentTime = Date.now();
      return sum + Math.round((currentTime - startTime) / 60000);
    }
    return sum;
  }, 0);
}

/**
 * Aggregate sessions by day for history view
 */
export function getSessionsByDay(): DaySummary[] {
  const sessions = getSessions();
  const dayMap = new Map<string, Session[]>();
  
  // Group sessions by date
  sessions.forEach(session => {
    const date = session.startedAt.split('T')[0]; // YYYY-MM-DD
    const existing = dayMap.get(date) || [];
    existing.push(session);
    dayMap.set(date, existing);
  });
  
  // Convert to summaries
  const summaries: DaySummary[] = [];
  dayMap.forEach((daySessions, date) => {
    const totalMinutes = daySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    
    // Count unique completed tasks (sessions that ended)
    const completedTaskIds = new Set(
      daySessions
        .filter(s => s.endedAt)
        .map(s => s.taskId)
    );
    
    summaries.push({
      date,
      totalMinutes,
      tasksCompleted: completedTaskIds.size,
      sessions: daySessions,
    });
  });
  
  // Sort by date descending (most recent first)
  summaries.sort((a, b) => b.date.localeCompare(a.date));
  
  return summaries;
}

/**
 * Delete a session by ID
 */
export function deleteSession(id: string): boolean {
  const sessions = getSessions();
  const filtered = sessions.filter(s => s.id !== id);
  
  if (filtered.length === sessions.length) return false;
  
  setToStorage(STORAGE_KEYS.SESSIONS, filtered);
  return true;
}

