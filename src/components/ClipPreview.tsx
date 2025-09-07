import { useState, useRef } from 'react';
import { ProcessedClip } from '@/hooks/useFFmpeg';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';

interface ClipPreviewProps {
  clip: ProcessedClip;
  onDownload: (clip: ProcessedClip) => void;
}

export const ClipPreview = ({ clip, onDownload }: ClipPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur overflow-hidden">
      <div className="relative">
        {/* Video Container - Vertical aspect ratio for YouTube Shorts */}
        <div className="relative aspect-[9/16] bg-black rounded-t-lg overflow-hidden max-h-96">
          <video
            ref={videoRef}
            src={clip.url}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            playsInline
            muted={isMuted}
          />
          
          {/* Video Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20">
            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 border-2 border-white/20 backdrop-blur-sm"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white ml-1" />
                )}
              </Button>
            </div>
            
            {/* Top Controls */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMuteToggle}
                className="w-8 h-8 p-0 rounded-full bg-black/50 hover:bg-black/70 border border-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
            
            {/* Bottom Info */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center justify-between text-white text-sm">
                <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                  {formatTime(currentTime)} / {formatTime(clip.duration)}
                </Badge>
                <Badge variant="secondary" className="bg-gaming-primary/80 text-white">
                  9:16 • {clip.duration}s
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Gaming corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gaming-primary rounded-tl" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gaming-primary rounded-br" />
        </div>
        
        {/* Clip Information */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">{clip.title}</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for YouTube Shorts • {clip.duration}s duration
            </p>
          </div>
          
          {/* Download Button */}
          <Button
            onClick={() => onDownload(clip)}
            className="w-full bg-gradient-gaming hover:shadow-gaming transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Short
          </Button>
          
          {/* Quality Info */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1080×1920 • MP4</span>
            <span>Ready for upload</span>
          </div>
        </div>
      </div>
    </Card>
  );
};