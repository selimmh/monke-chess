-- Monke Chess Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  pgn TEXT NOT NULL,
  default_move_duration_ms INTEGER DEFAULT 2000,
  default_transition_audio_id UUID REFERENCES transition_audio(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transition audio table (must be created before projects due to FK)
CREATE TABLE transition_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to projects after transition_audio is created
ALTER TABLE projects 
  ADD CONSTRAINT fk_default_transition_audio 
  FOREIGN KEY (default_transition_audio_id) 
  REFERENCES transition_audio(id);

-- Moves table
CREATE TABLE moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  notation TEXT NOT NULL,
  fen TEXT NOT NULL,
  duration_ms INTEGER DEFAULT 2000,
  transition_audio_id UUID REFERENCES transition_audio(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memes table (video clips with embedded audio)
CREATE TABLE memes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  video_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Overlays table (memes assigned to squares)
CREATE TABLE overlays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  move_id UUID REFERENCES moves(id) ON DELETE CASCADE,
  square TEXT NOT NULL,
  meme_id UUID REFERENCES memes(id),
  start_time_ms INTEGER DEFAULT 0,
  scale FLOAT DEFAULT 1.0,
  rotation INTEGER DEFAULT 0
);

-- Optional: Background music (v2+)
CREATE TABLE background_music (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Video settings (v2+)
CREATE TABLE video_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  aspect_ratio TEXT DEFAULT '9:16',
  show_player_names BOOLEAN DEFAULT FALSE,
  show_evaluation_bar BOOLEAN DEFAULT FALSE,
  show_captured_pieces BOOLEAN DEFAULT FALSE,
  intro_enabled BOOLEAN DEFAULT FALSE,
  outro_enabled BOOLEAN DEFAULT FALSE,
  background_music_id UUID REFERENCES background_music(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_moves_project_id ON moves(project_id);
CREATE INDEX idx_moves_move_number ON moves(move_number);
CREATE INDEX idx_overlays_move_id ON overlays(move_id);
CREATE INDEX idx_overlays_meme_id ON overlays(meme_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to projects
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Storage Buckets (create these in Supabase Storage UI):
-- 1. chess-meme-generator (public bucket)
--    Folders:
--    - memes/videos/
--    - memes/thumbnails/
--    - transition-audio/
--    - background-music/
--    - renders/{project-id}/
