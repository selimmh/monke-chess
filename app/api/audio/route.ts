import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS, STORAGE_PATHS } from '@/lib/types';

// GET /api/audio - List all transition audio
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transition_audio')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add public URLs
    const audiosWithUrls = data.map((audio) => ({
      ...audio,
      audioUrl: supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .getPublicUrl(audio.audio_path).data.publicUrl,
    }));

    return NextResponse.json(audiosWithUrls);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audio' },
      { status: 500 }
    );
  }
}

// POST /api/audio - Create new transition audio
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    
    const audioFile = formData.get('audio') as File;
    const name = formData.get('name') as string;
    const tagsStr = formData.get('tags') as string;
    const durationMs = parseInt(formData.get('duration_ms') as string);
    const isDefault = formData.get('is_default') === 'true';

    if (!audioFile || !name) {
      return NextResponse.json(
        { error: 'Audio file and name are required' },
        { status: 400 }
      );
    }

    const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [];

    // Upload audio
    const audioPath = `${STORAGE_PATHS.TRANSITION_AUDIO}/${Date.now()}-${audioFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.MAIN)
      .upload(audioPath, audioFile);

    if (uploadError) throw uploadError;

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from('transition_audio')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    // Create audio record
    const { data, error } = await supabase
      .from('transition_audio')
      .insert({
        name,
        audio_path: audioPath,
        duration_ms: durationMs || 1000,
        tags,
        is_default: isDefault,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...data,
      audioUrl: supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .getPublicUrl(audioPath).data.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create audio' },
      { status: 500 }
    );
  }
}

// DELETE /api/audio/[id] - Delete transition audio
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Audio ID is required' },
        { status: 400 }
      );
    }

    // Get audio to delete file
    const { data: audio } = await supabase
      .from('transition_audio')
      .select('audio_path')
      .eq('id', id)
      .single();

    if (audio) {
      // Delete file from storage
      await supabase.storage
        .from(STORAGE_BUCKETS.MAIN)
        .remove([audio.audio_path]);
    }

    // Delete record
    const { error } = await supabase
      .from('transition_audio')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete audio' },
      { status: 500 }
    );
  }
}
