'use client';

import { useState, useEffect } from 'react';
import { translations, type Language } from '@/lib/translations';
import { Header } from '@/components/layout/header';
import { GameCard } from '@/components/game-card';
import type { PlatformGames } from '@/lib/game-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { DebugInfo } from '@/components/debug-info';
import type { FetchGamesResult } from '@/ai/flows/fetch-and-cache-free-games';

type ApiGame = {
  name: string;
  platform: string;
  game_link: string;
  cover_image: string;
  original_price?: string;
  endDate?: string;
  gameplay_url?: string;
};

export function GameList() {
  const [language, setLanguage] = useState<Language>('en');
  const [gameData, setGameData] = useState<PlatformGames | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Omit<FetchGamesResult, 'games'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const t = translations[language];

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/games');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result: FetchGamesResult = await response.json();
        
        const gamesWithData: ApiGame[] = result.games.map((game) => ({
          name: game.title,
          platform: game.platform,
          game_link: game.dealLink,
          cover_image: game.imageURL,
          original_price: game.original_price,
          endDate: game.endDate,
          gameplay_url: game.gameplay,
        }));

        const platformGames: PlatformGames = {
          "Epic Games Store": gamesWithData.filter(g => g.platform === 'Epic Games Store'),
          "Amazon Prime Gaming": gamesWithData.filter(g => g.platform === 'Amazon Prime Gaming'),
          "GOG": gamesWithData.filter(g => g.platform === 'GOG'),
          "Steam": gamesWithData.filter(g => g.platform === 'Steam'),
        };
        
        setGameData(platformGames);
        const { games, ...rest } = result;
        setDebugInfo(rest);

      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const allGames = gameData
    ? Object.entries(gameData).flatMap(([platform, games]) =>
        games.map((game) => ({ ...game, platform }))
      )
    : [];

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
                <div key={i} className="flex flex-col sm:flex-row items-center p-4 bg-card/80 backdrop-blur-sm border border-border/30 rounded-lg w-full group">
                    <div className="flex-shrink-0 w-full sm:w-48 h-32 sm:h-24 relative mb-4 sm:mb-0 sm:mr-4">
                        <Skeleton className="w-full h-full" />
                    </div>
                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                        <div className="flex-grow">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-8 w-1/2" />
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                            <Skeleton className="h-9 w-24" />
                            <div className="flex items-center justify-end gap-4 w-full mt-2">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-9 w-28" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        ) : error ? (
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

        {debugInfo && <DebugInfo result={debugInfo} />}

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
