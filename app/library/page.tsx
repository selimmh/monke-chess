'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemeLibrary } from '@/components/library/MemeLibrary';
import { AudioLibrary } from '@/components/library/AudioLibrary';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LibraryPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Media Library</h1>
      </div>

      <Tabs defaultValue="memes" className="w-full">
        <TabsList>
          <TabsTrigger value="memes">Memes</TabsTrigger>
          <TabsTrigger value="audio">Transition Audio</TabsTrigger>
        </TabsList>
        <TabsContent value="memes" className="mt-6">
          <MemeLibrary />
        </TabsContent>
        <TabsContent value="audio" className="mt-6">
          <AudioLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
