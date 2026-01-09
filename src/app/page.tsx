import { GameListContainer } from '@/components/game-list-container';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';


export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingGrid />}>
        <GameListContainer />
      </Suspense>
    </main>
  );
}

function LoadingGrid() {
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="text-center my-12">
          <h1 className="text-6xl md:text-8xl font-headline font-bold text-primary uppercase tracking-wider mb-2">
            Get Fast Free Game
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay up-to-date with all the limited-time, fully redeemable free games available on major video game platforms.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center p-4 bg-card/80 backdrop-blur-sm border border-border/30 rounded-lg w-full group">
                <div className="flex-shrink-0 w-full sm:w-48 h-32 sm:h-24 relative mb-4 sm:mb-0 sm:mr-4">
                    <LoadingSkeleton className="w-full h-full" />
                </div>
                <div className="flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                    <div className="flex-grow">
                        <LoadingSkeleton className="h-6 w-3/4 mb-2" />
                        <LoadingSkeleton className="h-8 w-1/2" />
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                        <LoadingSkeleton className="h-9 w-24" />
                        <div className="flex items-center justify-end gap-4 w-full mt-2">
                            <LoadingSkeleton className="h-5 w-20" />
                            <LoadingSkeleton className="h-9 w-28" />
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
