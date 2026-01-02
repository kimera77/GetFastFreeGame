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

const getFreeGames = ai.defineTool(
  {
    name: 'getFreeGames',
    description: 'Retrieves a list of free games available on different platforms.',
    inputSchema: z.object({
      platforms: z.string().describe('The platforms to search for free games on. Options: Epic Games Store, Amazon Prime Gaming, GOG, Steam.  If multiple, separate with commas.'),
    }),
    outputSchema: FreeGamesOutputSchema,
  },
  async (input) => {
    console.log("Fetching free games from LLM tool...");
    // Replace with actual implementation to fetch game data.
    return [
      {
        title: 'Example Game 1',
        platform: 'Epic Games Store',
        dealLink: 'https://example.com/game1',
        imageURL: 'https://example.com/game1.jpg',
      },
      {
        title: 'Example Game 2',
        platform: 'Steam',
        dealLink: 'https://example.com/game2',
        imageURL: 'https://example.com/game2.jpg',
      },
    ];
  }
);

const freeGamesPrompt = ai.definePrompt({
  name: 'freeGamesPrompt',
  tools: [getFreeGames],
  input: z.object({
    platforms: z.string().describe('The platforms to search for free games on.'),
  }),
  output: {
    schema: FreeGamesOutputSchema,
  },
  prompt: `Find the current list of free games available on the following platforms: {{{platforms}}}.\nReturn the result as a JSON array.
Make sure the imageURL is a direct link to the image (not a link to a webpage that contains the image).`,
});


const fetchFreeGamesFlow = ai.defineFlow(
  {
    name: 'fetchFreeGamesFlow',
    inputSchema: z.object({
      platforms: z.string().describe('The platforms to search for free games on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam). Separate with commas if multiple).'),
    }),
    outputSchema: FreeGamesOutputSchema,
  },
  async (input) => {
    const {output} = await freeGamesPrompt(input);
    return output!;
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
