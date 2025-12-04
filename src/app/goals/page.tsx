'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GoalArc, Task } from '@/lib/types';
import { 
  getGoals, 
  getTasks,
  addOrUpdateGoal, 
  deleteGoal,
  linkTaskToGoal,
  isBrowser,
} from '@/lib/data';
import GoalCard from '@/components/GoalCard';
import GoalModal from '@/components/GoalModal';

export default function GoalsPage() {
  // ----- State -----
  const [goals, setGoals] = useState<GoalArc[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalArc | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // For task assignment
  const [assigningTask, setAssigningTask] = useState<Task | undefined>();

  // ----- Data Loading -----
  const loadData = useCallback(() => {
    if (!isBrowser()) return;
    
    setGoals(getGoals());
    setTasks(getTasks());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ----- Actions -----
  
  const handleOpenCreate = () => {
    setEditingGoal(undefined);
    setIsModalOpen(true);
  };
  
  const handleOpenEdit = (goal: GoalArc) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };
  
  const handleSave = (data: { title: string; description: string; targetDate?: string }) => {
    if (editingGoal) {
      // Update existing
      addOrUpdateGoal({
        ...editingGoal,
        ...data,
      });
    } else {
      // Create new
      addOrUpdateGoal(data);
    }
    setIsModalOpen(false);
    setEditingGoal(undefined);
    loadData();
  };
  
  const handleDelete = () => {
    if (editingGoal) {
      // Unlink all tasks from this goal first
      tasks.forEach(task => {
        if (task.goalArcId === editingGoal.id) {
          linkTaskToGoal(task.id, undefined);
        }
      });
      
      deleteGoal(editingGoal.id);
      setIsModalOpen(false);
      setEditingGoal(undefined);
      loadData();
    }
  };
  
  const handleAssignTask = (task: Task) => {
    setAssigningTask(task);
  };
  
  const handleLinkTaskToGoal = (goalId: string | undefined) => {
    if (assigningTask) {
      linkTaskToGoal(assigningTask.id, goalId);
      setAssigningTask(undefined);
      loadData();
    }
  };

  // ----- Derived Data -----
  const unlinkedTasks = tasks.filter(t => !t.goalArcId && t.status !== 'DONE');

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          Your Journey
        </p>
        <h1 className="text-3xl font-bold text-foreground">Goals</h1>
      </header>

      {/* Goals section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Goal Arcs</h2>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-accent text-background hover:bg-accent-dim transition-colors active:scale-95"
          >
            + New
          </button>
        </div>
        
        {/* Goal list */}
        {!isLoaded ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-6 text-center">
            <p className="text-muted mb-4">No goals yet. Create your first goal arc!</p>
            <button
              onClick={handleOpenCreate}
              className="text-accent font-medium hover:underline"
            >
              Create a goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                tasks={tasks}
                onEdit={() => handleOpenEdit(goal)}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Unlinked tasks section */}
      {unlinkedTasks.length > 0 && goals.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Unlinked Tasks</h2>
          <p className="text-sm text-muted mb-3">These tasks aren&apos;t linked to any goal:</p>
          
          <div className="space-y-2">
            {unlinkedTasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface border border-border p-3"
              >
                <span className="text-foreground truncate">{task.title}</span>
                <button
                  onClick={() => handleAssignTask(task)}
                  className="shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                >
                  Link
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Goal modal */}
      <GoalModal
        isOpen={isModalOpen}
        goal={editingGoal}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(undefined);
        }}
        onSave={handleSave}
        onDelete={editingGoal ? handleDelete : undefined}
      />
      
      {/* Task assignment modal */}
      {assigningTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAssigningTask(undefined)}
          />
          <div className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-2xl p-6 pb-8">
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-foreground mb-2">Link Task</h2>
            <p className="text-muted mb-6">
              Choose a goal for &quot;{assigningTask.title}&quot;:
            </p>
            
            <div className="space-y-2">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleLinkTaskToGoal(goal.id)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-background border border-border text-foreground hover:border-accent/50 transition-colors"
                >
                  {goal.title}
                </button>
              ))}
              <button
                onClick={() => setAssigningTask(undefined)}
                className="w-full px-4 py-3 rounded-xl text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
