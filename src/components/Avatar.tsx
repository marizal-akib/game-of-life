'use client';

import type { AvatarState } from '@/lib/types';
import { getAvatarEmoji, getAvatarMessage } from '@/lib/avatar';

interface AvatarProps {
  state: AvatarState;
  className?: string;
}

const STATE_COLORS: Record<AvatarState, string> = {
  IDLE: 'from-secondary/20 to-secondary/5 border-secondary/30',
  WORKING: 'from-accent/20 to-accent/5 border-accent/30',
  RESTING: 'from-muted/20 to-muted/5 border-muted/30',
};

const STATE_GLOW: Record<AvatarState, string> = {
  IDLE: '',
  WORKING: 'shadow-lg shadow-accent/20 animate-pulse',
  RESTING: '',
};

export default function Avatar({ state, className = '' }: AvatarProps) {
  const emoji = getAvatarEmoji(state);
  const message = getAvatarMessage(state);
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Avatar circle */}
      <div 
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          bg-gradient-to-b border
          transition-all duration-500
          ${STATE_COLORS[state]}
          ${STATE_GLOW[state]}
        `}
      >
        <span className="text-3xl">{emoji}</span>
      </div>
      
      {/* Status text */}
      <div>
        <p className="text-sm text-muted uppercase tracking-wider">Status</p>
        <p className="text-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}

