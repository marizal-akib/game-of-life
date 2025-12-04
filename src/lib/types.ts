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
  phases: Phase[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * A Phase is a milestone or chapter within a GoalArc.
 * Each phase has a specific focus and deadline.
 */
export interface Phase {
  id: string;
  goalArcId: string;
  title: string;
  description: string;
  order: number;
  targetDate?: Date;
  completedAt?: Date;
  isActive: boolean;
}

/**
 * A Task is a single actionable item.
 * Tasks belong to phases and can be tracked with sessions.
 */
export interface Task {
  id: string;
  phaseId?: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  estimatedMinutes?: number;
  actualMinutes?: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A Session represents a focused work period on a task.
 * Used for time tracking and productivity metrics.
 */
export interface Session {
  id: string;
  taskId: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
  notes?: string;
}

