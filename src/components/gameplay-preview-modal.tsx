'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getGameplayVideo } from '@/app/actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type GameplayPreviewModalProps = {
  gameTitle: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function GameplayPreviewModal({ gameTitle, isOpen, onClose }: GameplayPreviewModalProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && gameTitle) {
      setIsLoading(true);
      setError(null);
      setVideoId(null);

      const fetchVideo = async () => {
        const result = await getGameplayVideo(gameTitle);
        if (result.success) {
          setVideoId(result.videoId);
        } else {
          setError(result.error);
        }
        setIsLoading(false);
      };

      fetchVideo();
    }
  }, [isOpen, gameTitle]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-headline text-2xl">{gameTitle}</DialogTitle>
          <DialogDescription>Gameplay Preview</DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full px-6 pb-6">
          {isLoading && (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted p-4">
              <Alert variant="destructive" className="border-0">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {videoId && (
            <iframe
              className="h-full w-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
