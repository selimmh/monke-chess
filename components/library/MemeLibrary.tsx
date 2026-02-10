'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Upload } from 'lucide-react';
import { useMediaStore } from '@/stores/mediaStore';
import { toast } from 'sonner';

export function MemeLibrary() {
  const { memes, loadMemes, deleteMeme } = useMediaStore();
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const response = await fetch('/api/memes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload meme');
      }

      toast.success('Meme uploaded successfully');
      e.currentTarget.reset();
      setUploadDialogOpen(false);
      await loadMemes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload meme');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meme?')) return;

    try {
      const response = await fetch(`/api/memes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meme');
      }

      await deleteMeme(id);
      toast.success('Meme deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete meme');
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Meme
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Meme</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="video">Video File (MP4, WebM)</Label>
              <Input
                id="video"
                name="video"
                type="file"
                accept="video/mp4,video/webm"
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
                placeholder="Shocked Cat"
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
                defaultValue={3000}
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
                placeholder="shocked, surprised, funny"
                className="mt-1"
              />
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
                {uploading ? 'Uploading...' : 'Upload Meme'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Meme Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Meme Library ({memes.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memes.map((meme) => (
            <Card key={meme.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {meme.videoUrl ? (
                  <video
                    src={meme.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🎭</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate">{meme.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(meme.duration_ms / 1000).toFixed(1)}s
                </div>
                {meme.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meme.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-secondary px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(meme.id)}
                  className="w-full mt-2 text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
