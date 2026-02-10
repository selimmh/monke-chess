// Core data types matching database schema

export interface Project {
  id: string;
  title: string;
  pgn: string;
  default_move_duration_ms: number;
  default_transition_audio_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Move {
  id: string;
  project_id: string;
  move_number: number;
  notation: string;
  fen: string;
  duration_ms: number;
  transition_audio_id: string | null;
  created_at: string;
  overlays?: Overlay[];
}

export interface Overlay {
  id: string;
  move_id: string;
  square: string;
  meme_id: string;
  start_time_ms: number;
  scale: number;
  rotation: number;
  meme?: Meme;
}

export interface Meme {
  id: string;
  name: string;
  video_path: string;
  thumbnail_path: string;
  duration_ms: number;
  tags: string[];
  created_at: string;
  // Runtime properties (from Storage)
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface TransitionAudio {
  id: string;
  name: string;
  audio_path: string;
  duration_ms: number;
  tags: string[];
  is_default: boolean;
  created_at: string;
  // Runtime property
  audioUrl?: string;
}

export interface BackgroundMusic {
  id: string;
  name: string;
  audio_path: string;
  duration_ms: number;
  created_at: string;
  audioUrl?: string;
}

export interface VideoSettings {
  id: string;
  project_id: string;
  aspect_ratio: string;
  show_player_names: boolean;
  show_evaluation_bar: boolean;
  show_captured_pieces: boolean;
  intro_enabled: boolean;
  outro_enabled: boolean;
  background_music_id: string | null;
}

// UI State types

export interface TimelineMove {
  moveNumber: number;
  notation: string;
  duration: number;
  hasMemes: boolean;
  memeCount: number;
  hasCustomAudio: boolean;
  isActive: boolean;
}

export interface EditorState {
  currentMoveIndex: number;
  selectedSquare: string | null;
  isMemeModalOpen: boolean;
  isExporting: boolean;
}

// Remotion composition props

export interface ChessVideoProps {
  moves: Move[];
  memes: Record<string, Meme>;
  transitionAudios: Record<string, TransitionAudio>;
  fps: number;
  width: number;
  height: number;
}

// API response types

export interface RenderResponse {
  videoUrl: string;
  error?: string;
}

export interface UploadResponse {
  id: string;
  path: string;
  publicUrl: string;
}

// Form types

export interface CreateProjectInput {
  title: string;
  pgn: string;
  default_move_duration_ms?: number;
  default_transition_audio_id?: string | null;
}

export interface UpdateProjectInput {
  title?: string;
  pgn?: string;
  default_move_duration_ms?: number;
  default_transition_audio_id?: string | null;
}

export interface CreateMemeInput {
  name: string;
  video_path: string;
  thumbnail_path: string;
  duration_ms: number;
  tags: string[];
}

export interface CreateTransitionAudioInput {
  name: string;
  audio_path: string;
  duration_ms: number;
  tags: string[];
  is_default?: boolean;
}

export interface CreateOverlayInput {
  move_id: string;
  square: string;
  meme_id: string;
  start_time_ms?: number;
  scale?: number;
  rotation?: number;
}

// Utility types

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type ChessSquare = 
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8'
  | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7' | 'b8'
  | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'
  | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8'
  | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8'
  | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8'
  | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';

// Database table names for type safety
export const TABLES = {
  PROJECTS: 'projects',
  MOVES: 'moves',
  OVERLAYS: 'overlays',
  MEMES: 'memes',
  TRANSITION_AUDIO: 'transition_audio',
  BACKGROUND_MUSIC: 'background_music',
  VIDEO_SETTINGS: 'video_settings',
} as const;

// Storage bucket names
export const STORAGE_BUCKETS = {
  MAIN: 'chess-meme-generator',
} as const;

// Storage paths
export const STORAGE_PATHS = {
  MEMES_VIDEOS: 'memes/videos',
  MEMES_THUMBNAILS: 'memes/thumbnails',
  TRANSITION_AUDIO: 'transition-audio',
  BACKGROUND_MUSIC: 'background-music',
  RENDERS: 'renders',
} as const;
