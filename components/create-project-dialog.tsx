'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { generateProjectTitle } from '@/lib/chess-utils';

type CreateProjectContextValue = {
  openCreateProject: () => void;
};

const CreateProjectContext = createContext<CreateProjectContextValue | null>(
  null
);

export function useCreateProject() {
  const ctx = useContext(CreateProjectContext);
  if (!ctx) {
    throw new Error('useCreateProject must be used within CreateProjectProvider');
  }
  return ctx;
}

export function CreateProjectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const openCreateProject = useCallback(() => setOpen(true), []);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const pgn = formData.get('pgn') as string;
      let title = formData.get('title') as string;

      if (!title?.trim()) {
        title = generateProjectTitle(pgn);
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, pgn }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const project = await response.json();
      toast.success('Project created successfully');
      setOpen(false);
      router.push(`/dashboard/editor/${project.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create project'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const pgn = event.target?.result as string;
      const el = document.getElementById(
        'create-project-pgn'
      ) as HTMLTextAreaElement;
      if (el) el.value = pgn;
    };
    reader.readAsText(file);
  };

  return (
    <CreateProjectContext.Provider value={{ openCreateProject }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <Label htmlFor="create-project-title">
                Project Title (optional - will auto-generate from PGN)
              </Label>
              <Input
                id="create-project-title"
                name="title"
                type="text"
                placeholder="Magnus vs Hikaru"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="create-project-pgn">PGN</Label>
              <Textarea
                id="create-project-pgn"
                name="pgn"
                required
                rows={10}
                placeholder="Paste PGN here..."
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="create-project-pgn-file">Or import PGN file</Label>
              <Input
                id="create-project-pgn-file"
                type="file"
                accept=".pgn"
                onChange={handleImportFile}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CreateProjectContext.Provider>
  );
}
