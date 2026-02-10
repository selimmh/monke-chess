# Monke Chess 🎬♟️

A web-based tool to transform chess games into engaging, meme-enhanced videos for YouTube Shorts and other short-form platforms.

## Features

- 📥 **Import Chess Games**: Paste PGN text or upload .pgn files
- 🎬 **Timeline-Based Editor**: Visual timeline showing all moves with indicators for memes and audio
- 🎭 **Meme Overlays**: Assign video memes to specific squares on any move
- 🎵 **Transition Audio**: Add sound effects to move transitions
- 📹 **Video Export**: Render to vertical video (1080x1920) optimized for YouTube Shorts
- 💾 **Project Management**: Save and reload projects with auto-save
- 📚 **Media Library**: Upload and manage meme videos and transition audio

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Video Generation**: Remotion
- **Chess Logic**: chess.js
- **Board UI**: react-chessboard
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Execute the query

3. Create a storage bucket:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `chess-meme-generator`
   - Make it public
   - Create the following folders inside:
     - `memes/videos/`
     - `memes/thumbnails/`
     - `transition-audio/`
     - `renders/`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from your Supabase project settings.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Creating a Project

1. Click "New Project" on the home page
2. Paste your PGN text or upload a .pgn file
3. Optionally provide a project title (auto-generated if left blank)
4. Click "Create Project" to enter the editor

### Editing Your Video

1. **Timeline Navigation**: Click any move card to jump to it
2. **Add Memes**: Click any square on the board to open the meme gallery and assign a meme
3. **Adjust Duration**: Change how long each move displays (default: 2 seconds)
4. **Set Transition Audio**: Choose audio that plays during move transitions
5. **Remove Memes**: Click the trash icon next to assigned memes to remove them

### Managing Media

1. Go to "Media Library" from the home page
2. **Upload Memes**: Upload video files (MP4, WebM) with embedded audio
3. **Upload Audio**: Upload audio files (MP3, WAV) for transitions
4. Add tags to organize your media

### Exporting Videos

1. Click "Export Video" in the editor
2. Wait for rendering to complete (3-5 minutes for typical videos)
3. Download the rendered video file

## Project Structure

```
monke-chess/
├── app/
│   ├── (routes)/
│   │   └── page.tsx              # Landing page with project list
│   ├── editor/[projectId]/
│   │   └── page.tsx              # Main editor interface
│   ├── library/
│   │   └── page.tsx              # Media library management
│   └── api/
│       ├── projects/             # Project CRUD endpoints
│       ├── memes/                # Meme upload/management
│       ├── audio/                # Audio upload/management
│       └── render/               # Video rendering endpoint
├── components/
│   ├── timeline/                 # Timeline components
│   ├── editor/                   # Editor components
│   └── library/                  # Media library components
├── remotion/                     # Remotion video composition
│   ├── ChessVideo.tsx            # Main video composition
│   ├── MemeOverlay.tsx           # Meme positioning
│   └── Root.tsx                  # Remotion config
├── stores/                       # Zustand state management
│   ├── projectStore.ts           # Project and moves state
│   ├── editorStore.ts            # UI state
│   └── mediaStore.ts             # Media library state
├── lib/
│   ├── chess-utils.ts            # Chess/PGN utilities
│   ├── types.ts                  # TypeScript types
│   └── supabase/                 # Supabase client setup
└── database/
    └── schema.sql                # Database schema
```

## Video Output Specifications

- **Format**: MP4 (H.264)
- **Resolution**: 1080x1920 (vertical)
- **Frame Rate**: 30 fps
- **Audio**: Mixed transition audio + meme audio

## Development

### Preview Remotion Compositions

```bash
npm run remotion:preview
```

### Render a Test Video

```bash
npm run remotion:render
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in the Vercel dashboard

4. Deploy to production:
```bash
vercel --prod
```

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys in `.env.local`
- Ensure the database schema has been run
- Check that RLS policies allow operations (schema disables RLS by default)

### Storage Upload Issues
- Verify the storage bucket `chess-meme-generator` exists and is public
- Check that folders are created with correct names
- Ensure service role key has storage permissions

### Video Rendering Fails
- Check that all meme videos and audio files are accessible
- Verify Remotion dependencies are installed
- Check server logs for detailed error messages

## Roadmap

### Phase 1 (MVP) ✅
- ✅ PGN import and parsing
- ✅ Timeline-based editor
- ✅ Meme overlay system
- ✅ Transition audio
- ✅ Video export
- ✅ Media library management

### Phase 2 (Polish)
- [ ] Adjust move duration per move
- [ ] Meme search and filtering
- [ ] Timeline visual indicators polish
- [ ] Video render progress indicator
- [ ] Keyboard shortcuts
- [ ] Project duplication

### Phase 3 (Advanced)
- [ ] Multiple video formats (horizontal, square)
- [ ] Board themes and piece sets
- [ ] Background music support
- [ ] Player names and evaluation bar
- [ ] AI-suggested meme placement
- [ ] Direct YouTube upload

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

MIT

## Credits

Built with:
- [Remotion](https://www.remotion.dev/) - Video generation
- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic
- [react-chessboard](https://github.com/Clariity/react-chessboard) - Chess board UI
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

**Last Updated**: February 10, 2026
**Version**: 1.0.0
