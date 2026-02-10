'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import type { Overlay } from '@/lib/types';

interface OverlayListProps {
  overlays: Overlay[];
  onRemoveOverlay: (overlayId: string) => void;
}

export function OverlayList({ overlays, onRemoveOverlay }: OverlayListProps) {
  if (overlays.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center border rounded-lg">
        No memes assigned to this move. Click a square to add one.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Assigned Memes</h4>
      {overlays.map((overlay) => (
        <Card key={overlay.id} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm">
                {overlay.meme?.name || 'Unnamed Meme'}
              </div>
              <div className="text-xs text-muted-foreground">
                Square: {overlay.square.toUpperCase()}
                {' · '}
                Duration: {((overlay.meme?.duration_ms || 0) / 1000).toFixed(1)}s
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveOverlay(overlay.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
