import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS, STORAGE_PATHS } from '@/lib/types';
import path from 'path';
import { readFile, unlink } from 'fs/promises';
import type { Meme, TransitionAudio } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch project with all related data
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        moves (
          *,
          overlays (
            *,
            meme:memes (*)
          )
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch transition audio
    type ProjectMove = typeof project.moves[number];
    const audioIds = [
      project.default_transition_audio_id,
      ...project.moves.map((m: ProjectMove) => m.transition_audio_id),
    ].filter((id): id is string => Boolean(id));

    const { data: audioData } = await supabase
      .from('transition_audio')
      .select('*')
      .in('id', audioIds);

    // Generate public URLs for all media
    const memes: Record<string, Meme> = {};
    project.moves.forEach((move: ProjectMove) => {
      move.overlays?.forEach((overlay) => {
        if (overlay.meme && !memes[overlay.meme.id]) {
          memes[overlay.meme.id] = {
            ...overlay.meme,
            videoUrl: supabase.storage
              .from(STORAGE_BUCKETS.MAIN)
              .getPublicUrl(overlay.meme.video_path).data.publicUrl,
            thumbnailUrl: supabase.storage
              .from(STORAGE_BUCKETS.MAIN)
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
          .from(STORAGE_BUCKETS.MAIN)
          .getPublicUrl(audio.audio_path).data.publicUrl,
      };
    });

    // Apply default transition audio to moves without one
    const movesWithAudio = project.moves.map((move: ProjectMove) => ({
      ...move,
      transition_audio_id: move.transition_audio_id || project.default_transition_audio_id,
    }));

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
        moves: movesWithAudio.sort((a, b) => a.move_number - b.move_number),
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
      onProgress: ({ progress }) => {
        console.log(`Rendering progress: ${Math.round(progress * 100)}%`);
      },
    });

    // Upload to Supabase Storage
    const videoBuffer = await readFile(outputPath);
    const renderPath = `${STORAGE_PATHS.RENDERS}/${projectId}/final.mp4`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.MAIN)
      .upload(renderPath, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrl = supabase.storage
      .from(STORAGE_BUCKETS.MAIN)
      .getPublicUrl(uploadData.path).data.publicUrl;

    // Clean up temp file
    await unlink(outputPath);

    return NextResponse.json({ videoUrl: publicUrl });
  } catch (error) {
    console.error('Render error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to render video' },
      { status: 500 }
    );
  }
}
