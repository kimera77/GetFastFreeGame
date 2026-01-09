'use client';

import { useState } from 'react';
import { translations, type Language } from '@/lib/translations';
import { Header } from '@/components/layout/header';
import { GameCard } from '@/components/game-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { Game } from '@/lib/game';


type GameListProps = {
  allGames: Game[];
  error?: string | null;
}

export function GameList({ allGames, error }: GameListProps) {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

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

        {error ? (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Games</AlertTitle>
            <AlertDescription>
                <p>Could not retrieve the game list from the API.</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs"><code>{error}</code></pre>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {allGames.length > 0 ? (
              allGames.map((game, index) => (
                <GameCard
                  key={`${game.platform}-${game.name}-${index}`}
                  game={game as Game & { platform: string }}
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

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            <em>
              * {t.aiDisclaimer.p1}
              <strong className="font-semibold">{t.aiDisclaimer.email}</strong>
              {t.aiDisclaimer.p2}
            </em>
          </p>
        </div>
      </div>
    </>
  );
}
