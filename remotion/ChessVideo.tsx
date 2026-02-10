import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import { Chessboard } from 'react-chessboard';
import type { ChessVideoProps } from '../lib/types';
import { MemeOverlay } from './MemeOverlay';

export const ChessVideo: React.FC<ChessVideoProps> = ({
  moves,
  memes,
  transitionAudios,
}) => {
  const { fps, width, height } = useVideoConfig();

  // Calculate board dimensions - use 90% of video width to fit nicely
  const boardSize = Math.floor(width * 0.9);
  const boardOffsetX = Math.floor((width - boardSize) / 2);
  const boardOffsetY = Math.floor((height - boardSize) / 2);

  // Calculate frame positions for all moves
  const moveSequences = useMemo(() => {
    let frame = 0;
    return moves.map((move) => {
      const durationInFrames = Math.round((move.duration_ms / 1000) * fps);
      const start = frame;
      frame += durationInFrames;
      return { move, start, durationInFrames };
    });
  }, [moves, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      {moveSequences.map(({ move, start, durationInFrames }) => {

        // Get transition audio (use move-specific or project default)
        const transitionAudioId = move.transition_audio_id;
        const transitionAudio = transitionAudioId ? transitionAudios[transitionAudioId] : null;

        return (
          <Sequence
            key={move.id}
            from={start}
            durationInFrames={durationInFrames}
          >
            {/* Transition audio */}
            {transitionAudio?.audioUrl && (
              <Audio
                src={transitionAudio.audioUrl}
                volume={0.8}
                startFrom={0}
              />
            )}

            {/* Chess board - positioned absolutely for precise control */}
            <AbsoluteFill>
              <div
                style={{
                  position: 'absolute',
                  left: boardOffsetX,
                  top: boardOffsetY,
                  width: boardSize,
                  height: boardSize,
                }}
              >
                <Chessboard
                  position={move.fen}
                  arePiecesDraggable={false}
                  boardWidth={boardSize}
                />
              </div>
            </AbsoluteFill>

            {/* Meme overlays */}
            {move.overlays?.map((overlay) => {
              const meme = memes[overlay.meme_id];
              if (!meme?.videoUrl) return null;

              return (
                <MemeOverlay
                  key={overlay.id}
                  overlay={overlay}
                  meme={meme}
                  fps={fps}
                  boardSize={boardSize}
                  boardOffsetX={boardOffsetX}
                  boardOffsetY={boardOffsetY}
                />
              );
            })}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
