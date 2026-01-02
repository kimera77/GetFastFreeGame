'use client';

import { useState } from 'react';
import { GameCard, type GameWithImage } from './game-card';
import { GameplayPreviewModal } from './gameplay-preview-modal';

type GameListProps = {
  games: GameWithImage[];
};

export function GameList({ games }: GameListProps) {
  const [selectedGame, setSelectedGame] = useState<GameWithImage | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game, index) => (
          <GameCard
            key={`${game.title}-${index}`}
            game={game}
            onPreviewClick={setSelectedGame}
          />
        ))}
      </div>
      <GameplayPreviewModal
        gameTitle={selectedGame?.title ?? null}
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </>
  );
}
