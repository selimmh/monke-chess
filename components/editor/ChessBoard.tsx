'use client';

import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'react-chessboard/dist/chessboard/types';

interface ChessBoardProps {
  position: string;
  onSquareClick: (square: string) => void;
}

export function ChessBoard({ position, onSquareClick }: ChessBoardProps) {
  const handleSquareClick = (square: Square) => {
    onSquareClick(square);
  };

  return (
    <div className="w-full max-w-2xl aspect-square">
      <Chessboard
        position={position}
        onSquareClick={handleSquareClick}
        arePiecesDraggable={false}
        boardWidth={600}
      />
    </div>
  );
}
