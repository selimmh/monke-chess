# Quick Start Guide - Monke Chess

Get up and running in 10 minutes!

## Prerequisites

✅ Node.js 18+ installed  
✅ A Supabase account (free tier works!)

## 1. Install Dependencies (1 min)

```bash
npm install
```

## 2. Set Up Supabase (3 min)

### Create Project
1. Go to [supabase.com](https://supabase.com) → "New Project"
2. Name it "monke-chess" and wait for provisioning

### Run Database Schema
1. Open SQL Editor in Supabase dashboard
2. Copy contents from `database/schema.sql`
3. Paste and click **Run**

### Create Storage Bucket
1. Go to Storage → "New bucket"
2. Name: `chess-meme-generator`
3. Make it **Public** ✅
4. Create these folders inside:
   ```
   memes/videos/
   memes/thumbnails/
   transition-audio/
   renders/
   ```

### Get API Keys
1. Go to Settings → API
2. Copy these three values:
   - Project URL
   - anon/public key
   - service_role key

## 3. Configure Environment (1 min)

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 4. Start Development Server (10 sec)

```bash
npm run dev
```

Open http://localhost:3000

## 5. Create Your First Video (5 min)

### Upload Test Media

1. Go to **Media Library**
2. Upload a short test video (any MP4, 2-5 seconds)
   - Name it: "Test Meme"
   - Tags: "test"
3. Upload a test audio file (any MP3/WAV)
   - Name it: "Whoosh"
   - Mark as default ✅

### Create Project

1. Click **New Project**
2. Paste this test PGN:

```pgn
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O
```

3. Click **Create Project**

### Add Memes

1. Click any square on the chess board
2. Select your test meme
3. Navigate through moves using timeline
4. Add memes to 2-3 different moves

### Export

1. Click **Export Video**
2. Wait 2-3 minutes
3. Download your first chess meme video! 🎉

## Troubleshooting

❌ **"Failed to load projects"**  
→ Check `.env.local` has correct Supabase credentials

❌ **"Failed to upload meme"**  
→ Ensure storage bucket is **Public** and folders exist

❌ **PGN error**  
→ Use the test PGN above or copy from chess.com/lichess

## What's Next?

- 📚 **Read full README.md** for detailed features
- 🎭 **Upload more memes** to build your library
- ♟️ **Import real games** from chess.com or lichess
- 🎬 **Experiment** with different meme placements
- 🚀 **Deploy** to Vercel when ready

## Sample PGN Sources

Get interesting games to meme:

- [chess.com/games](https://www.chess.com/games) - PGN export available
- [lichess.org/games](https://lichess.org/games) - Free PGN downloads
- [pgnmentor.com](http://www.pgnmentor.com/) - Famous games database

## Need Help?

📖 See SETUP.md for detailed setup guide  
📋 See docs/TECHNICAL-SPECS.md for architecture details  
🐛 Open an issue on GitHub

---

**Time to first video: ~10 minutes** ⚡
