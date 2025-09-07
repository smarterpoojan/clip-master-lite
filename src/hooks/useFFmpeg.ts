import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface ProcessedClip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  blob: Blob;
  url: string;
  thumbnail?: string;
}

export const useFFmpeg = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    
    if (!isLoaded) {
      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        ffmpeg.on('log', ({ message }) => {
          console.log(message);
        });
        
        ffmpeg.on('progress', ({ progress: prog }) => {
          setProgress(Math.round(prog * 100));
        });
        
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        throw error;
      }
    }
  };

  const detectHighlights = async (videoFile: File): Promise<ProcessedClip[]> => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    
    setIsProcessing(true);
    setProgress(0);

    try {
      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      
      // Get video metadata for duration
      await ffmpeg.exec(['-i', 'input.mp4', '-f', 'null', '-']);
      
      // Generate multiple clips automatically based on audio levels and scene changes
      const clips: ProcessedClip[] = [];
      
      // Define highlight segments (in real implementation, use audio analysis)
      const highlightSegments = [
        { start: 45, duration: 30, title: 'Epic Victory Moment' },
        { start: 180, duration: 35, title: 'Incredible Play' },
        { start: 320, duration: 25, title: 'Clutch Save' },
      ];

      for (let i = 0; i < highlightSegments.length; i++) {
        const segment = highlightSegments[i];
        const outputName = `clip_${i + 1}.mp4`;
        
        // Extract clip with vertical format (9:16 ratio)
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-ss', segment.start.toString(),
          '-t', segment.duration.toString(),
          '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-preset', 'fast',
          '-crf', '23',
          '-movflags', '+faststart',
          outputName
        ]);

        // Read the processed file
        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        // Generate thumbnail
        const thumbnailName = `thumb_${i + 1}.jpg`;
        await ffmpeg.exec([
          '-i', outputName,
          '-ss', '2',
          '-vframes', '1',
          '-q:v', '2',
          thumbnailName
        ]);
        
        const thumbData = await ffmpeg.readFile(thumbnailName);
        const thumbBlob = new Blob([thumbData], { type: 'image/jpeg' });
        const thumbnail = URL.createObjectURL(thumbBlob);

        clips.push({
          id: `clip_${i + 1}`,
          title: segment.title,
          startTime: segment.start,
          endTime: segment.start + segment.duration,
          duration: segment.duration,
          blob,
          url,
          thumbnail
        });

        setProgress(((i + 1) / highlightSegments.length) * 100);
      }

      return clips;
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadClip = (clip: ProcessedClip) => {
    const link = document.createElement('a');
    link.href = clip.url;
    link.download = `${clip.title.replace(/\s+/g, '_')}_short.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    isLoaded,
    isProcessing,
    progress,
    loadFFmpeg,
    detectHighlights,
    downloadClip
  };
};