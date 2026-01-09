'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { clearGamesCache } from '@/app/actions';
import { Trash2, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ClearCacheButton() {
  const [isPending, startTransition] = useTransition();
  const [cleared, setCleared] = useState(false);
  const { toast } = useToast();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await clearGamesCache();
        toast({
          title: 'Cache Cleared',
          description: 'The game data cache has been successfully cleared. The changes will be visible on the next page refresh.',
        });
        setCleared(true);
        setTimeout(() => setCleared(false), 2000);
        
        // We trigger a page reload to fetch the new data
        window.location.reload();

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error Clearing Cache',
          description: 'Something went wrong while clearing the cache.',
        });
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || cleared}
      variant="outline"
      size="sm"
      className="opacity-0"
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : cleared ? (
        <Check />
      ) : (
        <Trash2 />
      )}
      <span className="ml-2 hidden sm:inline">
        {isPending ? 'Clearing...' : cleared ? 'Cleared!' : 'Clear Cache'}
      </span>
    </Button>
  );
}
