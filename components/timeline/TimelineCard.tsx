'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Move } from '@/lib/types';

interface TimelineCardProps {
  move: Move;
  isActive: boolean;
  onClick: () => void;
}

export function TimelineCard({ move, isActive, onClick }: TimelineCardProps) {
  const hasMemes = (move.overlays?.length ?? 0) > 0;
  const hasCustomAudio = move.transition_audio_id !== null;

  return (
    <Card
      className={cn(
        'min-w-[120px] p-3 cursor-pointer transition-all hover:shadow-md',
        isActive && 'ring-2 ring-primary bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1">
        {/* Move number */}
        <div className="text-xs text-muted-foreground">
          Move {move.move_number}
        </div>

        {/* Move notation */}
        <div className="text-lg font-semibold">
          {move.notation}
        </div>

        {/* Duration */}
        <div className="text-xs text-muted-foreground">
          {(move.duration_ms / 1000).toFixed(1)}s
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mt-1">
          {hasMemes && (
            <div className="flex items-center gap-1 text-xs">
              <span>🎭</span>
              <span>{move.overlays?.length}</span>
            </div>
          )}
          {hasCustomAudio && (
            <div className="text-xs">
              <span>🎵</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
