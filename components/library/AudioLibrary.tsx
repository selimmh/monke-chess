'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Upload, Volume2 } from 'lucide-react';
import { useMediaStore } from '@/stores/mediaStore';
import { toast } from 'sonner';

export function AudioLibrary() {
  const { transitionAudios, loadTransitionAudios, deleteTransitionAudio } = useMediaStore();
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadTransitionAudios();
  }, [loadTransitionAudios]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const response = await fetch('/api/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio');
      }

      toast.success('Transition audio uploaded successfully');
      e.currentTarget.reset();
      setUploadDialogOpen(false);
      await loadTransitionAudios();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload audio');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audio?')) return;

    try {
      const response = await fetch(`/api/audio?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete audio');
      }

      await deleteTransitionAudio(id);
      toast.success('Audio deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete audio');
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Transition Audio
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Transition Audio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="audio">Audio File (MP3, WAV)</Label>
              <Input
                id="audio"
                name="audio"
                type="file"
                accept="audio/mp3,audio/wav,audio/mpeg"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Whoosh"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration_ms">Duration (milliseconds)</Label>
              <Input
                id="duration_ms"
                name="duration_ms"
                type="number"
                defaultValue={1000}
                min={100}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                type="text"
                placeholder="whoosh, movement, fast"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_default" name="is_default" value="true" />
              <Label htmlFor="is_default" className="cursor-pointer">
                Set as default transition audio
              </Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Audio'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Audio List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Transition Audio Library ({transitionAudios.length})
        </h3>
        <div className="space-y-2">
          {transitionAudios.map((audio) => (
            <Card key={audio.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{audio.name}</span>
                    {audio.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Duration: {(audio.duration_ms / 1000).toFixed(1)}s
                  </div>
                  {audio.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {audio.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-secondary px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(audio.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
