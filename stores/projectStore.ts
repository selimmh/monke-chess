import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Move, Overlay } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface ProjectStore {
  // State
  project: Project | null;
  moves: Move[];
  currentMoveIndex: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProject: (projectId: string) => Promise<void>;
  setCurrentMove: (index: number) => void;
  addOverlay: (moveId: string, overlay: Omit<Overlay, 'id'>) => Promise<void>;
  removeOverlay: (overlayId: string) => Promise<void>;
  updateMoveDuration: (moveId: string, durationMs: number) => Promise<void>;
  updateTransitionAudio: (moveId: string, audioId: string | null) => Promise<void>;
  updateProjectTitle: (title: string) => Promise<void>;
  updateDefaultMoveDuration: (durationMs: number) => Promise<void>;
  updateDefaultTransitionAudio: (audioId: string | null) => Promise<void>;
  clearProject: () => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial state
      project: null,
      moves: [],
      currentMoveIndex: 0,
      isLoading: false,
      error: null,

      loadProject: async (projectId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const supabase = createClient();
          
          const { data, error } = await supabase
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

          if (error) throw error;

          set({
            project: data,
            moves: data.moves.sort((a: Move, b: Move) => a.move_number - b.move_number),
            currentMoveIndex: 0,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load project',
            isLoading: false,
          });
        }
      },

      setCurrentMove: (index: number) => {
        const { moves } = get();
        if (index >= 0 && index < moves.length) {
          set({ currentMoveIndex: index });
        }
      },

      addOverlay: async (moveId: string, overlay: Omit<Overlay, 'id'>) => {
        try {
          const supabase = createClient();
          
          const { data, error } = await supabase
            .from('overlays')
            .insert({ move_id: moveId, ...overlay })
            .select('*, meme:memes (*)')
            .single();

          if (error) throw error;

          // Update local state
          const { moves } = get();
          const updatedMoves = moves.map((move) =>
            move.id === moveId
              ? { ...move, overlays: [...(move.overlays || []), data] }
              : move
          );
          set({ moves: updatedMoves });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add overlay' });
        }
      },

      removeOverlay: async (overlayId: string) => {
        try {
          const supabase = createClient();
          
          const { error } = await supabase
            .from('overlays')
            .delete()
            .eq('id', overlayId);

          if (error) throw error;

          // Update local state
          const { moves } = get();
          const updatedMoves = moves.map((move) => ({
            ...move,
            overlays: move.overlays?.filter((o) => o.id !== overlayId),
          }));
          set({ moves: updatedMoves });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove overlay' });
        }
      },

      updateMoveDuration: async (moveId: string, durationMs: number) => {
        try {
          const supabase = createClient();
          
          const { error } = await supabase
            .from('moves')
            .update({ duration_ms: durationMs })
            .eq('id', moveId);

          if (error) throw error;

          const { moves } = get();
          const updatedMoves = moves.map((move) =>
            move.id === moveId ? { ...move, duration_ms: durationMs } : move
          );
          set({ moves: updatedMoves });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update duration' });
        }
      },

      updateTransitionAudio: async (moveId: string, audioId: string | null) => {
        try {
          const supabase = createClient();
          
          const { error } = await supabase
            .from('moves')
            .update({ transition_audio_id: audioId })
            .eq('id', moveId);

          if (error) throw error;

          const { moves } = get();
          const updatedMoves = moves.map((move) =>
            move.id === moveId ? { ...move, transition_audio_id: audioId } : move
          );
          set({ moves: updatedMoves });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update audio' });
        }
      },

      updateProjectTitle: async (title: string) => {
        const { project } = get();
        if (!project) return;

        try {
          const supabase = createClient();
          
          const { error } = await supabase
            .from('projects')
            .update({ title })
            .eq('id', project.id);

          if (error) throw error;

          set({ project: { ...project, title } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update title' });
        }
      },

      updateDefaultMoveDuration: async (durationMs: number) => {
        const { project } = get();
        if (!project) return;

        try {
          const supabase = createClient();
          
          const { error } = await supabase
            .from('projects')
            .update({ default_move_duration_ms: durationMs })
            .eq('id', project.id);

          if (error) throw error;

          set({ project: { ...project, default_move_duration_ms: durationMs } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update default duration' });
        }
      },

      updateDefaultTransitionAudio: async (audioId: string | null) => {
        const { project } = get();
        if (!project) return;

        try {
          const supabase = createClient();
          
          const { error } = await supabase
            .from('projects')
            .update({ default_transition_audio_id: audioId })
            .eq('id', project.id);

          if (error) throw error;

          set({ project: { ...project, default_transition_audio_id: audioId } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update default audio' });
        }
      },

      clearProject: () => {
        set({
          project: null,
          moves: [],
          currentMoveIndex: 0,
          error: null,
        });
      },

      reset: () => {
        set({
          project: null,
          moves: [],
          currentMoveIndex: 0,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'project-store',
      partialize: (state) => ({
        project: state.project,
        moves: state.moves,
        currentMoveIndex: state.currentMoveIndex,
      }),
    }
  )
);
