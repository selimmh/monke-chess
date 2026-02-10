import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS, STORAGE_PATHS } from '@/lib/types';

// GET /api/memes - List all memes
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add public URLs
    const memesWithUrls = data.map((meme) => ({
      ...meme,
      videoUrl: supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .getPublicUrl(meme.video_path).data.publicUrl,
      thumbnailUrl: supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .getPublicUrl(meme.thumbnail_path).data.publicUrl,
    }));

    return NextResponse.json(memesWithUrls);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch memes' },
      { status: 500 }
    );
  }
}

// POST /api/memes - Create new meme
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    
    const videoFile = formData.get('video') as File;
    const name = formData.get('name') as string;
    const tagsStr = formData.get('tags') as string;
    const durationMs = parseInt(formData.get('duration_ms') as string);

    if (!videoFile || !name) {
      return NextResponse.json(
        { error: 'Video file and name are required' },
        { status: 400 }
      );
    }

    const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [];

    // Upload video
    const videoPath = `${STORAGE_PATHS.MEMES_VIDEOS}/${Date.now()}-${videoFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.MAIN)
      .upload(videoPath, videoFile);

    if (uploadError) throw uploadError;

    // Generate thumbnail (for now, use a placeholder path - in production, generate from video)
    const thumbnailPath = `${STORAGE_PATHS.MEMES_THUMBNAILS}/${Date.now()}-thumb.jpg`;

    // Create meme record
    const { data, error } = await supabase
      .from('memes')
      .insert({
        name,
        video_path: videoPath,
        thumbnail_path: thumbnailPath,
        duration_ms: durationMs || 3000,
        tags,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...data,
      videoUrl: supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .getPublicUrl(videoPath).data.publicUrl,
      thumbnailUrl: supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .getPublicUrl(thumbnailPath).data.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meme' },
      { status: 500 }
    );
  }
}

// DELETE /api/memes/[id] - Delete meme
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Meme ID is required' },
        { status: 400 }
      );
    }

    // Get meme to delete files
    const { data: meme } = await supabase
      .from('memes')
      .select('video_path, thumbnail_path')
      .eq('id', id)
      .single();

    if (meme) {
      // Delete files from storage
      await supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .remove([meme.video_path, meme.thumbnail_path]);
    }

    // Delete record
    const { error } = await supabase
      .from('memes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete meme' },
      { status: 500 }
    );
  }
}
