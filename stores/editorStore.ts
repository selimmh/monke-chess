import { create } from 'zustand';

interface EditorStore {
  // UI State
  selectedSquare: string | null;
  isMemeModalOpen: boolean;
  isExporting: boolean;
  exportProgress: number;
  
  // Actions
  setSelectedSquare: (square: string | null) => void;
  openMemeModal: (square: string) => void;
  closeMemeModal: () => void;
  startExport: () => void;
  updateExportProgress: (progress: number) => void;
  finishExport: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  // Initial state
  selectedSquare: null,
  isMemeModalOpen: false,
  isExporting: false,
  exportProgress: 0,

  setSelectedSquare: (square: string | null) => {
    set({ selectedSquare: square });
  },

  openMemeModal: (square: string) => {
    set({ selectedSquare: square, isMemeModalOpen: true });
  },

  closeMemeModal: () => {
    set({ isMemeModalOpen: false });
  },

  startExport: () => {
    set({ isExporting: true, exportProgress: 0 });
  },

  updateExportProgress: (progress: number) => {
    set({ exportProgress: progress });
  },

  finishExport: () => {
    set({ isExporting: false, exportProgress: 0 });
  },

  reset: () => {
    set({
      selectedSquare: null,
      isMemeModalOpen: false,
      isExporting: false,
      exportProgress: 0,
    });
  },
}));
