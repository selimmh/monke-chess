import React from 'react';
import { AbsoluteFill, Sequence, Video } from 'remotion';
import type { Overlay, Meme } from '../lib/types';

interface MemeOverlayProps {
  overlay: Overlay;
  meme: Meme;
  fps: number;
  boardSize: number;
  boardOffsetX: number;
  boardOffsetY: number;
}

export const MemeOverlay: React.FC<MemeOverlayProps> = ({
  overlay,
  meme,
  fps,
  boardSize,
  boardOffsetX,
  boardOffsetY,
}) => {
  const overlayStart = Math.round((overlay.start_time_ms / 1000) * fps);
  const overlayDuration = Math.round((meme.duration_ms / 1000) * fps);

  // Calculate position based on chess square notation (e.g., "e4")
  // Files are a-h (0-7), ranks are 1-8 (displayed as 8-1 from top to bottom)
  const file = overlay.square.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
  const rank = 8 - parseInt(overlay.square[1]); // 8=0, 7=1, ..., 1=7
  
  const squareSize = boardSize / 8;
  const x = boardOffsetX + (file * squareSize);
  const y = boardOffsetY + (rank * squareSize);

  return (
    <Sequence
      from={overlayStart}
      durationInFrames={overlayDuration}
    >
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: squareSize,
            height: squareSize,
            transform: `scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          <Video
            src={meme.videoUrl!}
            volume={1.0}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
