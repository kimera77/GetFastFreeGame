'use client';

import { GameCard } from './game-card';
import type { Game } from '@/lib/game';


type GameListProps = {
  games: (Game & {platform: string})[];
  translations: {
    getGame: string;
  };
};

export function GameList({ games, translations }: GameListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {games.map((game, index) => (
        <GameCard
          key={`${game.name}-${index}`}
          game={game}
          translations={translations}
        />
      ))}
    </div>
  );
}
