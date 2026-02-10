# Setup Guide for Monke Chess

Follow these steps to set up the Monke Chess application from scratch.

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd monke-chess
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in the project details
4. Wait for the project to be provisioned

### Configure the Database

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Open the file `database/schema.sql` in this repository
4. Copy its entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute the schema

This will create all the necessary tables:
- `projects`
- `moves`
- `overlays`
- `memes`
- `transition_audio`
- `background_music` (optional, for v2)
- `video_settings` (optional, for v2)

### Set Up Storage

1. In your Supabase dashboard, navigate to **Storage**
2. Click **New bucket**
3. Name it: `chess-meme-generator`
4. Make it **Public** (toggle the public option)
5. Click **Create**

6. Inside the bucket, create these folders:
   - `memes/videos/`
   - `memes/thumbnails/`
   - `transition-audio/`
   - `background-music/` (optional)
   - `renders/`

**Note**: To create nested folders in Supabase Storage:
- Click into the bucket
- Click **New folder**
- Enter folder name (e.g., `memes`)
- Click into `memes` folder
- Click **New folder** again
- Enter `videos`
- Repeat for `thumbnails`

### Get Your API Keys

1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. You'll need three values:

- **Project URL**: Shows as "URL" (e.g., `https://abcdefgh.supabase.co`)
- **Anon/Public Key**: Shows as "anon public" (long string starting with `eyJ...`)
- **Service Role Key**: Shows as "service_role" (long string starting with `eyJ...`)

**⚠️ Important**: Keep your service role key secret! Never commit it to version control.

## Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Upload Sample Media (Optional)

To test the application, you'll want some meme videos and transition audio:

### Upload Meme Videos

1. Click **Media Library** from the home page
2. Go to the **Memes** tab
3. Click **Upload New Meme**
4. Upload a short video file (MP4 or WebM, 2-5 seconds)
5. Add a name and tags
6. Click **Upload Meme**

Repeat for multiple meme videos.

### Upload Transition Audio

1. In Media Library, go to the **Transition Audio** tab
2. Click **Upload New Transition Audio**
3. Upload an audio file (MP3 or WAV, 0.5-2 seconds)
4. Add a name (e.g., "Whoosh", "Boom", "Swoosh")
5. Optionally mark one as default
6. Click **Upload Audio**

## Step 6: Create Your First Project

1. Return to the home page
2. Click **New Project**
3. Paste a PGN (chess game notation) or upload a .pgn file

**Sample PGN for testing**:

```pgn
[Event "Test Game"]
[Site "Internet"]
[Date "2026.02.10"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 
6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5
```

4. Click **Create Project**
5. You'll be taken to the editor

## Step 7: Edit Your Video

1. Click any square on the chess board
2. Select a meme from the gallery
3. The meme will be assigned to that square for the current move
4. Use the timeline to navigate between moves
5. Adjust move duration if needed
6. Set transition audio for moves
7. Click **Export Video** when ready

## Troubleshooting

### "Failed to load projects" Error

**Cause**: Database connection issue

**Solutions**:
- Check that `.env.local` exists with correct Supabase credentials
- Verify the database schema was run successfully
- Check Supabase project status (ensure it's not paused)

### "Failed to upload meme" Error

**Cause**: Storage configuration issue

**Solutions**:
- Verify the `chess-meme-generator` bucket exists
- Ensure the bucket is set to **Public**
- Check that folders exist inside the bucket
- Verify service role key in `.env.local` has storage permissions

### "Invalid PGN format" Error

**Cause**: Malformed PGN input

**Solutions**:
- Ensure PGN follows standard format
- Try a known-good PGN from chess.com or lichess.org
- Make sure moves are in algebraic notation (e4, Nf3, etc.)

### Video render fails

**Cause**: Remotion rendering issue

**Solutions**:
- Check that all meme videos are accessible (public URLs work)
- Verify Remotion dependencies installed: `npm ls remotion`
- Check browser console for detailed errors
- Try rendering with fewer moves/memes first

### React-chessboard board not displaying

**Cause**: CSS or import issue

**Solutions**:
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check that react-chessboard CSS is loaded

## Next Steps

1. **Upload more media**: Build up your meme and audio library
2. **Create more projects**: Import different chess games
3. **Experiment**: Try different move durations, meme placements, and audio
4. **Export videos**: Render your first chess meme video!
5. **Share**: Upload to YouTube Shorts, TikTok, or Instagram Reels

## Production Deployment

When ready to deploy to production:

1. **Deploy to Vercel**:
```bash
vercel
```

2. **Add environment variables** in Vercel dashboard:
- Go to Project Settings > Environment Variables
- Add all three Supabase keys

3. **Deploy to production**:
```bash
vercel --prod
```

4. **Optional**: Enable Remotion Cloud Rendering for faster video generation

## Support

For issues or questions:
1. Check the main README.md
2. Review the technical specs in docs/TECHNICAL-SPECS.md
3. Open an issue on GitHub

---

Happy meme-ing! 🎬♟️🎭
