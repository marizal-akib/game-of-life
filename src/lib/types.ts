// ============================================
// Life Sim Tracker - Core Type Definitions
// ============================================

// ----- Status & Category Unions -----

/** Current status of a task */
export type TaskStatus = 'BACKLOG' | 'PLANNED' | 'IN_PROGRESS' | 'DONE';

/** Category/type of task in the life sim */
export type TaskType = 'MAIN' | 'SIDE' | 'DAILY' | 'MAINTENANCE';

/** Avatar state for visual feedback */
export type AvatarState = 'IDLE' | 'WORKING' | 'RESTING';

// ----- Core Entities -----

/**
 * A GoalArc represents a large, overarching goal
 * that spans multiple phases and contains many tasks.
 * Think of it like a "quest line" in a game.
 */
export interface GoalArc {
  id: string;
  title: string;
  description: string;
  targetDate?: string; // ISO date string
  createdAt: string;   // ISO date string
  updatedAt: string;   // ISO date string
  isActive: boolean;
}

/**
 * A Phase is a milestone or chapter within a GoalArc.
 * Each phase has a specific focus and deadline.
 * (Not used in Phase 1, but kept for future phases)
 */
export interface Phase {
  id: string;
  goalArcId: string;
  title: string;
  description: string;
  order: number;
  targetDate?: string;   // ISO date string
  completedAt?: string;  // ISO date string
  isActive: boolean;
}

/**
 * A Task is a single actionable item.
 * Tasks can be linked to a GoalArc and tracked with sessions.
 */
export interface Task {
  id: string;
  goalArcId?: string;    // Links task to a goal arc
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  estimatedMinutes?: number;
  actualMinutes?: number;
  dueDate?: string;      // ISO date string
  completedAt?: string;  // ISO date string
  createdAt: string;     // ISO date string
  updatedAt: string;     // ISO date string
}

/**
 * A Session represents a focused work period on a task.
 * Used for time tracking and productivity metrics.
 */
export interface Session {
  id: string;
  taskId: string;
  startedAt: string;      // ISO date string
  endedAt?: string;       // ISO date string
  durationMinutes?: number;
  notes?: string;
}

// ----- Helper Types -----

/** Summary stats for a given day */
export interface DaySummary {
  date: string;           // YYYY-MM-DD format
  totalMinutes: number;
  tasksCompleted: number;
  sessions: Session[];
}
