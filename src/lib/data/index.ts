// ============================================
// Data Layer - Main Export
// ============================================
// This is the single entry point for all data operations.
// UI components should import from here, not from individual files.

// Storage utilities
export { 
  isBrowser, 
  generateId, 
  now, 
  today, 
  isToday 
} from './storage';

// Goal operations
export {
  getGoals,
  getGoalById,
  addOrUpdateGoal,
  deleteGoal,
  getActiveGoals,
} from './goals';

// Task operations
export {
  getTasks,
  getTaskById,
  getTasksByStatus,
  getTasksByGoalArc,
  getActiveTasks,
  addOrUpdateTask,
  deleteTask,
  updateTaskStatus,
  linkTaskToGoal,
  createTask,
} from './tasks';

// Session operations
export {
  getSessions,
  getSessionsByTask,
  getActiveSession,
  hasActiveSession,
  startSession,
  endSession,
  endActiveSession,
  endTaskSession,
  getTodaySessions,
  getTodayMinutes,
  getSessionsByDay,
  deleteSession,
} from './sessions';

