'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/icons/platform-icon';
import type { Game } from '@/lib/game';

type GameCardProps = {
  game: Game & { platform: string };
  translations: {
    getGame: string;
  };
};

export function GameCard({ game, translations }: GameCardProps) {
  return (
    <Card className="flex flex-col sm:flex-row items-center p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 bg-card/80 backdrop-blur-sm border-border/30 w-full group">
      <div className="flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div className="flex-grow flex items-center gap-4">
           <PlatformIcon platform={game.platform} className="h-10 w-10" />
           <div>
            <h2 className="text-md sm:text-lg font-headline font-bold text-foreground group-hover:text-primary transition-colors mb-1">
              {game.name}
            </h2>
            <span className="text-sm font-semibold text-muted-foreground">{game.platform}</span>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center justify-end gap-4 w-full sm:w-auto mt-3 sm:mt-0">
           {game.original_price && game.original_price.trim() !== '' && (
              <span className="text-sm text-muted-foreground line-through">
                {game.original_price}
              </span>
            )}
           <Button asChild variant="default" size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-primary-foreground font-bold">
            <a href={game.game_link} target="_blank" rel="noopener noreferrer">
              {translations.getGame}
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
