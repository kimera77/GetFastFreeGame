import { fetchAndCacheFreeGames, type FreeGame } from '@/ai/flows/fetch-and-cache-free-games';
import { GameList } from '@/components/game-list';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { Game } from '@/lib/game';

async function GamesSection() {
  let games: FreeGame[] = [];
  try {
    games = await fetchAndCacheFreeGames('Epic Games Store,Amazon Prime Gaming,GOG,Steam');
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Failed to load games</AlertTitle>
        <AlertDescription>
          There was an error fetching the latest free games. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // The AI mock returns fixed data. We'll augment it with placeholder images.
  const gamesWithData: (Game & { platform: string })[] = games.map((game) => ({
    name: game.title,
    platform: game.platform,
    game_link: game.dealLink,
    cover_image: game.imageURL,
    original_price: '$19.99'
  }));

  if (gamesWithData.length === 0) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>No free games found</AlertTitle>
        <AlertDescription>
          Check back later for new free game drops!
        </AlertDescription>
      </Alert>
    );
  }

  const translations = {
    getGame: 'Get Game'
  };

  return <GameList games={gamesWithData} translations={translations} />;
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <header className="mb-8 text-center md:mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
            Daily Game Drop
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Your daily stop for the best free games available right now across PC platforms.
          </p>
        </header>

        <Suspense fallback={<LoadingGrid />}>
          <GamesSection />
        </Suspense>

      </div>
    </main>
  );
}
