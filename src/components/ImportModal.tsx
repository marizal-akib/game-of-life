'use client';

import { useState } from 'react';
import type { AssistantOperation } from '@/lib/assistant/types';
import { executeImportOperations } from '@/lib/assistant/import-executor';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type ImportStep = 'input' | 'preview' | 'complete';

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [step, setStep] = useState<ImportStep>('input');
  const [rawData, setRawData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [operations, setOperations] = useState<AssistantOperation[]>([]);
  const [result, setResult] = useState<{ goalsCreated: number; tasksCreated: number } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('input');
    setRawData('');
    setError(null);
    setSummary('');
    setOperations([]);
    setResult(null);
    onClose();
  };

  const handleParse = async () => {
    if (!rawData.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to parse data');
      }
      
      const data = await response.json();
      setSummary(data.summary);
      setOperations(data.operations);
      setStep('preview');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    const importResult = executeImportOperations(operations);
    setResult(importResult);
    setStep('complete');
    onImportComplete();
  };

  // Count operations by type
  const goalCount = operations.filter(op => op.type === 'CREATE_GOAL').length;
  const taskCount = operations.filter(op => op.type === 'CREATE_TASK').length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-surface border-t sm:border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4 sm:hidden" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Import Data</h2>
              <p className="text-sm text-muted mt-1">
                {step === 'input' && 'Paste your raw data and AI will organize it'}
                {step === 'preview' && 'Review what will be created'}
                {step === 'complete' && 'Import complete!'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-2">
                  Paste your notes, lists, or brain dump here:
                </label>
                <textarea
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder={`Example:\n\nLearn guitar this year\n- Buy a guitar\n- Find YouTube tutorials\n- Practice 20min daily\n\nAlso need to:\n- Renew passport by June\n- Call dentist for checkup`}
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors resize-none text-sm"
                />
              </div>
              
              {error && (
                <p className="text-sm text-error">{error}</p>
              )}
              
              {/* Format guide */}
              <details className="group">
                <summary className="text-sm text-accent cursor-pointer hover:underline">
                  📋 Format tips (click to expand)
                </summary>
                <div className="mt-3 p-4 rounded-xl bg-background/50 text-sm text-muted space-y-2">
                  <p><strong className="text-foreground">The AI understands:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Goals/projects with their related tasks</li>
                    <li>Dates like "by March" or "2025-06-15"</li>
                    <li>Time estimates like "20min" or "2 hours"</li>
                    <li>Task types: daily habits, maintenance, main work</li>
                    <li>Bullet points, numbered lists, or plain text</li>
                  </ul>
                  <p className="mt-3"><strong className="text-foreground">Example formats:</strong></p>
                  <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto mt-2">{`Goal: Learn Spanish
- Download Duolingo
- Practice 15min daily
- Find tutor by March

---

Random tasks:
• Clean room (30min)
• Buy groceries
• Call mom`}</pre>
                </div>
              </details>
            </div>
          )}
          
          {/* Step: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                <p className="text-sm text-foreground">{summary}</p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-background border border-border text-center">
                  <p className="text-2xl font-bold text-accent">{goalCount}</p>
                  <p className="text-xs text-muted">Goal{goalCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border text-center">
                  <p className="text-2xl font-bold text-secondary">{taskCount}</p>
                  <p className="text-xs text-muted">Task{taskCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              {/* Operation list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {operations.map((op, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-background border border-border text-sm"
                  >
                    {op.type === 'CREATE_GOAL' && (
                      <div className="flex items-center gap-2">
                        <span className="text-accent">🎯</span>
                        <span className="text-foreground font-medium">{op.payload.title}</span>
                        <span className="text-xs text-muted">Goal</span>
                      </div>
                    )}
                    {op.type === 'CREATE_TASK' && (
                      <div className="flex items-center gap-2">
                        <span className="text-secondary">✓</span>
                        <span className="text-foreground">{op.payload.title}</span>
                        <span className="text-xs text-muted">{op.payload.type || 'Task'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step: Complete */}
          {step === 'complete' && result && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Import Complete!</h3>
              <p className="text-muted">
                Created {result.goalsCreated} goal{result.goalsCreated !== 1 ? 's' : ''} and {result.tasksCreated} task{result.tasksCreated !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          {step === 'input' && (
            <button
              onClick={handleParse}
              disabled={!rawData.trim() || isProcessing}
              className="w-full py-3 rounded-xl bg-accent text-background font-medium hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Parse with AI'
              )}
            </button>
          )}
          
          {step === 'preview' && (
            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={operations.length === 0}
                className="flex-1 py-3 rounded-xl bg-accent text-background font-medium hover:bg-accent-dim transition-colors disabled:opacity-50"
              >
                Import {goalCount + taskCount} items
              </button>
            </div>
          )}
          
          {step === 'complete' && (
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-accent text-background font-medium hover:bg-accent-dim transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

