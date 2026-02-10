import { Chess } from 'chess.js';
import type { Move } from './types';

export interface ParsedMove {
  project_id: string;
  move_number: number;
  notation: string;
  fen: string;
  duration_ms: number;
  transition_audio_id: string | null;
}

/**
 * Parse a PGN string and extract all moves with their FEN positions
 */
export function parsePGN(pgn: string): ParsedMove[] {
  const chess = new Chess();
  
  try {
    chess.loadPgn(pgn);
  } catch (error) {
    throw new Error(`Invalid PGN format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Reset to starting position
  chess.reset();
  chess.loadPgn(pgn);
  
  const history = chess.history({ verbose: true });
  
  if (history.length === 0) {
    throw new Error('PGN contains no moves');
  }

  const moves: ParsedMove[] = history.map((move, index) => ({
    project_id: '', // Will be set when creating in database
    move_number: index + 1,
    notation: move.san,
    fen: move.after,
    duration_ms: 2000, // Default 2 seconds
    transition_audio_id: null, // Will inherit project default
  }));

  return moves;
}

/**
 * Validate a PGN string without parsing all moves
 */
export function validatePGN(pgn: string): { valid: boolean; error?: string } {
  const chess = new Chess();
  
  try {
    chess.loadPgn(pgn);
    const history = chess.history();
    
    if (history.length === 0) {
      return { valid: false, error: 'PGN contains no moves' };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid PGN format' 
    };
  }
}

/**
 * Get FEN position for a specific move number
 */
export function getFENAtMove(pgn: string, moveNumber: number): string | null {
  const chess = new Chess();
  
  try {
    chess.loadPgn(pgn);
    chess.reset();
    chess.loadPgn(pgn);
    
    const history = chess.history({ verbose: true });
    
    if (moveNumber < 1 || moveNumber > history.length) {
      return null;
    }
    
    return history[moveNumber - 1].after;
  } catch {
    return null;
  }
}

/**
 * Get starting FEN position (before any moves)
 */
export function getStartingFEN(): string {
  return new Chess().fen();
}

/**
 * Calculate total video duration in milliseconds
 */
export function calculateTotalDuration(moves: Move[]): number {
  return moves.reduce((total, move) => total + move.duration_ms, 0);
}

/**
 * Format duration from milliseconds to MM:SS format
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Convert move number to display format (e.g., 1, 2, 3)
 */
export function formatMoveNumber(moveNumber: number): string {
  return moveNumber.toString();
}

/**
 * Get square position in pixel coordinates for video rendering
 * Assumes board is centered and takes up 80% of viewport height
 */
export function getSquarePosition(
  square: string,
  boardSize: number = 1920 * 0.8
): { x: number; y: number; size: number } {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = 8 - parseInt(square[1]); // 8=0, 1=7

  const squareSize = boardSize / 8;
  const boardOffset = (1920 - boardSize) / 2;

  return {
    x: boardOffset + (file * squareSize),
    y: boardOffset + (rank * squareSize),
    size: squareSize,
  };
}

/**
 * Validate chess square notation
 */
export function isValidSquare(square: string): boolean {
  const regex = /^[a-h][1-8]$/;
  return regex.test(square);
}

/**
 * Extract game metadata from PGN headers
 */
export interface PGNMetadata {
  event?: string;
  site?: string;
  date?: string;
  white?: string;
  black?: string;
  result?: string;
}

export function extractPGNMetadata(pgn: string): PGNMetadata {
  const metadata: PGNMetadata = {};
  
  const lines = pgn.split('\n');
  
  for (const line of lines) {
    const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
    if (match) {
      const [, key, value] = match;
      const lowerKey = key.toLowerCase();
      
      if (lowerKey === 'event') metadata.event = value;
      else if (lowerKey === 'site') metadata.site = value;
      else if (lowerKey === 'date') metadata.date = value;
      else if (lowerKey === 'white') metadata.white = value;
      else if (lowerKey === 'black') metadata.black = value;
      else if (lowerKey === 'result') metadata.result = value;
    }
  }
  
  return metadata;
}

/**
 * Generate a default project title from PGN metadata
 */
export function generateProjectTitle(pgn: string): string {
  const metadata = extractPGNMetadata(pgn);
  
  if (metadata.white && metadata.black) {
    return `${metadata.white} vs ${metadata.black}`;
  }
  
  if (metadata.event) {
    return metadata.event;
  }
  
  return `Chess Game ${new Date().toLocaleDateString()}`;
}

/**
 * Trim PGN to a specific number of moves (useful for testing/previews)
 */
export function trimPGN(pgn: string, maxMoves: number): string {
  const chess = new Chess();
  
  try {
    chess.loadPgn(pgn);
    chess.reset();
    
    const history = chess.history();
    const trimmedMoves = history.slice(0, maxMoves);
    
    // Rebuild PGN with trimmed moves
    chess.reset();
    for (const move of trimmedMoves) {
      chess.move(move);
    }
    
    return chess.pgn();
  } catch {
    return pgn;
  }
}
