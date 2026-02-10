'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Move } from '@/lib/types';

interface MoveControlsProps {
  currentMove: Move;
  currentMoveIndex: number;
  totalMoves: number;
  onPrevious: () => void;
  onNext: () => void;
  onDurationChange: (durationMs: number) => void;
}

export function MoveControls({
  currentMove,
  currentMoveIndex,
  totalMoves,
  onPrevious,
  onNext,
  onDurationChange,
}: MoveControlsProps) {
  const durationInSeconds = currentMove.duration_ms / 1000;

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseFloat(e.target.value);
    if (!isNaN(seconds) && seconds > 0) {
      onDurationChange(seconds * 1000);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Move {currentMove.move_number}: {currentMove.notation}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentMoveIndex + 1} of {totalMoves}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          onClick={onPrevious}
          disabled={currentMoveIndex === 0}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={currentMoveIndex >= totalMoves - 1}
          variant="outline"
          size="sm"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="duration">Duration (seconds)</Label>
        <Input
          id="duration"
          type="number"
          step="0.1"
          min="0.1"
          value={durationInSeconds}
          onChange={handleDurationChange}
          className="mt-1"
        />
      </div>
    </div>
  );
}
