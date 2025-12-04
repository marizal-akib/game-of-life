'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task, Session, GoalArc, AvatarState } from '@/lib/types';
import { 
  getActiveTasks,
  getTasks,
  getGoals,
  getActiveSession,
  getTodayMinutes,
  getTodaySessions,
  startSession,
  endActiveSession,
  endTaskSession,
  addOrUpdateTask,
  createTask,
  isBrowser,
} from '@/lib/data';
import { getAvatarState } from '@/lib/avatar';
import TaskCard from '@/components/TaskCard';
import Avatar from '@/components/Avatar';
import TodaySummary from '@/components/TodaySummary';
import AddTaskModal from '@/components/AddTaskModal';

export default function TodayPage() {
  // ----- State -----
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<GoalArc[]>([]);
  const [activeSession, setActiveSession] = useState<Session | undefined>();
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0);
  const [avatarState, setAvatarState] = useState<AvatarState>('IDLE');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ----- Data Loading -----
  const loadData = useCallback(() => {
    if (!isBrowser()) return;
    
    const activeTasks = getActiveTasks();
    const allGoals = getGoals();
    const active = getActiveSession();
    const minutes = getTodayMinutes();
    const todaySessions = getTodaySessions();
    
    // Count tasks completed today (have completedAt timestamp from today)
    const today = new Date().toISOString().split('T')[0];
    const allTasks = getTasks();
    const completedToday = allTasks.filter(
      t => t.completedAt && t.completedAt.startsWith(today)
    ).length;
    
    setTasks(activeTasks);
    setGoals(allGoals);
    setActiveSession(active);
    setTodayMinutes(minutes);
    setTasksCompletedToday(completedToday);
    setAvatarState(getAvatarState(active));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
    
    // Update minutes counter every minute for active sessions
    const interval = setInterval(() => {
      if (getActiveSession()) {
        setTodayMinutes(getTodayMinutes());
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [loadData]);

  // ----- Actions -----
  
  /**
   * Start working on a task
   * - Ends any currently active session
   * - Sets previous task back to PLANNED
   * - Starts new session for this task
   * - Sets task to IN_PROGRESS
   */
  const handleStart = (task: Task) => {
    // End any existing active session
    const currentActive = getActiveSession();
    if (currentActive) {
      endActiveSession();
      // Set that task back to PLANNED (if not done)
      const previousTask = tasks.find(t => t.id === currentActive.taskId);
      if (previousTask && previousTask.status === 'IN_PROGRESS') {
        addOrUpdateTask({ ...previousTask, status: 'PLANNED' });
      }
    }
    
    // Start new session
    startSession(task.id);
    
    // Update task status
    addOrUpdateTask({ ...task, status: 'IN_PROGRESS' });
    
    // Reload data
    loadData();
  };
  
  /**
   * Pause the current task
   * - Ends the session
   * - Sets task back to PLANNED
   */
  const handlePause = (task: Task) => {
    endTaskSession(task.id);
    addOrUpdateTask({ ...task, status: 'PLANNED' });
    loadData();
  };
  
  /**
   * Complete a task
   * - Ends the session if active
   * - Sets task to DONE
   */
  const handleDone = (task: Task) => {
    // End session if this task has one active
    const active = getActiveSession();
    if (active && active.taskId === task.id) {
      endActiveSession();
    }
    
    // Mark task as done
    addOrUpdateTask({ ...task, status: 'DONE' });
    loadData();
  };
  
  /**
   * Add a new task
   */
  const handleAddTask = (title: string, type: Task['type'], goalArcId?: string) => {
    createTask(title, type, goalArcId);
    loadData();
  };

  // ----- Render -----
  
  // Sort tasks: IN_PROGRESS first, then PLANNED, then BACKLOG
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = { IN_PROGRESS: 0, PLANNED: 1, BACKLOG: 2, DONE: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        </p>
        <h1 className="text-3xl font-bold text-foreground">Today</h1>
      </header>

      {/* Avatar status */}
      <Avatar state={avatarState} className="mb-6" />
      
      {/* Today summary */}
      <TodaySummary 
        totalMinutes={todayMinutes} 
        tasksCompleted={tasksCompletedToday} 
      />
      
      {/* Tasks section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-accent text-background hover:bg-accent-dim transition-colors active:scale-95"
          >
            + Add
          </button>
        </div>
        
        {/* Task list */}
        {!isLoaded ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : sortedTasks.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-6 text-center">
            <p className="text-muted mb-4">No active tasks yet.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-accent font-medium hover:underline"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={activeSession?.taskId === task.id}
                onStart={() => handleStart(task)}
                onPause={() => handlePause(task)}
                onDone={() => handleDone(task)}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Add task modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
        goals={goals}
      />
    </div>
  );
}
