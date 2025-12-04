'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, AssistantRequest, AssistantResponse } from '@/lib/assistant/types';
import { executeOperations, summarizeResults } from '@/lib/assistant';
import { getGoals, getTasks, getTodayMinutes, isBrowser } from '@/lib/data';
import { generateId, now } from '@/lib/data/storage';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';

export default function AssistantPage() {
  // ----- State -----
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationSummaries, setOperationSummaries] = useState<Map<string, string>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // ----- Auto-scroll to bottom -----
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ----- Add welcome message on first load -----
  useEffect(() => {
    if (!hasLoadedRef.current && isBrowser()) {
      hasLoadedRef.current = true;
      
      // Add a welcome message from the assistant
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "Hey! 👋 I'm your Life Assistant. I can help you organize your goals and tasks, plan your day, or just chat about your progress. What would you like to work on?",
        timestamp: now(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // ----- Build context for API -----
  const buildContext = useCallback((): AssistantRequest['context'] => {
    const goals = getGoals().map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      targetDate: g.targetDate,
      isActive: g.isActive,
    }));
    
    const tasks = getTasks().map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      status: t.status,
      goalArcId: t.goalArcId,
      description: t.description,
    }));
    
    const todayMinutes = getTodayMinutes();
    const tasksCompletedToday = getTasks().filter(
      t => t.completedAt && t.completedAt.startsWith(new Date().toISOString().split('T')[0])
    ).length;
    
    return {
      goals,
      tasks,
      todayStats: {
        focusMinutes: todayMinutes,
        tasksCompleted: tasksCompletedToday,
      },
    };
  }, []);

  // ----- Send message to assistant -----
  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setError(null);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Build conversation history (excluding the welcome message for API)
      const conversationHistory = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));
      
      // Build request
      const request: AssistantRequest = {
        message: content,
        conversationHistory,
        context: buildContext(),
      };
      
      // Call API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data: AssistantResponse = await response.json();
      
      // Execute any operations
      let summary: string | null = null;
      if (data.operations && data.operations.length > 0) {
        const results = executeOperations(data.operations);
        summary = summarizeResults(results);
      }
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.assistantMessage,
        timestamp: now(),
        operations: data.operations,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Store operation summary for this message
      if (summary) {
        setOperationSummaries(prev => new Map(prev).set(assistantMessage.id, summary));
      }
      
    } catch (err) {
      console.error('Assistant error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      
      // Add error message from assistant
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check that your OpenAI API key is configured and try again.",
        timestamp: now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Render -----
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-border shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Life Assistant</h1>
        <p className="text-sm text-muted mt-1">
          Ask me to organise goals, tasks, and today&apos;s plan.
        </p>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message) => (
            <ChatBubble 
              key={message.id} 
              message={message}
              operationSummary={operationSummaries.get(message.id)}
            />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Error display */}
          {error && !isLoading && (
            <div className="text-center py-2">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <ChatInput 
            onSend={handleSend}
            disabled={isLoading}
            placeholder="Ask me anything..."
          />
        </div>
      </div>
    </div>
  );
}
