import { RefObject } from 'react';

interface VideoPreviewProps {
  videoUrl: string;
  videoRef: RefObject<HTMLVideoElement>;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
}

export const VideoPreview = ({ 
  videoUrl, 
  videoRef, 
  onTimeUpdate, 
  onLoadedMetadata 
}: VideoPreviewProps) => {
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        controls={false}
      />
      
      {/* Overlay for mobile/touch controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      {/* Gaming-style corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gaming-primary rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gaming-primary rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gaming-primary rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gaming-primary rounded-br" />
    </div>
  );
};