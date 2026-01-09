'use server';

import { GameList } from '@/components/game-list';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import type { FetchGamesResult } from '@/ai/flows/fetch-and-cache-free-games';
import { DebugInfo } from '@/components/debug-info';
import { Game } from '@/lib/game';

async function getGames(): Promise<FetchGamesResult> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/games`, { cache: 'no-store' });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

export default async function Home() {
  try {
    const result = await getGames();
    
    const gamesWithData: Game[] = result.games.map((game) => ({
      name: game.title,
      platform: game.platform,
      game_link: game.dealLink,
      cover_image: game.imageURL,
      original_price: game.original_price,
      endDate: game.endDate,
      gameplay_url: game.gameplay,
    }));

    const { games, ...debugInfo } = result;

    return (
      <main className="min-h-screen bg-background">
        <GameList allGames={gamesWithData} />
        {debugInfo && <DebugInfo result={debugInfo} />}
      </main>
    );

  } catch(error) {
    // In case of error fetching data, render a fallback.
    // The error will be handled by GameList component's error prop.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return (
      <main className="min-h-screen bg-background">
        <GameList allGames={[]} error={errorMessage} />
      </main>
    )
  }
}
