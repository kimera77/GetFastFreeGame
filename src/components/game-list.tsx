'use client';

import { useState } from 'react';
import { translations, type Language } from '@/lib/translations';
import { Header } from '@/components/layout/header';
import { GameCard } from '@/components/game-card';
import type { PlatformGames } from '@/lib/game-data';
import { Skeleton } from '@/components/ui/skeleton';

type GameListProps = {
    initialGameData: PlatformGames | null;
    initialError: string | null;
}

export function GameList({ initialGameData, initialError }: GameListProps) {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = translations[language];

  const allGames = initialGameData
    ? Object.entries(initialGameData).flatMap(([platform, games]) =>
        games.map((game) => ({ ...game, platform }))
      )
    : [];
  
  const isLoading = !initialGameData && !initialError;

  return (
    <>
      <Header
        language={language}
        setLanguage={setLanguage}
      />
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-primary uppercase tracking-widest mb-2">
            {t.headerSubtitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 flex flex-col gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : initialError ? (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-lg">
            <p className="font-bold">Oops! Something went wrong.</p>
            <p>{initialError}</p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {allGames.length > 0 ? (
              allGames.map((game, index) => (
                <GameCard
                  key={`${game.platform}-${game.name}-${index}`}
                  game={game}
                  translations={t}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10 bg-card/50 rounded-lg col-span-full">
                <p>No free games found at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
