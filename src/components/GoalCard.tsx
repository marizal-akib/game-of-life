'use client';

import type { GoalArc, Task } from '@/lib/types';

interface GoalCardProps {
  goal: GoalArc;
  tasks: Task[];
  onEdit: () => void;
}

export default function GoalCard({ goal, tasks, onEdit }: GoalCardProps) {
  // Calculate progress
  const linkedTasks = tasks.filter(t => t.goalArcId === goal.id);
  const doneTasks = linkedTasks.filter(t => t.status === 'DONE');
  const progress = linkedTasks.length > 0 
    ? Math.round((doneTasks.length / linkedTasks.length) * 100)
    : 0;
  
  // Format target date
  const targetDate = goal.targetDate 
    ? new Date(goal.targetDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-muted mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted">Progress</span>
          <span className="text-foreground font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{doneTasks.length} / {linkedTasks.length} tasks</span>
        {targetDate && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            {targetDate}
          </span>
        )}
      </div>
    </div>
  );
}

