// ============================================
// GoalArc Data Operations
// ============================================

import type { GoalArc } from '../types';
import { 
  getFromStorage, 
  setToStorage, 
  generateId, 
  now,
  STORAGE_KEYS 
} from './storage';

/**
 * Get all goal arcs from storage
 */
export function getGoals(): GoalArc[] {
  return getFromStorage<GoalArc[]>(STORAGE_KEYS.GOALS, []);
}

/**
 * Get a single goal arc by ID
 */
export function getGoalById(id: string): GoalArc | undefined {
  const goals = getGoals();
  return goals.find(g => g.id === id);
}

/**
 * Add a new goal arc or update an existing one
 * If the goal has an ID and exists, it updates; otherwise creates new
 */
export function addOrUpdateGoal(goal: Partial<GoalArc> & { title: string }): GoalArc {
  const goals = getGoals();
  const timestamp = now();
  
  // Check if updating existing
  const existingIndex = goal.id ? goals.findIndex(g => g.id === goal.id) : -1;
  
  if (existingIndex >= 0) {
    // Update existing goal
    const updated: GoalArc = {
      ...goals[existingIndex],
      ...goal,
      updatedAt: timestamp,
    };
    goals[existingIndex] = updated;
    setToStorage(STORAGE_KEYS.GOALS, goals);
    return updated;
  } else {
    // Create new goal
    const newGoal: GoalArc = {
      id: generateId(),
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate,
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: goal.isActive ?? true,
    };
    goals.push(newGoal);
    setToStorage(STORAGE_KEYS.GOALS, goals);
    return newGoal;
  }
}

/**
 * Delete a goal arc by ID
 */
export function deleteGoal(id: string): boolean {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  
  if (filtered.length === goals.length) return false;
  
  setToStorage(STORAGE_KEYS.GOALS, filtered);
  return true;
}

/**
 * Get active goal arcs only
 */
export function getActiveGoals(): GoalArc[] {
  return getGoals().filter(g => g.isActive);
}

