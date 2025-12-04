export default function HistoryPage() {
  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-8">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          Your Progress
        </p>
        <h1 className="text-3xl font-bold text-foreground">History</h1>
      </header>

      {/* Placeholder content */}
      <div className="rounded-2xl bg-surface border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <span className="text-success text-xl">📊</span>
          </div>
          <div>
            <p className="text-foreground font-medium">Activity Log</p>
            <p className="text-muted text-sm">Track your completed sessions</p>
          </div>
        </div>
        <div className="h-px bg-border my-4" />
        <p className="text-muted text-sm">
          Review past sessions, stats, and achievements.
        </p>
      </div>
    </div>
  );
}

