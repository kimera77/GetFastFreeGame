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
      await clearGamesCache();
      toast({
        title: 'Cache Cleared',
        description: 'The game data cache has been successfully cleared. Refresh the page to see the changes.',
      });
      setCleared(true);
      // Reset the button state after a short delay
      setTimeout(() => setCleared(false), 2000);
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || cleared}
      variant="outline"
      size="sm"
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
