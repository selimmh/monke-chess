'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useMediaStore } from '@/stores/mediaStore';
import type { Meme } from '@/lib/types';

interface MemeGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMeme: (meme: Meme) => void;
}

export function MemeGallery({ isOpen, onClose, onSelectMeme }: MemeGalleryProps) {
  const { memes, loadMemes, searchMemes } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMemes, setFilteredMemes] = useState<Meme[]>([]);

  useEffect(() => {
    if (isOpen && memes.length === 0) {
      loadMemes();
    }
  }, [isOpen, memes.length, loadMemes]);

  useEffect(() => {
    const filtered = searchQuery.trim() ? searchMemes(searchQuery) : memes;
    setFilteredMemes(filtered);
  }, [searchQuery, memes, searchMemes]);

  const handleSelectMeme = (meme: Meme) => {
    onSelectMeme(meme);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Meme</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search memes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Meme Grid */}
        <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[50vh]">
          {filteredMemes.length === 0 ? (
            <div className="col-span-3 text-center text-muted-foreground py-8">
              {memes.length === 0 ? 'No memes uploaded yet' : 'No memes found'}
            </div>
          ) : (
            filteredMemes.map((meme) => (
              <div
                key={meme.id}
                className="relative aspect-square border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
                onClick={() => handleSelectMeme(meme)}
              >
                {meme.thumbnailUrl ? (
                  <img
                    src={meme.thumbnailUrl}
                    alt={meme.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-4xl">🎭</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {meme.name}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload hint */}
        {memes.length === 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Upload memes from the Media Library page
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
