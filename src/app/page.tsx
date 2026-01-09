'use server';

import { GameList } from '@/components/game-list';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { fetchAndCacheFreeGames, type FetchGamesResult } from '@/ai/flows/fetch-and-cache-free-games';
import { DebugInfo } from '@/components/debug-info';
import { Game } from '@/lib/game';

async function getGames(): Promise<FetchGamesResult | { games: Game[], error: string }> {
  try {
    const result = await fetchAndCacheFreeGames('Epic Games Store,Amazon Prime Gaming,GOG,Steam');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      games: [],
      error: errorMessage,
    }
  }
}

export default async function Home() {
  const result = await getGames();

  if ('error' in result) {
    return (
      <main className="min-h-screen bg-background">
        <GameList allGames={[]} error={result.error} />
      </main>
    )
  }

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
      <Suspense fallback={<GameList allGames={[]} />}>
        <GameList allGames={gamesWithData} />
        {debugInfo && <DebugInfo result={debugInfo} />}
      </Suspense>
    </main>
  );
}
