// ============================================
// Import Executor
// ============================================
// Special executor for import operations that handles temp goal IDs.

import type { AssistantOperation } from './types';
import { addOrUpdateGoal, addOrUpdateTask } from '../data';

interface ImportResult {
  goalsCreated: number;
  tasksCreated: number;
  errors: string[];
}

/**
 * Execute import operations with temp goal ID resolution.
 * Goals are created first, then their real IDs replace temp IDs in tasks.
 */
export function executeImportOperations(operations: AssistantOperation[]): ImportResult {
  const result: ImportResult = {
    goalsCreated: 0,
    tasksCreated: 0,
    errors: [],
  };

  // Map temp IDs to real IDs
  const tempIdMap = new Map<string, string>();
  let tempGoalCounter = 1;

  // First pass: Create all goals and map temp IDs
  const goalOps = operations.filter(op => op.type === 'CREATE_GOAL');
  
  for (const op of goalOps) {
    if (op.type !== 'CREATE_GOAL') continue;
    
    try {
      const goal = addOrUpdateGoal({
        title: op.payload.title,
        description: op.payload.description,
        targetDate: op.payload.targetDate,
      });
      
      // Map the temp ID to the real ID
      const tempId = `TEMP_GOAL_${tempGoalCounter}`;
      tempIdMap.set(tempId, goal.id);
      tempGoalCounter++;
      
      result.goalsCreated++;
    } catch (error) {
      result.errors.push(`Failed to create goal "${op.payload.title}": ${error}`);
    }
  }

  // Second pass: Create all tasks with resolved goal IDs
  const taskOps = operations.filter(op => op.type === 'CREATE_TASK');
  
  for (const op of taskOps) {
    if (op.type !== 'CREATE_TASK') continue;
    
    try {
      let goalArcId = op.payload.goalArcId;
      
      // Resolve temp ID to real ID
      if (goalArcId && goalArcId.startsWith('TEMP_GOAL_')) {
        goalArcId = tempIdMap.get(goalArcId);
      }
      
      addOrUpdateTask({
        title: op.payload.title,
        description: op.payload.description,
        type: op.payload.type || 'SIDE',
        status: op.payload.status || 'PLANNED',
        goalArcId,
        estimatedMinutes: op.payload.estimatedMinutes,
        dueDate: op.payload.dueDate,
      });
      
      result.tasksCreated++;
    } catch (error) {
      result.errors.push(`Failed to create task "${op.payload.title}": ${error}`);
    }
  }

  return result;
}

