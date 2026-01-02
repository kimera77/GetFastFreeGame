'use client';

import { useState } from 'react';
import { translations, type Language } from '@/lib/translations';
import { Header } from '@/components/layout/header';
import { GameCard } from '@/components/game-card';
import type { PlatformGames } from '@/lib/game-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { GameplayPreviewModal } from './gameplay-preview-modal';


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
        <div className="text-center my-12">
          <h1 className="text-6xl md:text-8xl font-headline font-bold text-primary uppercase tracking-wider mb-2">
            {t.headerSubtitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 flex flex-col gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : initialError ? (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Games</AlertTitle>
            <AlertDescription>
                <p>Could not retrieve the game list from the API.</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs"><code>{initialError}</code></pre>
            </AlertDescription>
          </Alert>
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
