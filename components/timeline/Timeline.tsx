'use client';

import React, { useRef, useEffect } from 'react';
import { TimelineCard } from './TimelineCard';
import type { Move } from '@/lib/types';

interface TimelineProps {
  moves: Move[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

export function Timeline({ moves, currentMoveIndex, onMoveClick }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active move
  useEffect(() => {
    if (scrollRef.current) {
      const activeCard = scrollRef.current.children[currentMoveIndex] as HTMLElement;
      if (activeCard) {
        activeCard.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentMoveIndex]);

  if (moves.length === 0) {
    return (
      <div className="w-full h-24 flex items-center justify-center text-muted-foreground">
        No moves to display
      </div>
    );
  }

  return (
    <div className="w-full border-b bg-background">
      <div
        ref={scrollRef}
        className="flex gap-2 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
      >
        {moves.map((move, index) => (
          <TimelineCard
            key={move.id}
            move={move}
            isActive={index === currentMoveIndex}
            onClick={() => onMoveClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
