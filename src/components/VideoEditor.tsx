import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VideoUpload } from './VideoUpload';
import { VideoPreview } from './VideoPreview';
import { ClipPreview } from './ClipPreview';
import { Zap, Sparkles, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFFmpeg, ProcessedClip } from '@/hooks/useFFmpeg';

export const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [processedClips, setProcessedClips] = useState<ProcessedClip[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { isLoaded, isProcessing, progress, detectHighlights, downloadClip } = useFFmpeg();

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
    
    try {
      toast({
        title: "Processing Video",
        description: "Analyzing your video for epic moments...",
      });

      const clips = await detectHighlights(videoFile);
      setProcessedClips(clips);
      
      toast({
        title: "Highlights Generated!",
        description: `Created ${clips.length} YouTube Shorts ready for download`,
      });
    } catch (error) {
      console.error('Error processing video:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadClip = (clip: ProcessedClip) => {
    downloadClip(clip);
    toast({
      title: "Download Started",
      description: `${clip.title} is downloading...`,
    });
  };

  const handleDownloadAll = () => {
    processedClips.forEach((clip, index) => {
      setTimeout(() => {
        downloadClip(clip);
      }, index * 500); // Stagger downloads
    });
    
    toast({
      title: "Downloading All Clips",
      description: `${processedClips.length} shorts are downloading...`,
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
        {videoFile && !isProcessing && processedClips.length === 0 && (
          <div className="space-y-6">
            {/* Original Video Preview */}
            <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur">
              <VideoPreview
                videoUrl={videoUrl}
                videoRef={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
            </Card>
            
            {/* AI Processing Controls */}
            <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur p-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">AI Highlight Detection</h3>
                  <p className="text-muted-foreground">
                    Our AI will automatically detect epic moments and create optimized YouTube Shorts
                  </p>
                </div>
                
                <Button
                  size="lg"
                  onClick={handleAutoDetect}
                  disabled={isProcessing || !isLoaded}
                  className="bg-gradient-gaming hover:shadow-gaming transition-all duration-300 px-8 py-6 text-lg"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  {!isLoaded ? 'Loading AI...' : 'Generate Shorts'}
                </Button>
                
                <div className="grid grid-cols-3 gap-4 mt-6 text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gaming-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-4 w-4 text-gaming-primary" />
                    </div>
                    <p>Audio Analysis</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gaming-secondary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="h-4 w-4 text-gaming-secondary" />
                    </div>
                    <p>Scene Detection</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gaming-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Download className="h-4 w-4 text-gaming-accent" />
                    </div>
                    <p>9:16 Format</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-gaming rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Processing Your Video</h3>
                <p className="text-muted-foreground">AI is analyzing and creating your YouTube Shorts...</p>
              </div>
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gaming-secondary">Processing...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </div>
          </Card>
        )}

        {/* Generated Clips */}
        {processedClips.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your YouTube Shorts</h2>
                <p className="text-muted-foreground">
                  {processedClips.length} clips generated and ready for download
                </p>
              </div>
              
              {processedClips.length > 1 && (
                <Button
                  variant="outline"
                  onClick={handleDownloadAll}
                  className="border-gaming-accent/50 hover:bg-gaming-accent/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All ({processedClips.length})
                </Button>
              )}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processedClips.map((clip) => (
                <ClipPreview
                  key={clip.id}
                  clip={clip}
                  onDownload={handleDownloadClip}
                />
              ))}
            </div>
            
            {/* Generate More Button */}
            <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Want More Clips?</h3>
                <p className="text-muted-foreground">
                  Upload a new video or regenerate with different settings
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoUrl('');
                    setProcessedClips([]);
                  }}
                  className="border-gaming-primary/50 hover:bg-gaming-primary/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upload New Video
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};