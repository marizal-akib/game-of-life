'use client';

import { useState } from 'react';
import type { TaskType, GoalArc } from '@/lib/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, type: TaskType, goalArcId?: string) => void;
  goals: GoalArc[];
}

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'MAIN', label: 'Main Quest' },
  { value: 'SIDE', label: 'Side Quest' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

export default function AddTaskModal({ isOpen, onClose, onAdd, goals }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('SIDE');
  const [goalArcId, setGoalArcId] = useState<string>('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd(title.trim(), type, goalArcId || undefined);
    setTitle('');
    setType('SIDE');
    setGoalArcId('');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-2xl p-6 pb-8 animate-slide-up">
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />
        
        <h2 className="text-xl font-bold text-foreground mb-6">New Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-sm text-muted mb-2">What do you need to do?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>
          
          {/* Type selector */}
          <div>
            <label className="block text-sm text-muted mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TASK_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${type === t.value 
                      ? 'bg-accent text-background' 
                      : 'bg-background border border-border text-foreground hover:border-accent/50'
                    }
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Goal arc selector */}
          {goals.length > 0 && (
            <div>
              <label className="block text-sm text-muted mb-2">Link to Goal (optional)</label>
              <select
                value={goalArcId}
                onChange={(e) => setGoalArcId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">No goal</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3 rounded-xl bg-accent text-background font-medium hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

