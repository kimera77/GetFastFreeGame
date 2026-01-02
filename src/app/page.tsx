import { fetchAndCacheFreeGames, type FetchGamesResult } from '@/ai/flows/fetch-and-cache-free-games';
import { GameList } from '@/components/game-list';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, Database, Cloud } from 'lucide-react';
import type { Game } from '@/lib/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ClearCacheButton } from '@/components/clear-cache-button';

async function GamesSection() {
  let result: FetchGamesResult | null = null;
  let error: Error | null = null;
  
  try {
    result = await fetchAndCacheFreeGames('Epic Games Store,Amazon Prime Gaming,GOG,Steam');
  } catch (e) {
    console.error("Failed to fetch games:", e);
    error = e instanceof Error ? e : new Error('An unknown error occurred.');
  }

  const gamesWithData = result?.games.map((game) => ({
    name: game.title,
    platform: game.platform,
    game_link: game.dealLink,
    cover_image: game.imageURL,
    original_price: game.original_price
  })) || [];

  const platformGames = {
    "Epic Games Store": gamesWithData.filter(g => g.platform === 'Epic Games Store'),
    "Amazon Prime Gaming": gamesWithData.filter(g => g.platform === 'Amazon Prime Gaming'),
    "GOG": gamesWithData.filter(g => g.platform === 'GOG'),
    "Steam": gamesWithData.filter(g => g.platform === 'Steam'),
  };

  return (
    <>
      <GameList initialGameData={platformGames} initialError={error?.message || null} />
      {result && <DebugInfo result={result} />}
      {error && !result && (
         <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Failed to load games</AlertTitle>
              <AlertDescription>
                <p>There was an error fetching the latest free games:</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-destructive/10 p-4 text-destructive-foreground">
                  <code>{error.message}</code>
                </pre>
              </AlertDescription>
            </Alert>
         </div>
      )}
    </>
  );
}

function DebugInfo({ result }: { result: FetchGamesResult }) {
  const { source, prompt, games, timestamp } = result;
  const isCache = source === 'Cache';

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      <h2 className="text-2xl font-headline font-bold mb-4 text-center">Debug Information</h2>
      <Card className="bg-card/50">
        <CardHeader>
           <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Data Fetching Details
            </CardTitle>
            <ClearCacheButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            {isCache ? (
              <Database className="h-6 w-6 text-primary" />
            ) : (
              <Cloud className="h-6 w-6 text-accent" />
            )}
            <div>
              <p className="font-semibold">Data Source: <span className={isCache ? 'text-primary' : 'text-accent'}>{source}</span></p>
              <p className="text-sm text-muted-foreground">
                {isCache
                  ? `Loaded from cache. Data from: ${new Date(timestamp).toLocaleString()}`
                  : `Fetched fresh from API at: ${new Date(timestamp).toLocaleString()}`}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Prompt Sent to AI</h3>
            <pre className="p-4 rounded-lg bg-muted/50 text-sm overflow-x-auto">
              <code>{prompt}</code>
            </pre>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">JSON Response (as fetched)</h3>
            <pre className="p-4 rounded-lg bg-muted/50 text-sm max-h-96 overflow-auto">
              <code>{JSON.stringify(games, null, 2)}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
      <Suspense fallback={<LoadingGrid />}>
        <GamesSection />
      </Suspense>
    </main>
  );
}
