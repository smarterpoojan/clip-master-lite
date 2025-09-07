import { useState, useRef, useCallback } from 'react';
import { VideoClip } from './VideoEditor';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  clips: VideoClip[];
  onSeek: (time: number) => void;
  onCreateClip: (startTime: number, endTime: number) => void;
}

export const Timeline = ({ 
  duration, 
  currentTime, 
  clips, 
  onSeek, 
  onCreateClip 
}: TimelineProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(duration, position * duration));
  }, [duration]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const time = getTimeFromPosition(e.clientX);
    setIsSelecting(true);
    setSelectionStart(time);
    setSelectionEnd(time);
    onSeek(time);
  }, [getTimeFromPosition, onSeek]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting) return;
    const time = getTimeFromPosition(e.clientX);
    setSelectionEnd(time);
  }, [isSelecting, getTimeFromPosition]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  const handleCreateClip = useCallback(() => {
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    
    if (end - start > 5 && end - start <= 60) { // Min 5s, max 60s for YouTube Shorts
      onCreateClip(start, end);
      setSelectionStart(0);
      setSelectionEnd(0);
    }
  }, [selectionStart, selectionEnd, onCreateClip]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentPosition = duration > 0 ? (currentTime / duration) * 100 : 0;
  const selectionStartPos = duration > 0 ? (Math.min(selectionStart, selectionEnd) / duration) * 100 : 0;
  const selectionWidth = duration > 0 ? (Math.abs(selectionEnd - selectionStart) / duration) * 100 : 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
        {selectionWidth > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Selection: {formatTime(Math.abs(selectionEnd - selectionStart))}
            </span>
            <Button
              size="sm"
              onClick={handleCreateClip}
              disabled={Math.abs(selectionEnd - selectionStart) < 5 || Math.abs(selectionEnd - selectionStart) > 60}
              className="bg-gaming-accent hover:bg-gaming-accent/80"
            >
              <Scissors className="h-3 w-3 mr-1" />
              Create Clip
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Timeline track */}
        <div
          ref={timelineRef}
          className="relative h-12 bg-muted rounded-lg cursor-pointer border border-gaming-primary/20"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Existing clips */}
          {clips.map((clip) => {
            const clipStartPos = (clip.startTime / duration) * 100;
            const clipWidth = (clip.duration / duration) * 100;
            return (
              <div
                key={clip.id}
                className="absolute top-1 bottom-1 bg-gaming-secondary/60 rounded border border-gaming-secondary"
                style={{
                  left: `${clipStartPos}%`,
                  width: `${clipWidth}%`,
                }}
              >
                <div className="text-xs text-white p-1 truncate font-medium">
                  {clip.title}
                </div>
              </div>
            );
          })}

          {/* Selection area */}
          {selectionWidth > 0 && (
            <div
              className="absolute top-0 bottom-0 bg-gaming-accent/30 border border-gaming-accent rounded"
              style={{
                left: `${selectionStartPos}%`,
                width: `${selectionWidth}%`,
              }}
            />
          )}

          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gaming-primary shadow-glow-gaming"
            style={{ left: `${currentPosition}%` }}
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-gaming-primary rounded-full border-2 border-background" />
          </div>
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Click and drag to select a portion of the video</p>
        <p>• Clips must be 5-60 seconds for YouTube Shorts</p>
        <p>• Use auto-detect or create clips manually</p>
      </div>
    </div>
  );
};
