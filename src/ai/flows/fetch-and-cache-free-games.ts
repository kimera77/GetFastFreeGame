'use server';
/**
 * @fileOverview This file defines a Genkit flow to fetch and cache free game listings using AI.
 *
 * It includes:
 * - fetchAndCacheFreeGames: The main function to fetch and cache free game listings.
 * - PlatformGamesSchema: Zod schema for validating the game data.
 * - FreeGame: Type definition based on PlatformGamesSchema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {unstable_cache} from 'next/cache';
import { freeGamesPrompt } from '@/lib/translations';

const PlatformGamesSchema = z.object({
  title: z.string().describe('The title of the game.'),
  platform: z.string().describe('The platform the game is available on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam).'),
  dealLink: z.string().url().describe('Direct link to the game download page.'),
  imageURL: z.string().url().describe('Direct URL to the game image.'),
  endDate: z.string().optional().describe('The date the deal ends, if applicable, in ISO format.'),
});

export type FreeGame = z.infer<typeof PlatformGamesSchema>;

const FreeGamesOutputSchema = z.array(PlatformGamesSchema);

export type FetchGamesResult = {
  games: FreeGame[];
  source: 'API' | 'Cache';
  prompt: string;
  timestamp: string;
};

const getFreeGames = async (input: { platforms: string }): Promise<FreeGame[]> => {
    console.log("Fetching free games from mock data...");
    // Replace with actual implementation to fetch game data.
    return [
      {
        title: 'Cyberpunk 2077',
        platform: 'Epic Games Store',
        dealLink: 'https://example.com/game1',
        imageURL: 'https://picsum.photos/seed/1/400/300',
      },
      {
        title: 'Baldur\'s Gate 3',
        platform: 'Steam',
        dealLink: 'https://example.com/game2',
        imageURL: 'https://picsum.photos/seed/2/400/300',
      },
       {
        title: 'Red Dead Redemption 2',
        platform: 'GOG',
        dealLink: 'https://example.com/game3',
        imageURL: 'https://picsum.photos/seed/3/400/300',
      },
       {
        title: 'The Witcher 3: Wild Hunt',
        platform: 'Amazon Prime Gaming',
        dealLink: 'https://example.com/game4',
        imageURL: 'https://picsum.photos/seed/4/400/300',
      },
    ];
}


const fetchFreeGamesFlow = ai.defineFlow(
  {
    name: 'fetchFreeGamesFlow',
    inputSchema: z.object({
      platforms: z.string().describe('The platforms to search for free games on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam). Separate with commas if multiple).'),
    }),
    outputSchema: FreeGamesOutputSchema,
  },
  async (input) => {
    return await getFreeGames(input);
  }
);

const getCachedGames = unstable_cache(
  async (platforms: string): Promise<Omit<FetchGamesResult, 'source'>> => {
    console.log('Fetching from API and caching...');
    const games = await fetchFreeGamesFlow({ platforms });
    return {
      games,
      prompt: freeGamesPrompt,
      timestamp: new Date().toISOString(),
    };
  },
  ['free-games-data-v2'],
  { revalidate: 43200 } // 12 hours
);

export async function fetchAndCacheFreeGames(platforms: string): Promise<FetchGamesResult> {
  const data = await getCachedGames(platforms);
  
  const now = new Date();
  const cacheTime = new Date(data.timestamp);
  const diffInSeconds = (now.getTime() - cacheTime.getTime()) / 1000;

  // If the data is very fresh (e.g., created within the last 2 seconds),
  // we can assume it came directly from the API call inside unstable_cache.
  // Otherwise, it was served from the cache.
  const source = diffInSeconds < 2 ? 'API' : 'Cache';
  
  return {
    ...data,
    source,
  };
}
