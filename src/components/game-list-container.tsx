'use client';

import { useState, useEffect } from 'react';
import type { Language } from '@/lib/translations';
import { GameList } from '@/components/game-list';
import { DebugInfo } from '@/components/debug-info';
import type { FetchGamesResult } from '@/ai/flows/fetch-and-cache-free-games';
import type { PlatformGames } from '@/lib/game-data';
import type { Game } from '@/lib/game';


type ApiGame = {
  title: string;
  platform: string;
  dealLink: string;
  imageURL: string;
  original_price?: string;
  endDate?: string;
  gameplay?: string;
};

export function GameListContainer() {
  const [language, setLanguage] = useState<Language>('en');
  const [gameData, setGameData] = useState<PlatformGames | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Omit<FetchGamesResult, 'games'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        const gamesWithData: Game[] = result.games.map((game) => ({
          name: game.title,
          platform: game.platform,
          game_link: game.dealLink,
          cover_image: game.imageURL,
          original_price: game.original_price,
          endDate: game.endDate,
          gameplay_url: game.gameplay,
        }));

        const platformGames: PlatformGames = {
          "Epic Games Store": gamesWithData.filter(g => (g as any).platform === 'Epic Games Store'),
          "Amazon Prime Gaming": gamesWithData.filter(g => (g as any).platform === 'Amazon Prime Gaming'),
          "GOG": gamesWithData.filter(g => (g as any).platform === 'GOG'),
          "Steam": gamesWithData.filter(g => (g as any).platform === 'Steam'),
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
  
  return (
    <>
        <GameList 
            language={language}
            setLanguage={setLanguage}
            gameData={gameData}
            isLoading={isLoading}
            error={error}
        />
        {debugInfo && <DebugInfo result={debugInfo} />}
    </>
  )
}
