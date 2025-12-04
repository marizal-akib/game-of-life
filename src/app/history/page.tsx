'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DaySummary } from '@/lib/types';
import { getSessionsByDay, isBrowser } from '@/lib/data';

export default function HistoryPage() {
  // ----- State -----
  const [daySummaries, setDaySummaries] = useState<DaySummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ----- Data Loading -----
  const loadData = useCallback(() => {
    if (!isBrowser()) return;
    
    setDaySummaries(getSessionsByDay());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ----- Helpers -----
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today or yesterday
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
    });
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  // ----- Calculated Stats -----
  const totalMinutes = daySummaries.reduce((sum, day) => sum + day.totalMinutes, 0);
  const totalSessions = daySummaries.reduce((sum, day) => sum + day.sessions.length, 0);
  const totalDays = daySummaries.length;

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          Your Progress
        </p>
        <h1 className="text-3xl font-bold text-foreground">History</h1>
      </header>

      {/* Summary stats */}
      {isLoaded && daySummaries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl bg-surface border border-border p-3 text-center">
            <p className="text-2xl font-bold text-accent">{formatDuration(totalMinutes)}</p>
            <p className="text-xs text-muted mt-1">Total Focus</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-3 text-center">
            <p className="text-2xl font-bold text-secondary">{totalSessions}</p>
            <p className="text-xs text-muted mt-1">Sessions</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-3 text-center">
            <p className="text-2xl font-bold text-success">{totalDays}</p>
            <p className="text-xs text-muted mt-1">Active Days</p>
          </div>
        </div>
      )}

      {/* Day-by-day list */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Activity Log</h2>
        
        {!isLoaded ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : daySummaries.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-foreground font-medium mb-2">No activity yet</p>
            <p className="text-muted text-sm">
              Start a session on the Today tab to begin tracking your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {daySummaries.map((day) => (
              <DayCard 
                key={day.date} 
                day={day} 
                formatDate={formatDate}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ----- Day Card Component -----
interface DayCardProps {
  day: DaySummary;
  formatDate: (date: string) => string;
  formatDuration: (minutes: number) => string;
}

function DayCard({ day, formatDate, formatDuration }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      {/* Main row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Date */}
          <div>
            <p className="font-medium text-foreground">{formatDate(day.date)}</p>
            <p className="text-xs text-muted">{day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-accent">{formatDuration(day.totalMinutes)}</p>
            <p className="text-xs text-muted">{day.tasksCompleted} done</p>
          </div>
          
          {/* Expand icon */}
          <svg 
            className={`w-5 h-5 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>
      
      {/* Expanded session details */}
      {isExpanded && day.sessions.length > 0 && (
        <div className="border-t border-border px-4 py-3 bg-background/50">
          <div className="space-y-2">
            {day.sessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted">
                  {new Date(session.startedAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
                <span className="text-foreground">
                  {session.durationMinutes ? formatDuration(session.durationMinutes) : 'In progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
