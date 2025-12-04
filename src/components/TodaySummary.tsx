'use client';

interface TodaySummaryProps {
  totalMinutes: number;
  tasksCompleted: number;
}

export default function TodaySummary({ totalMinutes, tasksCompleted }: TodaySummaryProps) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  const timeDisplay = hours > 0 
    ? `${hours}h ${mins}m`
    : `${mins}m`;
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Focus time card */}
      <div className="rounded-xl bg-surface border border-border p-4">
        <p className="text-xs text-muted uppercase tracking-wider mb-1">Focus Time</p>
        <p className="text-2xl font-bold text-accent">{timeDisplay}</p>
      </div>
      
      {/* Completed tasks card */}
      <div className="rounded-xl bg-surface border border-border p-4">
        <p className="text-xs text-muted uppercase tracking-wider mb-1">Completed</p>
        <p className="text-2xl font-bold text-success">{tasksCompleted}</p>
      </div>
    </div>
  );
}

