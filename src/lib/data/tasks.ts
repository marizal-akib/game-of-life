// ============================================
// Task Data Operations
// ============================================

import type { Task, TaskStatus, TaskType } from '../types';
import { 
  getFromStorage, 
  setToStorage, 
  generateId, 
  now,
  STORAGE_KEYS 
} from './storage';

/**
 * Get all tasks from storage
 */
export function getTasks(): Task[] {
  return getFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
}

/**
 * Get a single task by ID
 */
export function getTaskById(id: string): Task | undefined {
  const tasks = getTasks();
  return tasks.find(t => t.id === id);
}

/**
 * Get tasks by status
 */
export function getTasksByStatus(status: TaskStatus): Task[] {
  return getTasks().filter(t => t.status === status);
}

/**
 * Get tasks by goal arc ID
 */
export function getTasksByGoalArc(goalArcId: string): Task[] {
  return getTasks().filter(t => t.goalArcId === goalArcId);
}

/**
 * Get all non-done tasks (for "Today" view)
 */
export function getActiveTasks(): Task[] {
  return getTasks().filter(t => t.status !== 'DONE');
}

/**
 * Add a new task or update an existing one
 */
export function addOrUpdateTask(task: Partial<Task> & { title: string }): Task {
  const tasks = getTasks();
  const timestamp = now();
  
  const existingIndex = task.id ? tasks.findIndex(t => t.id === task.id) : -1;
  
  if (existingIndex >= 0) {
    // Update existing task
    const updated: Task = {
      ...tasks[existingIndex],
      ...task,
      updatedAt: timestamp,
    };
    
    // If marking as done, set completedAt
    if (task.status === 'DONE' && !updated.completedAt) {
      updated.completedAt = timestamp;
    }
    // If un-marking as done, clear completedAt
    if (task.status && task.status !== 'DONE') {
      updated.completedAt = undefined;
    }
    
    tasks[existingIndex] = updated;
    setToStorage(STORAGE_KEYS.TASKS, tasks);
    return updated;
  } else {
    // Create new task
    const newTask: Task = {
      id: generateId(),
      title: task.title,
      description: task.description,
      type: task.type || 'SIDE',
      status: task.status || 'BACKLOG',
      goalArcId: task.goalArcId,
      estimatedMinutes: task.estimatedMinutes,
      dueDate: task.dueDate,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tasks.push(newTask);
    setToStorage(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }
}

/**
 * Delete a task by ID
 */
export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  
  if (filtered.length === tasks.length) return false;
  
  setToStorage(STORAGE_KEYS.TASKS, filtered);
  return true;
}

/**
 * Update task status helper
 */
export function updateTaskStatus(id: string, status: TaskStatus): Task | undefined {
  const task = getTaskById(id);
  if (!task) return undefined;
  
  return addOrUpdateTask({ ...task, status });
}

/**
 * Link a task to a goal arc
 */
export function linkTaskToGoal(taskId: string, goalArcId: string | undefined): Task | undefined {
  const task = getTaskById(taskId);
  if (!task) return undefined;
  
  return addOrUpdateTask({ ...task, goalArcId });
}

/**
 * Quick create task helper
 */
export function createTask(
  title: string, 
  type: TaskType = 'SIDE',
  goalArcId?: string
): Task {
  return addOrUpdateTask({
    title,
    type,
    status: 'PLANNED',
    goalArcId,
  });
}

