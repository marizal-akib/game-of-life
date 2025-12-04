'use client';

import { useState, useEffect } from 'react';
import type { GoalArc } from '@/lib/types';

interface GoalModalProps {
  isOpen: boolean;
  goal?: GoalArc; // If provided, we're editing; otherwise creating
  onClose: () => void;
  onSave: (data: { title: string; description: string; targetDate?: string }) => void;
  onDelete?: () => void;
}

export default function GoalModal({ isOpen, goal, onClose, onSave, onDelete }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  // Reset form when modal opens/closes or goal changes
  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setTargetDate(goal.targetDate?.split('T')[0] || '');
    } else {
      setTitle('');
      setDescription('');
      setTargetDate('');
    }
  }, [goal, isOpen]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      targetDate: targetDate || undefined,
    });
  };
  
  const isEditing = !!goal;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-2xl p-6 pb-8 animate-slide-up">
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? 'Edit Goal' : 'New Goal'}
          </h2>
          {isEditing && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-sm text-muted mb-2">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Learn Japanese"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>
          
          {/* Description input */}
          <div>
            <label className="block text-sm text-muted mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this goal about?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
          
          {/* Target date input */}
          <div>
            <label className="block text-sm text-muted mb-2">Target Date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3 rounded-xl bg-accent text-background font-medium hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}

