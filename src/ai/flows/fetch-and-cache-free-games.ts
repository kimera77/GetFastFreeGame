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
import {unstable_cache as cache, revalidateTag} from 'next/cache';

const PlatformGamesSchema = z.object({
  title: z.string().describe('The title of the game.'),
  platform: z.string().describe('The platform the game is available on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam).'),
  dealLink: z.string().url().describe('Direct link to the game download page.'),
  imageURL: z.string().url().describe('Direct URL to the game image.'),
  endDate: z.string().optional().describe('The date the deal ends, if applicable, in ISO format.'),
  original_price: z.string().optional().describe('The standard retail price before the discount (e.g., "$19.99"). This can be an empty string if not applicable or not found.'),
});

export type FreeGame = z.infer<typeof PlatformGamesSchema>;

const FreeGamesOutputSchema = z.array(PlatformGamesSchema);

export type FetchGamesResult = {
  games: FreeGame[];
  source: 'API' | 'Cache';
  prompt: string;
  timestamp: string;
};

const fullPrompt = `Give me the list of free or claimable games available right now on the following platforms: Epic Games Store,Amazon Prime Gaming,GOG,Steam.
    I need the response to be ONLY a raw JSON array, without any additional text, explanations, or markdown formatting like \`\`\`json.
    Each game object in the array must have these exact properties:
    - 'title': The full and exact title of the game (string).
    - 'platform': The platform the game is on, matching one of the requested platforms (string).
    - 'dealLink': The direct URL to the game's store or claim page (string).
    - 'imageURL': A direct, publicly accessible HTTPS URL for the game's cover art. It should be high quality. (string).
    - 'endDate': The date the deal ends in ISO format, if available (string, optional).
    - 'original_price': The standard retail price before the discount (e.g., "$19.99"). This can be an empty string if not applicable or not found (string).

    If a platform has no free games, do not include it.
    Your entire response must be just the JSON array, starting with [ and ending with ].`;

const fetchFreeGamesFlow = ai.defineFlow(
  {
    name: 'fetchFreeGamesFlow',
    inputSchema: z.object({
      platforms: z.string().describe('The platforms to search for free games on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam). Separate with commas if multiple).'),
    }),
    outputSchema: FreeGamesOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      prompt: fullPrompt,
      output: {
        schema: FreeGamesOutputSchema,
      },
    });

    return output || [];
  }
);

const getCachedGames = cache(
  async (platforms: string): Promise<Omit<FetchGamesResult, 'source'>> => {
    console.log('Fetching from API and caching...');
    const games = await fetchFreeGamesFlow({ platforms });
    return {
      games,
      prompt: fullPrompt,
      timestamp: new Date().toISOString(),
    };
  },
  ['free-games-data-v2'],
  {
    tags: ['free-games-data-v2'],
  }
);

export async function fetchAndCacheFreeGames(platforms: string): Promise<FetchGamesResult> {
  const data = await getCachedGames(platforms);
  
  const now = new Date();
  const cacheTime = new Date(data.timestamp);
  const diffInSeconds = (now.getTime() - cacheTime.getTime()) / 1000;

  // A very small diff indicates it was just fetched. A larger one means it came from cache.
  // This is a heuristic, but it's effective for telling the user the source.
  const source = diffInSeconds < 2 ? 'API' : 'Cache';
  
  return {
    ...data,
    source,
  };
}
