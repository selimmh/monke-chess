import { create } from 'zustand';
import type { Meme, TransitionAudio } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { STORAGE_BUCKETS } from '@/lib/types';

interface MediaStore {
  // State
  memes: Meme[];
  transitionAudios: TransitionAudio[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadMemes: () => Promise<void>;
  loadTransitionAudios: () => Promise<void>;
  loadAllMedia: () => Promise<void>;
  addMeme: (meme: Omit<Meme, 'id' | 'created_at'>) => Promise<Meme | null>;
  addTransitionAudio: (audio: Omit<TransitionAudio, 'id' | 'created_at'>) => Promise<TransitionAudio | null>;
  deleteMeme: (id: string) => Promise<void>;
  deleteTransitionAudio: (id: string) => Promise<void>;
  searchMemes: (query: string, tags?: string[]) => Meme[];
  searchTransitionAudios: (query: string, tags?: string[]) => TransitionAudio[];
  reset: () => void;
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  // Initial state
  memes: [],
  transitionAudios: [],
  isLoading: false,
  error: null,

  loadMemes: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate public URLs
      const memesWithUrls: Meme[] = data.map((meme) => ({
        ...meme,
        videoUrl: supabase.storage
          .from(STORAGE_BUCKETS.MAIN)
          .getPublicUrl(meme.video_path).data.publicUrl,
        thumbnailUrl: supabase.storage
          .from(STORAGE_BUCKETS.MAIN)
          .getPublicUrl(meme.thumbnail_path).data.publicUrl,
      }));

      set({ memes: memesWithUrls, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load memes',
        isLoading: false,
      });
    }
  },

  loadTransitionAudios: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('transition_audio')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate public URLs
      const audiosWithUrls: TransitionAudio[] = data.map((audio) => ({
        ...audio,
        audioUrl: supabase.storage
          .from(STORAGE_BUCKETS.MAIN)
          .getPublicUrl(audio.audio_path).data.publicUrl,
      }));

      set({ transitionAudios: audiosWithUrls, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load transition audios',
        isLoading: false,
      });
    }
  },

  loadAllMedia: async () => {
    await get().loadMemes();
    await get().loadTransitionAudios();
  },

  addMeme: async (meme: Omit<Meme, 'id' | 'created_at'>) => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('memes')
        .insert(meme)
        .select()
        .single();

      if (error) throw error;

      // Add public URLs
      const memeWithUrls: Meme = {
        ...data,
        videoUrl: supabase.storage
          .from(STORAGE_BUCKETS.MAIN)
          .getPublicUrl(data.video_path).data.publicUrl,
        thumbnailUrl: supabase.storage
          .from(STORAGE_BUCKETS.MAIN)
          .getPublicUrl(data.thumbnail_path).data.publicUrl,
      };

      set({ memes: [memeWithUrls, ...get().memes] });
      return memeWithUrls;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add meme' });
      return null;
    }
  },

  addTransitionAudio: async (audio: Omit<TransitionAudio, 'id' | 'created_at'>) => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('transition_audio')
        .insert(audio)
        .select()
        .single();

      if (error) throw error;

      // Add public URL
      const audioWithUrl: TransitionAudio = {
        ...data,
        audioUrl: supabase.storage
          .from(STORAGE_BUCKETS.MAIN)
          .getPublicUrl(data.audio_path).data.publicUrl,
      };

      set({ transitionAudios: [audioWithUrl, ...get().transitionAudios] });
      return audioWithUrl;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add transition audio' });
      return null;
    }
  },

  deleteMeme: async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('memes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({ memes: get().memes.filter((m) => m.id !== id) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete meme' });
    }
  },

  deleteTransitionAudio: async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('transition_audio')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({ transitionAudios: get().transitionAudios.filter((a) => a.id !== id) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete transition audio' });
    }
  },

  searchMemes: (query: string, tags?: string[]) => {
    const { memes } = get();
    const lowerQuery = query.toLowerCase();

    return memes.filter((meme) => {
      const nameMatch = meme.name.toLowerCase().includes(lowerQuery);
      const tagMatch = tags?.length
        ? meme.tags.some((tag) => tags.includes(tag))
        : true;

      return nameMatch && tagMatch;
    });
  },

  searchTransitionAudios: (query: string, tags?: string[]) => {
    const { transitionAudios } = get();
    const lowerQuery = query.toLowerCase();

    return transitionAudios.filter((audio) => {
      const nameMatch = audio.name.toLowerCase().includes(lowerQuery);
      const tagMatch = tags?.length
        ? audio.tags.some((tag) => tags.includes(tag))
        : true;

      return nameMatch && tagMatch;
    });
  },

  reset: () => {
    set({
      memes: [],
      transitionAudios: [],
      isLoading: false,
      error: null,
    });
  },
}));
