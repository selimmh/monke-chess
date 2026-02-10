'use client';

import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMediaStore } from '@/stores/mediaStore';

interface TransitionAudioSelectorProps {
  value: string | null;
  defaultValue: string | null;
  onChange: (audioId: string | null) => void;
}

export function TransitionAudioSelector({
  value,
  defaultValue,
  onChange,
}: TransitionAudioSelectorProps) {
  const { transitionAudios, loadTransitionAudios } = useMediaStore();

  useEffect(() => {
    if (transitionAudios.length === 0) {
      loadTransitionAudios();
    }
  }, [transitionAudios.length, loadTransitionAudios]);

  const currentValue = value || defaultValue || 'none';

  return (
    <div>
      <Label htmlFor="transition-audio">Transition Audio</Label>
      <Select
        value={currentValue}
        onValueChange={(val) => onChange(val === 'none' ? null : val)}
      >
        <SelectTrigger id="transition-audio" className="mt-1">
          <SelectValue placeholder="Select transition audio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            {defaultValue ? 'Use Project Default' : 'None'}
          </SelectItem>
          {transitionAudios.map((audio) => (
            <SelectItem key={audio.id} value={audio.id}>
              {audio.name} {audio.is_default && '(Default)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === null && defaultValue && (
        <p className="text-xs text-muted-foreground mt-1">
          Using project default audio
        </p>
      )}
    </div>
  );
}
