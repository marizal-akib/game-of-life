export default function AssistantPage() {
  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          AI Helper
        </p>
        <h1 className="text-3xl font-bold text-foreground">Assistant</h1>
      </header>

      {/* Coming soon placeholder */}
      <div className="rounded-2xl bg-surface border border-border p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h2>
        <p className="text-muted mb-6">
          Your AI companion will help you plan tasks, review progress, and stay motivated.
        </p>
        
        {/* Feature preview */}
        <div className="text-left space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
            <span className="text-lg">💬</span>
            <div>
              <p className="text-foreground font-medium text-sm">Chat Planning</p>
              <p className="text-muted text-xs">Break down goals into actionable tasks</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-foreground font-medium text-sm">Progress Insights</p>
              <p className="text-muted text-xs">Get personalized feedback on your productivity</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-foreground font-medium text-sm">Smart Suggestions</p>
              <p className="text-muted text-xs">Recommendations based on your patterns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
