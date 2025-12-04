// ============================================
// Assistant API Route
// ============================================
// Handles chat messages and returns AI responses with operations.

import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/assistant/system-prompt';
import type { AssistantRequest, AssistantResponse, AssistantOperation } from '@/lib/assistant/types';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: AssistantRequest = await request.json();
    const { message, conversationHistory, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context message for the AI
    const contextMessage = buildContextMessage(context);

    // Build messages array for OpenAI
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'system' as const, content: contextMessage },
      // Include recent conversation history (last 10 messages)
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call OpenAI API
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective and capable
        messages,
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }, // Ensure JSON response
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get AI response', details: errorData },
        { status: openAIResponse.status }
      );
    }

    const openAIData = await openAIResponse.json();
    const assistantContent = openAIData.choices?.[0]?.message?.content;

    if (!assistantContent) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse and validate the AI response
    const parsedResponse = parseAndValidateResponse(assistantContent, context);

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build a context message describing current app state
 */
function buildContextMessage(context: AssistantRequest['context']): string {
  const { goals, tasks, todayStats } = context;

  let contextStr = '## Current App State\n\n';

  // Goals
  if (goals.length > 0) {
    contextStr += '### Goals:\n';
    goals.forEach(g => {
      contextStr += `- ID: "${g.id}" | Title: "${g.title}"`;
      if (g.description) contextStr += ` | Description: "${g.description}"`;
      if (g.targetDate) contextStr += ` | Target: ${g.targetDate}`;
      contextStr += ` | Active: ${g.isActive}\n`;
    });
  } else {
    contextStr += '### Goals: None yet\n';
  }

  contextStr += '\n';

  // Tasks
  if (tasks.length > 0) {
    contextStr += '### Tasks:\n';
    tasks.forEach(t => {
      contextStr += `- ID: "${t.id}" | Title: "${t.title}" | Type: ${t.type} | Status: ${t.status}`;
      if (t.goalArcId) contextStr += ` | Linked to goal: "${t.goalArcId}"`;
      contextStr += '\n';
    });
  } else {
    contextStr += '### Tasks: None yet\n';
  }

  // Today stats
  if (todayStats) {
    contextStr += `\n### Today's Progress:\n`;
    contextStr += `- Focus time: ${todayStats.focusMinutes} minutes\n`;
    contextStr += `- Tasks completed: ${todayStats.tasksCompleted}\n`;
  }

  return contextStr;
}

/**
 * Parse and validate the AI response
 */
function parseAndValidateResponse(
  content: string,
  context: AssistantRequest['context']
): AssistantResponse {
  try {
    const parsed = JSON.parse(content);

    // Validate structure
    if (typeof parsed.assistantMessage !== 'string') {
      throw new Error('Missing assistantMessage');
    }

    // Default to empty operations if not provided
    const operations: AssistantOperation[] = [];

    if (Array.isArray(parsed.operations)) {
      for (const op of parsed.operations) {
        const validated = validateOperation(op, context);
        if (validated) {
          operations.push(validated);
        }
      }
    }

    return {
      assistantMessage: parsed.assistantMessage,
      operations,
    };

  } catch (error) {
    console.error('Failed to parse AI response:', error, content);
    // Return a safe fallback
    return {
      assistantMessage: content.length > 500 
        ? "I apologize, but I encountered an issue processing that request. Could you try rephrasing?"
        : content,
      operations: [],
    };
  }
}

/**
 * Validate a single operation
 */
function validateOperation(
  op: unknown,
  context: AssistantRequest['context']
): AssistantOperation | null {
  if (!op || typeof op !== 'object' || !('type' in op) || !('payload' in op)) {
    return null;
  }

  const { type, payload } = op as { type: string; payload: unknown };

  // Validate based on operation type
  switch (type) {
    case 'CREATE_GOAL': {
      const p = payload as { title?: string; description?: string; targetDate?: string };
      if (!p.title || typeof p.title !== 'string') return null;
      return {
        type: 'CREATE_GOAL',
        payload: {
          title: p.title,
          description: p.description,
          targetDate: p.targetDate,
        },
      };
    }

    case 'UPDATE_GOAL': {
      const p = payload as { goalId?: string; title?: string; description?: string; targetDate?: string; isActive?: boolean };
      if (!p.goalId || !context.goals.find(g => g.id === p.goalId)) return null;
      return {
        type: 'UPDATE_GOAL',
        payload: {
          goalId: p.goalId,
          title: p.title,
          description: p.description,
          targetDate: p.targetDate,
          isActive: p.isActive,
        },
      };
    }

    case 'DELETE_GOAL': {
      const p = payload as { goalId?: string };
      if (!p.goalId || !context.goals.find(g => g.id === p.goalId)) return null;
      return {
        type: 'DELETE_GOAL',
        payload: { goalId: p.goalId },
      };
    }

    case 'CREATE_TASK': {
      const p = payload as { 
        title?: string; 
        description?: string; 
        type?: string; 
        status?: string; 
        goalArcId?: string;
        estimatedMinutes?: number;
        dueDate?: string;
      };
      if (!p.title || typeof p.title !== 'string') return null;
      
      // Validate goalArcId if provided
      if (p.goalArcId && !context.goals.find(g => g.id === p.goalArcId)) {
        p.goalArcId = undefined; // Ignore invalid goal reference
      }

      return {
        type: 'CREATE_TASK',
        payload: {
          title: p.title,
          description: p.description,
          type: validateTaskType(p.type),
          status: validateTaskStatus(p.status),
          goalArcId: p.goalArcId,
          estimatedMinutes: p.estimatedMinutes,
          dueDate: p.dueDate,
        },
      };
    }

    case 'UPDATE_TASK': {
      const p = payload as { 
        taskId?: string; 
        title?: string; 
        description?: string; 
        type?: string; 
        status?: string;
        estimatedMinutes?: number;
        dueDate?: string;
      };
      if (!p.taskId || !context.tasks.find(t => t.id === p.taskId)) return null;
      return {
        type: 'UPDATE_TASK',
        payload: {
          taskId: p.taskId,
          title: p.title,
          description: p.description,
          type: p.type ? validateTaskType(p.type) : undefined,
          status: p.status ? validateTaskStatus(p.status) : undefined,
          estimatedMinutes: p.estimatedMinutes,
          dueDate: p.dueDate,
        },
      };
    }

    case 'DELETE_TASK': {
      const p = payload as { taskId?: string };
      if (!p.taskId || !context.tasks.find(t => t.id === p.taskId)) return null;
      return {
        type: 'DELETE_TASK',
        payload: { taskId: p.taskId },
      };
    }

    case 'LINK_TASK_TO_GOAL': {
      const p = payload as { taskId?: string; goalArcId?: string | null };
      if (!p.taskId || !context.tasks.find(t => t.id === p.taskId)) return null;
      // Validate goal exists (unless unlinking with null)
      if (p.goalArcId !== null && p.goalArcId && !context.goals.find(g => g.id === p.goalArcId)) {
        return null;
      }
      return {
        type: 'LINK_TASK_TO_GOAL',
        payload: {
          taskId: p.taskId,
          goalArcId: p.goalArcId ?? null,
        },
      };
    }

    case 'SUGGEST_TODAY_TASKS': {
      const p = payload as { taskIds?: string[]; reason?: string };
      if (!Array.isArray(p.taskIds)) return null;
      // Filter to only valid task IDs
      const validTaskIds = p.taskIds.filter(id => context.tasks.find(t => t.id === id));
      if (validTaskIds.length === 0) return null;
      return {
        type: 'SUGGEST_TODAY_TASKS',
        payload: {
          taskIds: validTaskIds,
          reason: p.reason,
        },
      };
    }

    default:
      return null;
  }
}

function validateTaskType(type?: string): 'MAIN' | 'SIDE' | 'DAILY' | 'MAINTENANCE' | undefined {
  const valid = ['MAIN', 'SIDE', 'DAILY', 'MAINTENANCE'];
  return valid.includes(type || '') ? (type as 'MAIN' | 'SIDE' | 'DAILY' | 'MAINTENANCE') : undefined;
}

function validateTaskStatus(status?: string): 'BACKLOG' | 'PLANNED' | 'IN_PROGRESS' | 'DONE' | undefined {
  const valid = ['BACKLOG', 'PLANNED', 'IN_PROGRESS', 'DONE'];
  return valid.includes(status || '') ? (status as 'BACKLOG' | 'PLANNED' | 'IN_PROGRESS' | 'DONE') : undefined;
}

