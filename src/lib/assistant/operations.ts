// ============================================
// Operation Executor
// ============================================
// Applies AI assistant operations to local data.

import type { AssistantOperation, OperationResult } from './types';
import { 
  addOrUpdateGoal, 
  deleteGoal, 
  getGoalById,
  addOrUpdateTask, 
  deleteTask, 
  linkTaskToGoal,
  getTaskById,
} from '../data';

/**
 * Execute a single operation and return the result
 */
export function executeOperation(operation: AssistantOperation): OperationResult {
  try {
    switch (operation.type) {
      case 'CREATE_GOAL': {
        const { title, description, targetDate } = operation.payload;
        const goal = addOrUpdateGoal({ title, description, targetDate });
        return {
          success: true,
          operation,
          message: `Created goal "${goal.title}"`,
        };
      }

      case 'UPDATE_GOAL': {
        const { goalId, ...updates } = operation.payload;
        const existing = getGoalById(goalId);
        if (!existing) {
          return {
            success: false,
            operation,
            message: `Goal not found: ${goalId}`,
          };
        }
        const goal = addOrUpdateGoal({ ...existing, ...updates });
        return {
          success: true,
          operation,
          message: `Updated goal "${goal.title}"`,
        };
      }

      case 'DELETE_GOAL': {
        const { goalId } = operation.payload;
        const existing = getGoalById(goalId);
        const deleted = deleteGoal(goalId);
        return {
          success: deleted,
          operation,
          message: deleted 
            ? `Deleted goal "${existing?.title}"` 
            : `Failed to delete goal: ${goalId}`,
        };
      }

      case 'CREATE_TASK': {
        const { title, description, type, status, goalArcId, estimatedMinutes, dueDate } = operation.payload;
        const task = addOrUpdateTask({ 
          title, 
          description, 
          type: type || 'SIDE',
          status: status || 'PLANNED',
          goalArcId, 
          estimatedMinutes,
          dueDate,
        });
        return {
          success: true,
          operation,
          message: `Created task "${task.title}"`,
        };
      }

      case 'UPDATE_TASK': {
        const { taskId, ...updates } = operation.payload;
        const existing = getTaskById(taskId);
        if (!existing) {
          return {
            success: false,
            operation,
            message: `Task not found: ${taskId}`,
          };
        }
        const task = addOrUpdateTask({ ...existing, ...updates });
        return {
          success: true,
          operation,
          message: `Updated task "${task.title}"`,
        };
      }

      case 'DELETE_TASK': {
        const { taskId } = operation.payload;
        const existing = getTaskById(taskId);
        const deleted = deleteTask(taskId);
        return {
          success: deleted,
          operation,
          message: deleted 
            ? `Deleted task "${existing?.title}"` 
            : `Failed to delete task: ${taskId}`,
        };
      }

      case 'LINK_TASK_TO_GOAL': {
        const { taskId, goalArcId } = operation.payload;
        const task = linkTaskToGoal(taskId, goalArcId || undefined);
        if (!task) {
          return {
            success: false,
            operation,
            message: `Failed to link task: ${taskId}`,
          };
        }
        return {
          success: true,
          operation,
          message: goalArcId 
            ? `Linked "${task.title}" to goal` 
            : `Unlinked "${task.title}" from goal`,
        };
      }

      case 'SUGGEST_TODAY_TASKS': {
        // This operation is informational - no data changes
        const { taskIds, reason } = operation.payload;
        return {
          success: true,
          operation,
          message: `Suggested ${taskIds.length} task(s) for today${reason ? `: ${reason}` : ''}`,
        };
      }

      default:
        return {
          success: false,
          operation,
          message: 'Unknown operation type',
        };
    }
  } catch (error) {
    console.error('Operation execution error:', error);
    return {
      success: false,
      operation,
      message: `Error executing operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute multiple operations and return all results
 */
export function executeOperations(operations: AssistantOperation[]): OperationResult[] {
  return operations.map(op => executeOperation(op));
}

/**
 * Generate a summary message for operation results
 */
export function summarizeResults(results: OperationResult[]): string | null {
  if (results.length === 0) return null;
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const parts: string[] = [];
  
  // Group successful operations by type
  const goalCreates = successful.filter(r => r.operation.type === 'CREATE_GOAL');
  const taskCreates = successful.filter(r => r.operation.type === 'CREATE_TASK');
  const updates = successful.filter(r => 
    r.operation.type === 'UPDATE_GOAL' || r.operation.type === 'UPDATE_TASK'
  );
  const deletes = successful.filter(r => 
    r.operation.type === 'DELETE_GOAL' || r.operation.type === 'DELETE_TASK'
  );
  const links = successful.filter(r => r.operation.type === 'LINK_TASK_TO_GOAL');
  
  if (goalCreates.length > 0) {
    parts.push(`Created ${goalCreates.length} goal${goalCreates.length > 1 ? 's' : ''}`);
  }
  if (taskCreates.length > 0) {
    parts.push(`Created ${taskCreates.length} task${taskCreates.length > 1 ? 's' : ''}`);
  }
  if (updates.length > 0) {
    parts.push(`Updated ${updates.length} item${updates.length > 1 ? 's' : ''}`);
  }
  if (deletes.length > 0) {
    parts.push(`Deleted ${deletes.length} item${deletes.length > 1 ? 's' : ''}`);
  }
  if (links.length > 0) {
    parts.push(`Linked ${links.length} task${links.length > 1 ? 's' : ''}`);
  }
  
  if (failed.length > 0) {
    parts.push(`${failed.length} action${failed.length > 1 ? 's' : ''} failed`);
  }
  
  return parts.length > 0 ? parts.join(', ') : null;
}

