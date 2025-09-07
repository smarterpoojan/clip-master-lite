import { useState } from 'react';
import { VideoClip } from './VideoEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Trash2, Play, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportPanelProps {
  clips: VideoClip[];
  selectedClip: VideoClip | null;
  onSelectClip: (clip: VideoClip | null) => void;
  onDeleteClip: (clipId: string) => void;
}

export const ExportPanel = ({ 
  clips, 
  selectedClip, 
  onSelectClip, 
  onDeleteClip 
}: ExportPanelProps) => {
  const [exportProgress, setExportProgress] = useState<Record<string, number>>({});
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleExportClip = async (clip: VideoClip) => {
    setIsExporting(prev => ({ ...prev, [clip.id]: true }));
    setExportProgress(prev => ({ ...prev, [clip.id]: 0 }));

    try {
      // Simulate export progress
      const interval = setInterval(() => {
        setExportProgress(prev => {
          const current = prev[clip.id] || 0;
          if (current >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [clip.id]: current + 10 };
        });
      }, 200);

      // Mock export completion
      setTimeout(() => {
        setIsExporting(prev => ({ ...prev, [clip.id]: false }));
        setExportProgress(prev => ({ ...prev, [clip.id]: 100 }));
        
        // In real implementation, this would trigger actual download
        toast({
          title: "Export Complete!",
          description: `${clip.title} exported as YouTube Short`,
        });

        // Reset progress after showing completion
        setTimeout(() => {
          setExportProgress(prev => {
            const updated = { ...prev };
            delete updated[clip.id];
            return updated;
          });
        }, 2000);
      }, 2000);
    } catch (error) {
      setIsExporting(prev => ({ ...prev, [clip.id]: false }));
      toast({
        title: "Export Failed",
        description: "Failed to export clip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-gaming-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Download className="h-5 w-5 text-gaming-secondary" />
          Export Clips ({clips.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No clips created yet</p>
            <p className="text-sm">Use auto-detect or create clips manually</p>
          </div>
        ) : (
          clips.map((clip) => (
            <div
              key={clip.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedClip?.id === clip.id
                  ? 'border-gaming-primary bg-gaming-primary/10'
                  : 'border-border hover:border-gaming-primary/50'
              }`}
              onClick={() => onSelectClip(clip)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{clip.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(clip.duration)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Preview functionality
                    }}
                    className="h-8 w-8 p-0 hover:bg-gaming-secondary/20"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Export Progress */}
              {exportProgress[clip.id] !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gaming-secondary">
                      {exportProgress[clip.id] === 100 ? 'Complete!' : 'Exporting...'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {exportProgress[clip.id]}%
                    </span>
                  </div>
                  <Progress value={exportProgress[clip.id]} className="h-1" />
                </div>
              )}
              
              {/* Export Button */}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportClip(clip);
                }}
                disabled={isExporting[clip.id] || clip.duration < 5 || clip.duration > 60}
                className="w-full bg-gradient-gaming hover:shadow-gaming transition-all duration-300"
              >
                <Download className="h-3 w-3 mr-2" />
                {isExporting[clip.id] ? 'Exporting...' : 'Export as Short'}
              </Button>
              
              {/* Validation warnings */}
              {clip.duration < 5 && (
                <p className="text-xs text-gaming-warning mt-2">
                  ⚠️ Too short for YouTube Shorts (min 5s)
                </p>
              )}
              {clip.duration > 60 && (
                <p className="text-xs text-gaming-warning mt-2">
                  ⚠️ Too long for YouTube Shorts (max 60s)
                </p>
              )}
            </div>
          ))
        )}
        
        {clips.length > 0 && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full border-gaming-accent/50 hover:bg-gaming-accent/10"
              onClick={() => {
                clips.forEach(clip => {
                  if (clip.duration >= 5 && clip.duration <= 60) {
                    handleExportClip(clip);
                  }
                });
              }}
            >
              Export All Valid Clips
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};