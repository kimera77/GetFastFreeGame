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

const PlatformGamesSchema = z.object({
  title: z.string().describe('The title of the game.'),
  platform: z.string().describe('The platform the game is available on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam).'),
  dealLink: z.string().url().describe('Direct link to the game download page.'),
  imageURL: z.string().url().describe('Direct URL to the game image.'),
  endDate: z.string().optional().describe('The date the deal ends, if applicable, in ISO format.'),
});

export type FreeGame = z.infer<typeof PlatformGamesSchema>;

const FreeGamesOutputSchema = z.array(PlatformGamesSchema);

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

export async function fetchAndCacheFreeGames(platforms: string): Promise<FreeGame[]> {
  return unstable_cache(
    async () => {
      console.log("Running flow to fetch free games...");
      return await fetchFreeGamesFlow({ platforms });
    },
    ["free-games-data"],
    { revalidate: 3600 }, // Cache for 1 hour
  )();
}
