import React from 'react';
import { Composition } from 'remotion';
import { ChessVideo } from './ChessVideo';
import type { ChessVideoProps } from '../lib/types';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ChessVideo"
        component={ChessVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          moves: [],
          memes: {},
          transitionAudios: {},
          fps: 30,
          width: 1080,
          height: 1920,
        } as ChessVideoProps}
      />
    </>
  );
};
