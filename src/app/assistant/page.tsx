export default function AssistantPage() {
  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-8">
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
          AI Helper
        </p>
        <h1 className="text-3xl font-bold text-foreground">Assistant</h1>
      </header>

      {/* Placeholder content */}
      <div className="rounded-2xl bg-surface border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <p className="text-foreground font-medium">Your AI Companion</p>
            <p className="text-muted text-sm">Get help planning and reflecting</p>
          </div>
        </div>
        <div className="h-px bg-border my-4" />
        <p className="text-muted text-sm">
          Chat with your assistant to plan tasks, review progress, and get motivated.
        </p>
      </div>
    </div>
  );
}

