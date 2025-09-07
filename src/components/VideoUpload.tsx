import { useCallback } from 'react';
import { Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
}

export const VideoUpload = ({ onVideoUpload }: VideoUploadProps) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoUpload(file);
    }
  }, [onVideoUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onVideoUpload(file);
    }
  }, [onVideoUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="p-8">
      <div
        className="border-2 border-dashed border-gaming-primary/30 rounded-lg p-12 text-center hover:border-gaming-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-gaming-primary/5 to-gaming-secondary/5"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Video className="h-16 w-16 mx-auto mb-4 text-gaming-primary" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Upload Your Gaming Video
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Drag and drop your gaming video here, or click to browse. 
          Supports MP4, MOV, AVI and other common formats.
        </p>
        
        <div className="space-y-4">
          <Button
            className="bg-gradient-gaming hover:shadow-gaming transition-all duration-300"
            onClick={() => document.getElementById('video-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Video File
          </Button>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Maximum file size: 2GB</p>
            <p>• Recommended: 1080p or higher resolution</p>
            <p>• Best results with clear audio for highlight detection</p>
          </div>
        </div>
        
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};