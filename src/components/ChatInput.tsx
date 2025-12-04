'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type a message..."}
          disabled={disabled}
          rows={1}
          className="
            w-full px-4 py-3 rounded-2xl
            bg-surface border border-border
            text-foreground placeholder:text-muted
            focus:outline-none focus:border-accent
            transition-colors resize-none
            disabled:opacity-50
            text-sm
          "
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="
          p-3 rounded-full
          bg-accent text-background
          hover:bg-accent-dim
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
          shrink-0
        "
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
      </button>
    </form>
  );
}

