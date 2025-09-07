import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VideoUpload } from './VideoUpload';
import { VideoPreview } from './VideoPreview';
import { Timeline } from './Timeline';
import { ExportPanel } from './ExportPanel';
import { Play, Pause, Download, Scissors, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  title: string;
  thumbnail?: string;
}

export const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleVideoUpload = useCallback((file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    toast({
      title: "Video Loaded",
      description: "Ready to detect highlights and create clips",
    });
  }, [toast]);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleAutoDetect = async () => {
    if (!videoFile) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Simulate auto-detection progress
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Mock highlight detection - in real implementation, use ffmpeg.wasm
      setTimeout(() => {
        const mockClips: VideoClip[] = [
          { id: '1', startTime: 45, endTime: 105, duration: 60, title: 'Epic Victory Moment' },
          { id: '2', startTime: 180, endTime: 235, duration: 55, title: 'Incredible Play' },
          { id: '3', startTime: 320, endTime: 375, duration: 55, title: 'Clutch Save' },
        ];
        
        setClips(mockClips);
        setProcessingProgress(100);
        setIsProcessing(false);
        
        toast({
          title: "Highlights Detected!",
          description: `Found ${mockClips.length} potential clips`,
        });
      }, 3000);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Detection Failed",
        description: "Failed to detect highlights. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateClip = (startTime: number, endTime: number) => {
    const newClip: VideoClip = {
      id: Date.now().toString(),
      startTime,
      endTime,
      duration: endTime - startTime,
      title: `Clip ${clips.length + 1}`,
    };
    setClips([...clips, newClip]);
    toast({
      title: "Clip Created",
      description: `New ${newClip.duration.toFixed(1)}s clip added`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
            Gaming Shorts Creator
          </h1>
          <p className="text-muted-foreground mt-2">
            Convert your epic gaming moments into viral YouTube Shorts
          </p>
        </div>

        {/* Upload Section */}
        {!videoFile && (
          <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur">
            <VideoUpload onVideoUpload={handleVideoUpload} />
          </Card>
        )}

        {/* Main Editor */}
        {videoFile && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Video Preview */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur">
                <VideoPreview
                  videoUrl={videoUrl}
                  videoRef={videoRef}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              </Card>
              
              {/* Controls */}
              <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                      className="border-gaming-primary/50 hover:bg-gaming-primary/10"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoDetect}
                      disabled={isProcessing}
                      className="border-gaming-secondary/50 hover:bg-gaming-secondary/10"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Auto-Detect Highlights
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gaming-secondary">Detecting highlights...</span>
                      <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                )}
              </Card>
              
              {/* Timeline */}
              <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur">
                <Timeline
                  duration={duration}
                  currentTime={currentTime}
                  clips={clips}
                  onSeek={(time) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                      setCurrentTime(time);
                    }
                  }}
                  onCreateClip={handleCreateClip}
                />
              </Card>
            </div>

            {/* Export Panel */}
            <div className="space-y-4">
              <ExportPanel
                clips={clips}
                selectedClip={selectedClip}
                onSelectClip={setSelectedClip}
                onDeleteClip={(clipId) => {
                  setClips(clips.filter(clip => clip.id !== clipId));
                  if (selectedClip?.id === clipId) {
                    setSelectedClip(null);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};