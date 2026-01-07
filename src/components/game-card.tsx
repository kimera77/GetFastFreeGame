'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/icons/platform-icon';
import type { Game } from '@/lib/game';
import { CalendarClock, PlayCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { GameplayVideoPlayer } from './gameplay-video-player';

type GameCardProps = {
  game: Game & { platform: string };
  translations: {
    getGame: string;
  };
};

export function GameCard({ game, translations }: GameCardProps) {
  const [isVideoPlayerOpen, setVideoPlayerOpen] = useState(false);

  let formattedEndDate: string | null = null;
  if (game.endDate && game.endDate.trim() !== '') {
    try {
      const parsedDate = parseISO(game.endDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedEndDate = format(parsedDate, 'd MMMM yyyy');
      }
    } catch (error) {
      console.error(`Invalid date value for game "${game.name}":`, game.endDate);
    }
  }

  return (
    <>
      <Card className="flex flex-col sm:flex-row items-center p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 bg-card/80 backdrop-blur-sm border-border/30 w-full group">
        <div className="flex-shrink-0 w-full sm:w-48 h-32 sm:h-24 relative mb-4 sm:mb-0 sm:mr-4">
            <Image
              src={game.cover_image}
              alt={`Cover art for ${game.name}`}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
              className="object-cover rounded-md"
            />
          </div>
        <div className="flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div className="flex-grow">
            <h2 className="text-xl font-bold font-title text-foreground group-hover:text-primary transition-colors mb-1">
              {game.name}
            </h2>
            <div className="flex items-center gap-2">
              <PlatformIcon platform={game.platform} className="h-8 w-8" />
              <span className="text-sm font-semibold text-muted-foreground">{game.platform}</span>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
            <div className="flex items-center justify-end gap-2">
              {game.original_price && game.original_price.trim() !== '' && (
                <span className="text-sm text-muted-foreground line-through">
                  {game.original_price}
                </span>
              )}
              <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold">
                <a href={game.game_link} target="_blank" rel="noopener noreferrer">
                  {translations.getGame}
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-end gap-4 w-full">
              {formattedEndDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>{formattedEndDate}</span>
                </div>
              )}
              {game.gameplay_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVideoPlayerOpen(true)}
                  disabled={!game.gameplay_url}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Gameplay
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      {game.gameplay_url && (
        <GameplayVideoPlayer
          open={isVideoPlayerOpen}
          onOpenChange={setVideoPlayerOpen}
          videoUrl={game.gameplay_url}
          gameTitle={game.name}
        />
      )}
    </>
  );
}
