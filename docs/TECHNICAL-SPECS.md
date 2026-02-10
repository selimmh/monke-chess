# Monke Chess - Technical Specification

## Project Overview

A personal web-based tool to transform chess games into engaging, meme-enhanced videos for YouTube Shorts and other platforms. Features a timeline-based editing workflow where users can assign meme overlays to specific squares and customize transition audio for each move.

**Target User**: Solo creator making chess content  
**Primary Output**: Short-form vertical videos (YouTube Shorts, TikTok, Instagram Reels)  
**Development Timeline**: 1-2 weeks for MVP

---

## Tech Stack

| Category         | Technology               | Purpose                             |
| ---------------- | ------------------------ | ----------------------------------- |
| Framework        | Next.js 16+ (App Router) | React-based web application         |
| Language         | TypeScript               | Type-safe development               |
| Styling          | Tailwind CSS + shadcn/ui | Component library and styling       |
| Database         | Supabase (PostgreSQL)    | Data persistence                    |
| Storage          | Supabase Storage         | Media file hosting                  |
| Hosting          | Vercel                   | Deployment and serverless functions |
| Video Generation | Remotion                 | React-based video composition       |
| Chess Logic      | chess.js                 | Move validation and game state      |
| Board UI         | react-chessboard         | Interactive chess board component   |
| State Management | Zustand                  | Lightweight React state management  |
| Authentication   | None                     | Single-user application             |

---

## Core Features

### 1. Game Input & Parsing

**Functionality**:

- Import chess games via copy-paste PGN text or file upload
- Parse and validate PGN using chess.js
- Support full games or partial sequences (typical: ~15 moves)
- Extract move notation and FEN positions for each move

**User Flow**:

1. User clicks "New Project"
2. Pastes PGN or uploads .pgn file
3. System parses game and creates move sequence
4. User lands in editor with timeline populated

---

### 2. Timeline-Based Editor

**Timeline Component**:

- Horizontal scrollable view showing all moves in sequence
- Each move displayed as a card containing:
  - Move number (1, 2, 3...)
  - Move notation (e4, Nf3, Bb5)
  - Duration in seconds
  - Visual indicators:
    - 🎭 with count if memes assigned
    - 🎵 if custom transition audio assigned
- Active move highlighted
- Click any move to jump to it

**Purpose**: Provides overview of entire video structure at a glance

---

### 3. Move Editor (Per-Move Editing)

**Layout**:

```
┌─────────────────────────────────────────────────┐
│  Timeline (all moves)                           │
├──────────────────────┬──────────────────────────┤
│  Chess Board         │  Meme Gallery            │
│  (interactive)       │  (thumbnails)            │
│                      │                          │
├──────────────────────┼──────────────────────────┤
│  Move Controls       │  Transition Audio        │
│  - Duration          │  (dropdown selector)     │
│  - Nav buttons       │                          │
│  - Overlay list      │                          │
└──────────────────────┴──────────────────────────┘
```

**Interactions**:

- Click square on board → Opens meme selection modal
- Select meme → Assigns to that square for current move
- Multiple memes can be assigned to different squares in same move
- Adjust move duration (default: 2 seconds)
- Override transition audio for this move
- Remove/edit existing overlays

---

### 4. Media Library System

#### Meme Library

- **Format**: Video files with embedded audio (MP4, WebM)
- **Typical Duration**: 2-5 seconds per clip
- **Expected Size**: ~50 clips
- **Storage**: Supabase Storage (`memes/videos/`, `memes/thumbnails/`)
- **Metadata**: Name, tags (emotions: shocked, happy, celebrating, afraid, thinking, etc.)
- **Display**: Gallery view with thumbnail previews
- **Search**: Filter by tags/emotions, scroll to browse

#### Transition Audio Library

- **Purpose**: Sound effects that play during move transitions/animations
- **Format**: Audio-only files (MP3, WAV)
- **Typical Duration**: 0.5-2 seconds
- **Examples**: Whoosh, punch, boom, dramatic sting, slide
- **Storage**: Supabase Storage (`transition-audio/`)
- **Default Behavior**: Project has default transition audio; can override per move

---

### 5. Audio Architecture

**Two Independent Audio Systems**:

1. **Meme Audio** (Embedded):
   - Audio baked into meme video files
   - Plays when meme appears on screen
   - No separate management required
   - Multiple meme audios can overlap

2. **Transition Audio** (Separate):
   - Standalone audio files
   - Plays during move transition/animation
   - One per move (inherits project default unless overridden)
   - User selects from transition audio library

**Audio Hierarchy**:

```
Project → Default Transition Audio (e.g., "Whoosh")
  ├─ Move 1 → Uses default
  ├─ Move 2 → Override: "Punch"
  ├─ Move 3 → Uses default
  └─ Move 4 → Override: "Dramatic Sting"
```

**Final Video Audio Mix**:

- Transition audio: plays at start of each move
- Meme audio(s): play when meme appears on square
- Background music (optional, v2): continuous throughout
- All layers mixed in final render

---

### 6. Video Export System

**Output Specifications**:

- **Primary Format**: Vertical (1080x1920) for YouTube Shorts
- **Optional Formats** (v2): Horizontal (1920x1080), Square (1080x1080)
- **Quality**: High, optimized for social media
- **Target Length**: Typically 15-30 seconds (15 moves × 2s)

**Video Components**:

- Chess board with piece movements
- Meme overlays synced to specific squares/timing
- Transition audio during move animations
- Meme audio when memes appear
- Optional (v2+):
  - Background music
  - Player names
  - Evaluation bar
  - Captured pieces
  - Intro/outro screens

**Rendering Pipeline**:

1. User clicks "Export Video" button
2. Next.js API route receives project ID
3. Fetch all project data from Supabase
4. Generate public URLs for media assets
5. Remotion composes video frame-by-frame
6. Render to MP4 file
7. Upload to Supabase Storage
8. Return download link to user

**Performance Target**: 15-move video renders in under 5 minutes

---

### 7. Project Management

**Features**:

- Create new projects from PGN
- Auto-save changes (debounced ~2 seconds)
- Load existing projects from list
- Delete projects
- Project settings:
  - Title
  - Default move duration
  - Default transition audio

**Data Persistence**: All state continuously synced to Supabase

---

## Database Schema

### Supabase Tables

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  pgn TEXT NOT NULL,
  default_move_duration_ms INTEGER DEFAULT 2000,
  default_transition_audio_id UUID REFERENCES transition_audio(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Moves table
CREATE TABLE moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  notation TEXT NOT NULL,
  fen TEXT NOT NULL,
  duration_ms INTEGER DEFAULT 2000,
  transition_audio_id UUID REFERENCES transition_audio(id),
  created_at TIMESTAMP DEFAULT NOW()
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

-- Memes table (video clips with embedded audio)
CREATE TABLE memes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  video_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transition audio table (standalone audio files)
CREATE TABLE transition_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Background music (v2+)
CREATE TABLE background_music (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
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
```

---

## Supabase Storage Structure

```
chess-meme-generator/
├── memes/
│   ├── videos/              # Meme video files (with embedded audio)
│   │   ├── shocked-cat.mp4
│   │   ├── vine-boom.mp4
│   │   ├── celebrating.mp4
│   │   └── ...
│   └── thumbnails/          # Auto-generated thumbnails
│       ├── shocked-cat.jpg
│       ├── vine-boom.jpg
│       └── ...
├── transition-audio/        # Audio-only files for transitions
│   ├── whoosh.mp3
│   ├── punch.mp3
│   ├── boom.mp3
│   ├── dramatic-sting.mp3
│   └── ...
├── background-music/        # Optional (v2+)
│   └── ...
└── renders/                 # Final exported videos
    └── [project-id]/
        └── final-video.mp4
```

---

## Project File Structure

```
chess-meme-generator/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx                    # Landing page / project list
│   │   ├── editor/
│   │   │   └── [projectId]/
│   │   │       └── page.tsx            # Main editor with timeline
│   │   ├── preview/                    # v2+
│   │   │   └── [projectId]/
│   │   │       └── page.tsx            # Video preview
│   │   └── library/                    # v2+
│   │       └── page.tsx                # Media library management
│   ├── api/
│   │   ├── render/
│   │   │   └── route.ts                # Video generation endpoint
│   │   ├── projects/
│   │   │   └── route.ts                # Project CRUD
│   │   ├── memes/
│   │   │   └── route.ts                # Meme upload/management
│   │   └── audio/
│   │       └── route.ts                # Transition audio management
│   └── components/
│       ├── timeline/
│       │   ├── Timeline.tsx            # Horizontal timeline view
│       │   └── TimelineCard.tsx        # Individual move card
│       ├── editor/
│       │   ├── ChessBoard.tsx          # Interactive board wrapper
│       │   ├── MoveControls.tsx        # Duration, navigation, audio
│       │   ├── MemeGallery.tsx         # Meme selection modal
│       │   ├── OverlayList.tsx         # List of assigned memes
│       │   └── TransitionAudioSelector.tsx
│       ├── library/
│       │   ├── MemeLibrary.tsx         # Meme upload/management
│       │   └── AudioLibrary.tsx        # Transition audio management
│       └── ui/                         # shadcn/ui components
│           ├── button.tsx
│           ├── dialog.tsx
│           ├── select.tsx
│           └── ...
├── remotion/
│   ├── index.ts                        # Remotion entry point
│   ├── ChessVideo.tsx                  # Main composition
│   ├── MoveSequence.tsx                # Single move renderer
│   ├── MemeOverlay.tsx                 # Meme positioning component
│   └── Root.tsx                        # Remotion root config
├── stores/
│   ├── projectStore.ts                 # Project, moves, settings
│   ├── editorStore.ts                  # UI state, current move
│   └── mediaStore.ts                   # Memes & audio libraries
├── lib/
│   ├── supabase.ts                     # Supabase client setup
│   ├── chess-utils.ts                  # PGN parsing helpers
│   ├── video-utils.ts                  # Remotion utilities
│   └── types.ts                        # TypeScript types
├── public/
│   └── placeholder-thumbnail.png
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## Key User Flows

### Flow 1: Create New Video (Complete Workflow)

1. **Import Game**
   - Click "New Project" button
   - Paste PGN text or upload .pgn file
   - System parses and validates game

2. **Initial Setup**
   - Set project title (optional)
   - Choose default transition audio (e.g., "Whoosh")
   - Timeline populates with all moves

3. **Edit Moves**
   - Navigate using timeline or prev/next buttons
   - For each move:
     - Click square(s) on board
     - Modal opens with meme gallery
     - Select meme to assign to square
     - Repeat for multiple squares if desired
     - Adjust move duration if needed (default: 2s)
     - Override transition audio if desired

4. **Review**
   - Scroll through timeline to see which moves have memes
   - Jump to specific moves to review/edit

5. **Export**
   - Click "Export Video" button
   - Wait for render (3-5 minutes)
   - Download video file from provided link

**Time Estimate**: 10-15 minutes for a 15-move game with memes

---

### Flow 2: Edit Existing Project

1. Open project from list
2. Timeline displays with all moves and indicators
3. Click move card on timeline to jump to it
4. Make changes:
   - Add/remove/replace meme overlays
   - Adjust duration
   - Change transition audio
5. Changes auto-save
6. Re-export video if needed

---

### Flow 3: Manage Media Libraries

**Upload Meme**:

1. Navigate to library management (or inline upload)
2. Select video file (MP4 with embedded audio)
3. System auto-generates thumbnail
4. Add name and tags (emotions)
5. Meme appears in gallery

**Upload Transition Audio**:

1. Navigate to audio library
2. Select audio file (MP3/WAV)
3. Add name and tags
4. Optionally mark as default
5. Audio appears in transition selector dropdown

---

## TypeScript Types

```typescript
// Core data types matching database schema

interface Project {
  id: string;
  title: string;
  pgn: string;
  default_move_duration_ms: number;
  default_transition_audio_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Move {
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

interface Overlay {
  id: string;
  move_id: string;
  square: string;
  meme_id: string;
  start_time_ms: number;
  scale: number;
  rotation: number;
  meme?: Meme;
}

interface Meme {
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

interface TransitionAudio {
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

// UI State types

interface TimelineMove {
  moveNumber: number;
  notation: string;
  duration: number;
  hasMemes: boolean;
  memeCount: number;
  hasCustomAudio: boolean;
  isActive: boolean;
}

interface EditorState {
  currentMoveIndex: number;
  selectedSquare: string | null;
  isMemeModalOpen: boolean;
  isExporting: boolean;
}

// Remotion composition props

interface ChessVideoProps {
  moves: Move[];
  memes: Record<string, Meme>;
  transitionAudios: Record<string, TransitionAudio>;
  fps: number;
  width: number;
  height: number;
}
```

---

## Implementation Roadmap

### Phase 1: MVP (Week 1)

**Core Functionality**:

- [ ] Supabase setup (database schema + storage buckets)
- [ ] PGN import (copy-paste + file upload)
- [ ] Chess board display with react-chessboard
- [ ] Timeline component showing all moves
- [ ] Move navigation (prev/next + timeline click)
- [ ] Meme library with gallery view
- [ ] Click square → meme selection modal
- [ ] Assign memes to squares
- [ ] Basic transition audio library
- [ ] Default transition audio per project
- [ ] Override transition audio per move
- [ ] Save/load projects (auto-save)
- [ ] Basic Remotion video composition
- [ ] Export video with memes + transition audio

**Deliverable**: Functional video generator with all core features

---

### Phase 2: Polish & Enhancements (Week 2)

**Improvements**:

- [ ] Adjust move duration per move
- [ ] Remove/edit existing overlays
- [ ] Meme search/filter by tags
- [ ] Timeline visual indicators polish
- [ ] Better loading states and error handling
- [ ] Video render progress indicator
- [ ] Thumbnail auto-generation for memes
- [ ] Audio waveform preview (optional)
- [ ] Keyboard shortcuts (spacebar = next, etc.)
- [ ] Project duplication/templates

**Deliverable**: Production-ready application

---

### Phase 3: Advanced Features (v2+)

**Future Enhancements**:

- [ ] Multiple video format exports (vertical, horizontal, square)
- [ ] Board themes and piece sets
- [ ] Background music support
- [ ] Intro/outro screens
- [ ] Player names overlay
- [ ] Engine evaluation bar
- [ ] Captured pieces display
- [ ] Timeline drag-to-reorder
- [ ] Bulk audio assignment
- [ ] AI-suggested meme placement (Stockfish integration)
- [ ] Auto-detect blunders/brilliant moves
- [ ] Direct YouTube upload
- [ ] Mobile app version

---

## Technical Implementation Details

### Chess Game Parsing

```typescript
import { Chess } from 'chess.js';

async function parsePGNAndCreateMoves(pgn: string, projectId: string) {
  const chess = new Chess();

  try {
    chess.loadPgn(pgn);
  } catch (error) {
    throw new Error('Invalid PGN format');
  }

  const history = chess.history({ verbose: true });

  const moves = history.map((move, index) => ({
    project_id: projectId,
    move_number: Math.floor(index / 2) + 1,
    notation: move.san,
    fen: move.after,
    duration_ms: 2000,
    transition_audio_id: null, // Will inherit project default
  }));

  const { data, error } = await supabase.from('moves').insert(moves).select();

  if (error) throw error;
  return data;
}
```

---

### Zustand State Management

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectStore {
  project: Project | null;
  moves: Move[];
  currentMoveIndex: number;

  loadProject: (projectId: string) => Promise<void>;
  setCurrentMove: (index: number) => void;
  addOverlay: (moveId: string, overlay: Omit<Overlay, 'id'>) => Promise<void>;
  removeOverlay: (overlayId: string) => Promise<void>;
  updateMoveDuration: (moveId: string, durationMs: number) => Promise<void>;
  updateTransitionAudio: (
    moveId: string,
    audioId: string | null
  ) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      project: null,
      moves: [],
      currentMoveIndex: 0,

      loadProject: async (projectId) => {
        const { data, error } = await supabase
          .from('projects')
          .select(
            `
            *,
            moves (
              *,
              overlays (
                *,
                meme:memes (*)
              )
            )
          `
          )
          .eq('id', projectId)
          .single();

        if (error) throw error;

        set({
          project: data,
          moves: data.moves.sort((a, b) => a.move_number - b.move_number),
          currentMoveIndex: 0,
        });
      },

      setCurrentMove: (index) => set({ currentMoveIndex: index }),

      addOverlay: async (moveId, overlay) => {
        const { data, error } = await supabase
          .from('overlays')
          .insert({ move_id: moveId, ...overlay })
          .select('*, meme:memes (*)')
          .single();

        if (error) throw error;

        // Update local state
        const moves = get().moves.map((move) =>
          move.id === moveId
            ? { ...move, overlays: [...(move.overlays || []), data] }
            : move
        );
        set({ moves });
      },

      removeOverlay: async (overlayId) => {
        const { error } = await supabase
          .from('overlays')
          .delete()
          .eq('id', overlayId);

        if (error) throw error;

        // Update local state
        const moves = get().moves.map((move) => ({
          ...move,
          overlays: move.overlays?.filter((o) => o.id !== overlayId),
        }));
        set({ moves });
      },

      updateMoveDuration: async (moveId, durationMs) => {
        const { error } = await supabase
          .from('moves')
          .update({ duration_ms: durationMs })
          .eq('id', moveId);

        if (error) throw error;

        const moves = get().moves.map((move) =>
          move.id === moveId ? { ...move, duration_ms: durationMs } : move
        );
        set({ moves });
      },

      updateTransitionAudio: async (moveId, audioId) => {
        const { error } = await supabase
          .from('moves')
          .update({ transition_audio_id: audioId })
          .eq('id', moveId);

        if (error) throw error;

        const moves = get().moves.map((move) =>
          move.id === moveId ? { ...move, transition_audio_id: audioId } : move
        );
        set({ moves });
      },
    }),
    { name: 'project-store' }
  )
);
```

---

### Remotion Video Composition

```typescript
// remotion/ChessVideo.tsx
import { AbsoluteFill, Audio, Sequence, Video, useVideoConfig } from 'remotion';
import { Chessboard } from 'react-chessboard';

export const ChessVideo: React.FC<ChessVideoProps> = ({
  moves,
  memes,
  transitionAudios,
}) => {
  const { fps } = useVideoConfig();

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      {moves.map((move, index) => {
        const durationInFrames = Math.round((move.duration_ms / 1000) * fps);
        const sequenceStart = currentFrame;
        currentFrame += durationInFrames;

        return (
          <Sequence
            key={move.id}
            from={sequenceStart}
            durationInFrames={durationInFrames}
          >
            {/* Transition audio */}
            {move.transition_audio_id && transitionAudios[move.transition_audio_id] && (
              <Audio
                src={transitionAudios[move.transition_audio_id].audioUrl}
                volume={0.8}
              />
            )}

            {/* Chess board */}
            <AbsoluteFill className="flex items-center justify-center">
              <div style={{ width: '80vh', height: '80vh' }}>
                <Chessboard
                  position={move.fen}
                  arePiecesDraggable={false}
                />
              </div>
            </AbsoluteFill>

            {/* Meme overlays */}
            {move.overlays?.map((overlay) => {
              const meme = memes[overlay.meme_id];
              if (!meme) return null;

              const overlayStart = Math.round((overlay.start_time_ms / 1000) * fps);
              const overlayDuration = Math.round((meme.duration_ms / 1000) * fps);
              const position = getSquarePosition(overlay.square);

              return (
                <Sequence
                  key={overlay.id}
                  from={overlayStart}
                  durationInFrames={overlayDuration}
                >
                  <AbsoluteFill>
                    <div
                      style={{
                        position: 'absolute',
                        left: position.x,
                        top: position.y,
                        width: position.size,
                        height: position.size,
                        transform: `scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
                      }}
                    >
                      <Video
                        src={meme.videoUrl}
                        volume={1.0}
                      />
                    </div>
                  </AbsoluteFill>
                </Sequence>
              );
            })}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

function getSquarePosition(square: string): { x: number; y: number; size: number } {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = 8 - parseInt(square[1]); // 8=0, 1=7

  const boardSize = 1920 * 0.8; // 80vh of 1920px height
  const squareSize = boardSize / 8;
  const boardOffset = (1920 - boardSize) / 2;

  return {
    x: boardOffset + (file * squareSize),
    y: boardOffset + (rank * squareSize),
    size: squareSize,
  };
}
```

---

### Video Rendering API Route

```typescript
// app/api/render/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  const { projectId } = await request.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch project with all related data
  const { data: project, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      moves (
        *,
        overlays (
          *,
          meme:memes (*)
        )
      )
    `
    )
    .eq('id', projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch transition audio
  const audioIds = [
    project.default_transition_audio_id,
    ...project.moves.map((m) => m.transition_audio_id),
  ].filter(Boolean);

  const { data: audioData } = await supabase
    .from('transition_audio')
    .select('*')
    .in('id', audioIds);

  // Generate public URLs for all media
  const memes: Record<string, Meme> = {};
  project.moves.forEach((move) => {
    move.overlays?.forEach((overlay) => {
      if (overlay.meme && !memes[overlay.meme.id]) {
        memes[overlay.meme.id] = {
          ...overlay.meme,
          videoUrl: supabase.storage
            .from('chess-meme-generator')
            .getPublicUrl(overlay.meme.video_path).data.publicUrl,
          thumbnailUrl: supabase.storage
            .from('chess-meme-generator')
            .getPublicUrl(overlay.meme.thumbnail_path).data.publicUrl,
        };
      }
    });
  });

  const transitionAudios: Record<string, TransitionAudio> = {};
  audioData?.forEach((audio) => {
    transitionAudios[audio.id] = {
      ...audio,
      audioUrl: supabase.storage
        .from('chess-meme-generator')
        .getPublicUrl(audio.audio_path).data.publicUrl,
    };
  });

  // Bundle Remotion project
  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), 'remotion/index.ts'),
    webpackOverride: (config) => config,
  });

  // Select composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'ChessVideo',
    inputProps: {
      moves: project.moves.sort((a, b) => a.move_number - b.move_number),
      memes,
      transitionAudios,
      fps: 30,
      width: 1080,
      height: 1920,
    },
  });

  // Render video
  const outputPath = `/tmp/${projectId}.mp4`;
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
  });

  // Upload to Supabase Storage
  const videoBuffer = await fs.readFile(outputPath);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('chess-meme-generator')
    .upload(`renders/${projectId}/final.mp4`, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const publicUrl = supabase.storage
    .from('chess-meme-generator')
    .getPublicUrl(uploadData.path).data.publicUrl;

  // Clean up temp file
  await fs.unlink(outputPath);

  return NextResponse.json({ videoUrl: publicUrl });
}
```

---

## Technical Challenges & Solutions

### Challenge 1: Audio Mixing Complexity

**Problem**: Multiple audio sources (transition + meme audios + background music) need precise synchronization  
**Solution**:

- Remotion handles multi-track audio natively
- Use separate `<Audio>` components with precise frame timing
- Set volume levels: transition (0.8), memes (1.0), background (0.3)
- Frame-based timing ensures deterministic playback

---

### Challenge 2: Large Media Files & Performance

**Problem**: 50+ video files could slow down UI and increase bandwidth  
**Solution**:

- Lazy load videos: only load thumbnails in gallery
- Use Supabase CDN with aggressive caching
- Compress thumbnails (WebP, 200x200px max)
- Virtual scrolling for large galleries (react-window)
- Stream videos on-demand when selected

---

### Challenge 3: Timeline Performance with Many Moves

**Problem**: 50+ move cards could cause sluggish rendering  
**Solution**:

- Use React.memo on TimelineCard components
- Implement virtual scrolling if >30 moves
- Debounce timeline updates (300ms)
- Optimize re-renders with proper key usage

---

### Challenge 4: Video Rendering Time

**Problem**: Server-side rendering can take several minutes  
**Solution**:

- Show progress indicator with estimated time
- Stream render progress via Server-Sent Events (v2)
- Consider Remotion Lambda for faster cloud rendering (v2)
- Optimize Remotion composition (minimize unnecessary re-renders)
- Use lower quality settings for preview mode

---

### Challenge 5: Precise Meme Timing on Board

**Problem**: Calculating exact pixel positions for memes on chess squares  
**Solution**:

- Use deterministic square-to-pixel conversion
- Account for board size (80% of viewport height)
- Calculate based on file/rank: `file = charCode - 97`, `rank = 8 - number`
- Test on multiple resolutions to ensure consistency

---

## Success Metrics

### Development Success

- [ ] Import 15-move PGN in under 10 seconds
- [ ] Add memes to all moves in under 10 minutes
- [ ] Video export completes in under 5 minutes
- [ ] Zero manual video editing required post-export

### Technical Success

- [ ] <2 second page load time
- [ ] <500ms interaction response time
- [ ] > 95% successful render rate
- [ ] Zero data loss (auto-save works reliably)

### Output Quality

- [ ] Final video suitable for YouTube Shorts upload (no compression artifacts)
- [ ] Audio levels balanced (no clipping or silence)
- [ ] Memes sync perfectly to moves
- [ ] Smooth transitions between moves

---

## Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Remotion (optional, for cloud rendering)
REMOTION_AWS_ACCESS_KEY_ID=
REMOTION_AWS_SECRET_ACCESS_KEY=
```

---

## Installation & Setup

```bash
# Clone repository
git clone <repo-url>
cd chess-meme-generator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Set up Supabase
# 1. Create project at supabase.com
# 2. Run SQL from "Database Schema" section above
# 3. Create storage buckets: chess-meme-generator
# 4. Set bucket to public

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add production Supabase credentials

# Deploy to production
vercel --prod
```

---

## Future Considerations

### Potential Improvements (v3+)

- **AI Integration**: Use Stockfish to detect blunders/brilliant moves and auto-suggest appropriate memes
- **Batch Processing**: Queue multiple videos for rendering
- **Templates**: Save meme configurations as templates for similar openings
- **Analytics**: Track which memes are most effective (views, engagement)
- **Collaboration**: Share projects with other creators
- **Mobile App**: React Native version for on-the-go editing
- **Live Streaming**: Real-time board analysis during live games

### Scalability Notes

- Current architecture supports single user
- To support multiple users: add authentication + RLS policies
- For high-traffic: consider separate render queue (BullMQ + Redis)
- For large media libraries: implement CDN + lazy loading optimizations

---

## License & Credits

**License**: MIT (or specify your license)

**Key Dependencies**:

- Remotion - Video generation framework
- chess.js - Chess game logic
- react-chessboard - Board UI component
- Supabase - Backend infrastructure
- Next.js - Full-stack framework
- shadcn/ui - UI component library

---

## Contact & Support

**Developer**: [Your Name]  
**Repository**: [GitHub URL]  
**Issues**: [GitHub Issues URL]

---

**Last Updated**: 2026-02-10  
**Version**: 1.0.0 (Technical Specification)
