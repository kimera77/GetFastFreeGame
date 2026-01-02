import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { FreeGame } from '@/ai/flows/fetch-and-cache-free-games';
import { PlatformIcon } from './platform-icons';
import { ExternalLink, Video } from 'lucide-react';

export type GameWithImage = FreeGame & { displayImage: { url: string; hint: string } };

type GameCardProps = {
  game: GameWithImage;
  onPreviewClick: (game: GameWithImage) => void;
};

export function GameCard({ game, onPreviewClick }: GameCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-lg border-border bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="relative p-0">
        <Image
          src={game.displayImage.url}
          alt={`Cover art for ${game.title}`}
          width={400}
          height={300}
          className="w-full object-cover"
          data-ai-hint={game.displayImage.hint}
        />
        <div className="absolute top-2 right-2 rounded-full bg-background/80 p-2 backdrop-blur-sm">
          <PlatformIcon platform={game.platform} className="h-6 w-6 text-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="font-headline text-xl leading-tight">
          {game.title}
        </CardTitle>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-0">
        <Button variant="outline" onClick={() => onPreviewClick(game)}>
          <Video className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button asChild>
          <a href={game.dealLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Claim Now
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
