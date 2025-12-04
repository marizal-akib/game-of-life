'use client';

import type { ChatMessage } from '@/lib/assistant/types';

interface ChatBubbleProps {
  message: ChatMessage;
  operationSummary?: string | null;
}

export default function ChatBubble({ message, operationSummary }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          max-w-[85%] rounded-2xl px-4 py-3
          ${isUser 
            ? 'bg-accent text-background rounded-br-md' 
            : 'bg-surface border border-border text-foreground rounded-bl-md'
          }
        `}
      >
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        
        {/* Operation summary (for assistant messages) */}
        {!isUser && operationSummary && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-accent flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {operationSummary}
            </p>
          </div>
        )}
        
        {/* Timestamp */}
        <p className={`text-[10px] mt-1 ${isUser ? 'text-background/60' : 'text-muted'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

