export default function GoalsPage() {
  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-8">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          Your Journey
        </p>
        <h1 className="text-3xl font-bold text-foreground">Goals</h1>
      </header>

      {/* Placeholder content */}
      <div className="rounded-2xl bg-surface border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="text-secondary text-xl">🏔️</span>
          </div>
          <div>
            <p className="text-foreground font-medium">Goal Arcs & Phases</p>
            <p className="text-muted text-sm">Your long-term quests will live here</p>
          </div>
        </div>
        <div className="h-px bg-border my-4" />
        <p className="text-muted text-sm">
          Plan your major life arcs and break them into phases.
        </p>
      </div>
    </div>
  );
}

