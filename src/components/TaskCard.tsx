'use client';

import type { Task, TaskType, TaskStatus } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onDone: () => void;
}

const TYPE_COLORS: Record<TaskType, string> = {
  MAIN: 'bg-accent/20 text-accent',
  SIDE: 'bg-secondary/20 text-secondary',
  DAILY: 'bg-success/20 text-success',
  MAINTENANCE: 'bg-muted/20 text-muted',
};

const TYPE_LABELS: Record<TaskType, string> = {
  MAIN: 'Main',
  SIDE: 'Side',
  DAILY: 'Daily',
  MAINTENANCE: 'Maint',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  PLANNED: 'Planned',
  IN_PROGRESS: 'Active',
  DONE: 'Done',
};

export default function TaskCard({ task, isActive, onStart, onPause, onDone }: TaskCardProps) {
  const isDone = task.status === 'DONE';
  
  return (
    <div 
      className={`
        rounded-xl border p-4 transition-all duration-200
        ${isActive 
          ? 'bg-accent/5 border-accent/30 shadow-lg shadow-accent/5' 
          : 'bg-surface border-border'
        }
        ${isDone ? 'opacity-60' : ''}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-foreground truncate ${isDone ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        
        {/* Type badge */}
        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${TYPE_COLORS[task.type]}`}>
          {TYPE_LABELS[task.type]}
        </span>
      </div>
      
      {/* Status & Actions row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {STATUS_LABELS[task.status]}
        </span>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          {!isDone && !isActive && (
            <button
              onClick={onStart}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-accent text-background hover:bg-accent-dim transition-colors active:scale-95"
            >
              Start
            </button>
          )}
          
          {isActive && (
            <>
              <button
                onClick={onPause}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-muted/20 text-foreground hover:bg-muted/30 transition-colors active:scale-95"
              >
                Pause
              </button>
              <button
                onClick={onDone}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors active:scale-95"
              >
                Done
              </button>
            </>
          )}
          
          {!isDone && !isActive && task.status !== 'BACKLOG' && (
            <button
              onClick={onDone}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors active:scale-95"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

