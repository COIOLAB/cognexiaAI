'use client';

import { useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CallRecording } from '@/types/api.types';
import { Rewind, FastForward, Download } from 'lucide-react';

interface CallRecordingPlayerProps {
  recordings: CallRecording[];
}

export default function CallRecordingPlayer({ recordings }: CallRecordingPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState('1.0');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = useMemo(() => recordings[currentIndex], [recordings, currentIndex]);
  const src = current?.url || current?.storageUrl || '';

  const seek = (delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta));
  };

  const handleSpeedChange = (val: string) => {
    setSpeed(val);
    if (audioRef.current) audioRef.current.playbackRate = parseFloat(val);
  };

  if (!recordings || recordings.length === 0) {
    return <div className="text-sm text-muted-foreground">No recordings</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Recording {current.id.slice(0, 8)}</div>
            <div className="text-sm text-muted-foreground">
              {(current.duration || 0) > 0 ? `${Math.floor((current.duration || 0) / 60)}:${((current.duration || 0) % 60).toString().padStart(2, '0')}` : 'Unknown length'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={src} download>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
            {recordings.length > 1 && (
              <Select value={String(currentIndex)} onValueChange={(v) => setCurrentIndex(parseInt(v))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select recording" />
                </SelectTrigger>
                <SelectContent>
                  {recordings.map((r, i) => (
                    <SelectItem key={r.id} value={String(i)}>
                      #{i + 1} {r.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => seek(-10)}>
            <Rewind className="h-4 w-4" />
          </Button>
          <audio ref={audioRef} src={src} controls className="w-full" />
          <Button variant="ghost" size="sm" onClick={() => seek(10)}>
            <FastForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Speed</span>
          <Select value={speed} onValueChange={handleSpeedChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="1.0x" />
            </SelectTrigger>
            <SelectContent>
              {['0.75', '1.0', '1.25', '1.5', '2.0'].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
