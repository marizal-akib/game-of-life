// ============================================
// Assistant Types & Operation Schema
// ============================================
// Defines the structure for AI assistant communication
// and the operations it can perform on local data.

import type { TaskType, TaskStatus } from '../types';

// ----- Chat Message Types -----

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  operations?: AssistantOperation[];
}

// ----- Operation Types -----

export type OperationType =
  | 'CREATE_GOAL'
  | 'UPDATE_GOAL'
  | 'DELETE_GOAL'
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'DELETE_TASK'
  | 'LINK_TASK_TO_GOAL'
  | 'SUGGEST_TODAY_TASKS';

// ----- Operation Payloads -----

export interface CreateGoalPayload {
  title: string;
  description?: string;
  targetDate?: string;
}

export interface UpdateGoalPayload {
  goalId: string;
  title?: string;
  description?: string;
  targetDate?: string;
  isActive?: boolean;
}

export interface DeleteGoalPayload {
  goalId: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  goalArcId?: string;
  estimatedMinutes?: number;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  taskId: string;
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  estimatedMinutes?: number;
  dueDate?: string;
}

export interface DeleteTaskPayload {
  taskId: string;
}

export interface LinkTaskToGoalPayload {
  taskId: string;
  goalArcId: string | null; // null to unlink
}

export interface SuggestTodayTasksPayload {
  taskIds: string[];
  reason?: string;
}

// ----- Combined Operation Type -----

export type AssistantOperation =
  | { type: 'CREATE_GOAL'; payload: CreateGoalPayload }
  | { type: 'UPDATE_GOAL'; payload: UpdateGoalPayload }
  | { type: 'DELETE_GOAL'; payload: DeleteGoalPayload }
  | { type: 'CREATE_TASK'; payload: CreateTaskPayload }
  | { type: 'UPDATE_TASK'; payload: UpdateTaskPayload }
  | { type: 'DELETE_TASK'; payload: DeleteTaskPayload }
  | { type: 'LINK_TASK_TO_GOAL'; payload: LinkTaskToGoalPayload }
  | { type: 'SUGGEST_TODAY_TASKS'; payload: SuggestTodayTasksPayload };

// ----- API Request/Response Types -----

export interface AssistantRequest {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: {
    goals: Array<{ id: string; title: string; description: string; targetDate?: string; isActive: boolean }>;
    tasks: Array<{ id: string; title: string; type: string; status: string; goalArcId?: string; description?: string }>;
    todayStats?: {
      focusMinutes: number;
      tasksCompleted: number;
    };
  };
}

export interface AssistantResponse {
  assistantMessage: string;
  operations: AssistantOperation[];
}

// ----- Operation Result -----

export interface OperationResult {
  success: boolean;
  operation: AssistantOperation;
  message: string;
}

