import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parsePGN } from '@/lib/chess-utils';

// GET /api/projects - List all projects
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { title, pgn, default_move_duration_ms, default_transition_audio_id } = body;

    if (!title || !pgn) {
      return NextResponse.json(
        { error: 'Title and PGN are required' },
        { status: 400 }
      );
    }

    // Parse PGN to validate and extract moves
    const moves = parsePGN(pgn);

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        pgn,
        default_move_duration_ms: default_move_duration_ms || 2000,
        default_transition_audio_id: default_transition_audio_id || null,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create moves
    const movesWithProjectId = moves.map((move) => ({
      ...move,
      project_id: project.id,
    }));

    const { data: createdMoves, error: movesError } = await supabase
      .from('moves')
      .insert(movesWithProjectId)
      .select();

    if (movesError) throw movesError;

    return NextResponse.json({
      ...project,
      moves: createdMoves,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
}
