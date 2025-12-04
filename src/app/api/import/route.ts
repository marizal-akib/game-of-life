// ============================================
// Import Data API Route
// ============================================
// Parses raw text input and converts it to structured goals/tasks.

import { NextRequest, NextResponse } from 'next/server';
import { IMPORT_SYSTEM_PROMPT } from '@/lib/assistant/import-prompt';
import type { AssistantOperation } from '@/lib/assistant/types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ImportResponse {
  summary: string;
  operations: AssistantOperation[];
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { rawData } = body;

    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
      return NextResponse.json(
        { error: 'Raw data is required' },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: IMPORT_SYSTEM_PROMPT },
          { role: 'user', content: `Parse and organize this data:\n\n${rawData}` },
        ],
        temperature: 0.5, // Lower temperature for more consistent parsing
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to parse data', details: errorData },
        { status: openAIResponse.status }
      );
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse response
    const parsed = parseImportResponse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseImportResponse(content: string): ImportResponse {
  try {
    const parsed = JSON.parse(content);
    
    return {
      summary: parsed.summary || 'Data processed',
      operations: Array.isArray(parsed.operations) 
        ? parsed.operations.filter(validateOperation)
        : [],
    };
  } catch {
    console.error('Failed to parse import response:', content);
    return {
      summary: 'Failed to parse data',
      operations: [],
    };
  }
}

function validateOperation(op: unknown): op is AssistantOperation {
  if (!op || typeof op !== 'object') return false;
  const { type, payload } = op as { type?: string; payload?: unknown };
  
  if (type === 'CREATE_GOAL') {
    const p = payload as { title?: string };
    return !!p?.title;
  }
  
  if (type === 'CREATE_TASK') {
    const p = payload as { title?: string };
    return !!p?.title;
  }
  
  return false;
}

