export default function TodayPage() {
  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-8">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        </p>
        <h1 className="text-3xl font-bold text-foreground">Today</h1>
      </header>

      {/* Placeholder content */}
      <div className="rounded-2xl bg-surface border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xl">☀️</span>
          </div>
          <div>
            <p className="text-foreground font-medium">Ready to start your day?</p>
            <p className="text-muted text-sm">Your tasks will appear here</p>
          </div>
        </div>
        <div className="h-px bg-border my-4" />
        <p className="text-muted text-sm">
          Phase 0 complete — data layer coming in Phase 1.
        </p>
      </div>
    </div>
  );
}

