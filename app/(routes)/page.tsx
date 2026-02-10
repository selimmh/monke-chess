'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Film, Library, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Project } from '@/lib/types';
import { generateProjectTitle } from '@/lib/chess-utils';

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to load projects');
      const data = await response.json();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const pgn = formData.get('pgn') as string;
      let title = formData.get('title') as string;

      // Auto-generate title if not provided
      if (!title.trim()) {
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
      setIsCreateDialogOpen(false);
      router.push(`/editor/${project.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      toast.success('Project deleted successfully');
      loadProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const pgn = event.target?.result as string;
      const textareaElement = document.getElementById('pgn') as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.value = pgn;
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Monke Chess</h1>
              <p className="text-muted-foreground mt-2">
                Transform chess games into engaging meme videos
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/library')}
              >
                <Library className="h-4 w-4 mr-2" />
                Media Library
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                      <Label htmlFor="title">
                        Project Title (optional - will auto-generate from PGN)
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Magnus vs Hikaru"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pgn">PGN</Label>
                      <Textarea
                        id="pgn"
                        name="pgn"
                        required
                        rows={10}
                        placeholder="Paste PGN here..."
                        className="mt-1 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pgn-file">Or import PGN file</Label>
                      <Input
                        id="pgn-file"
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
                        onClick={() => setIsCreateDialogOpen(false)}
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
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first project to start making chess meme videos
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Your Projects ({projects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/editor/${project.id}`)}
                        className="flex-1"
                      >
                        Open Editor
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
