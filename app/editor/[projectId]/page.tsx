'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Timeline } from '@/components/timeline/Timeline';
import { ChessBoard } from '@/components/editor/ChessBoard';
import { MoveControls } from '@/components/editor/MoveControls';
import { MemeGallery } from '@/components/editor/MemeGallery';
import { OverlayList } from '@/components/editor/OverlayList';
import { TransitionAudioSelector } from '@/components/editor/TransitionAudioSelector';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from 'sonner';
import type { Meme } from '@/lib/types';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const {
    project,
    moves,
    currentMoveIndex,
    loadProject,
    setCurrentMove,
    addOverlay,
    removeOverlay,
    updateMoveDuration,
    updateTransitionAudio,
  } = useProjectStore();

  const {
    selectedSquare,
    isMemeModalOpen,
    isExporting,
    openMemeModal,
    closeMemeModal,
    startExport,
    finishExport,
  } = useEditorStore();

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  const handleSquareClick = (square: string) => {
    openMemeModal(square);
  };

  const handleSelectMeme = async (meme: Meme) => {
    if (!selectedSquare || !moves[currentMoveIndex]) return;

    try {
      await addOverlay(moves[currentMoveIndex].id, {
        square: selectedSquare,
        meme_id: meme.id,
        start_time_ms: 0,
        scale: 1.0,
        rotation: 0,
      });
      toast.success('Meme added successfully');
    } catch {
      toast.error('Failed to add meme');
    }
  };

  const handleRemoveOverlay = async (overlayId: string) => {
    try {
      await removeOverlay(overlayId);
      toast.success('Meme removed successfully');
    } catch {
      toast.error('Failed to remove meme');
    }
  };

  const handleDurationChange = async (durationMs: number) => {
    const currentMove = moves[currentMoveIndex];
    if (!currentMove) return;

    try {
      await updateMoveDuration(currentMove.id, durationMs);
    } catch {
      toast.error('Failed to update duration');
    }
  };

  const handleTransitionAudioChange = async (audioId: string | null) => {
    const currentMove = moves[currentMoveIndex];
    if (!currentMove) return;

    try {
      await updateTransitionAudio(currentMove.id, audioId);
      toast.success('Transition audio updated');
    } catch {
      toast.error('Failed to update audio');
    }
  };

  const handleExport = async () => {
    startExport();

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to render video');
      }

      const { videoUrl } = await response.json();
      
      // Download the video
      window.open(videoUrl, '_blank');
      toast.success('Video rendered successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export video');
    } finally {
      finishExport();
    }
  };

  if (!project || moves.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  const currentMove = moves[currentMoveIndex];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{project.title}</h1>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Video'}
        </Button>
      </div>

      {/* Timeline */}
      <Timeline
        moves={moves}
        currentMoveIndex={currentMoveIndex}
        onMoveClick={setCurrentMove}
      />

      {/* Main Editor */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Left: Chess Board */}
        <div className="flex items-center justify-center">
          <ChessBoard
            position={currentMove.fen}
            onSquareClick={handleSquareClick}
          />
        </div>

        {/* Right: Controls */}
        <div className="space-y-4 overflow-y-auto">
          {/* Move Controls */}
          <MoveControls
            currentMove={currentMove}
            currentMoveIndex={currentMoveIndex}
            totalMoves={moves.length}
            onPrevious={() => setCurrentMove(currentMoveIndex - 1)}
            onNext={() => setCurrentMove(currentMoveIndex + 1)}
            onDurationChange={handleDurationChange}
          />

          {/* Transition Audio Selector */}
          <div className="p-4 border rounded-lg">
            <TransitionAudioSelector
              value={currentMove.transition_audio_id}
              defaultValue={project.default_transition_audio_id}
              onChange={handleTransitionAudioChange}
            />
          </div>

          {/* Overlay List */}
          <OverlayList
            overlays={currentMove.overlays || []}
            onRemoveOverlay={handleRemoveOverlay}
          />
        </div>
      </div>

      {/* Meme Gallery Modal */}
      <MemeGallery
        isOpen={isMemeModalOpen}
        onClose={closeMemeModal}
        onSelectMeme={handleSelectMeme}
      />
    </div>
  );
}
