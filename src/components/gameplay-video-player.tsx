'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlayCircle } from 'lucide-react';

interface GameplayVideoPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  gameTitle: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v');
    } else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (error) {
    console.error('Invalid YouTube URL:', url);
    return null;
  }
}

export function GameplayVideoPlayer({
  open,
  onOpenChange,
  videoUrl,
  gameTitle,
}: GameplayVideoPlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle />
            Gameplay: {gameTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video">
          {embedUrl ? (
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={`YouTube video player for ${gameTitle}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black text-white">
              <p>Invalid or unsupported video URL.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
