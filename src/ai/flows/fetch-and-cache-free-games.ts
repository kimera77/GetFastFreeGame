'use server';
/**
 * @fileOverview This file defines a Genkit flow to fetch and cache free game listings using a two-step AI process.
 *
 * It includes:
 * - fetchAndCacheFreeGames: The main function to fetch and cache free game listings.
 * - PlatformGamesSchema: Zod schema for validating the game data.
 * - FreeGame: Type definition based on PlatformGamesSchema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

const PlatformGamesSchema = z.object({
  title: z.string().describe('The title of the game.'),
  platform: z.string().describe('The platform the game is available on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam).'),
  dealLink: z.string().url().describe('Direct link to the game download page.'),
  imageURL: z.string().url().describe('Direct URL to the game image.'),
  endDate: z.string().optional().describe('The date the deal ends, if applicable, in ISO format.'),
  original_price: z.string().optional().describe('The standard retail price before the discount (e.g., "$19.99"). This can be an empty string if not applicable or not found.'),
  gameplay: z.string().url().optional().describe('A first YouTube URL for the gameplay video for each videogame.'),
});

export type FreeGame = z.infer<typeof PlatformGamesSchema>;

const FreeGamesOutputSchema = z.array(PlatformGamesSchema);

export type FetchGamesResult = {
  games: FreeGame[];
  source: 'API' | 'Cache';
  timestamp: string;
  initialPrompt: string;
  rawOutput: string;
  modelName: string;
};

const ALLOWED_IMAGE_HOSTNAMES = [
    'cdn.akamai.steamstatic.com',
    'shared.fastly.steamstatic.com',
    'cdn1.epicgames.com',
    'cdn2.unrealengine.com',
    'images.gog-statics.com',
    'm.media-amazon.com',
    'images-na.ssl-images-amazon.com',
];

const initialPromptText = `You are a backend service that returns DATA ONLY. Your task is to find currently free games and return them as a JSON array.

SEARCH RULES:
1. Use real-time web search.
2. Find games on these platforms: Epic Games Store, Amazon Prime Gaming, GOG, Steam.
3. Include ONLY games that are free to claim and keep forever (100% discount, limited time).
4. EXCLUDE: Free-to-Play games, trials, demos, or games requiring a subscription to play.

JSON SCHEMA:
- The response MUST be a valid JSON array, starting with '[' and ending with ']'.
- Each object in the array MUST have these keys: title, platform, dealLink, imageURL, endDate, original_price, gameplay.
- 'platform' MUST be one of: 'Epic Games Store', 'Amazon Prime Gaming', 'GOG', 'Steam'.
- 'imageURL' should be a direct link to a representative image for the game.
- 'gameplay' should be a YouTube URL of gameplay footage if available.

Do NOT include explanations, comments, or any text outside the JSON array.`;

const fetchFreeGamesFlow = ai.defineFlow(
  {
    name: 'fetchFreeGamesFlow',
    inputSchema: z.object({
      platforms: z.string().describe('The platforms to search for free games on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam). Separate with commas if multiple).'),
    }),
    outputSchema: z.object({
        games: FreeGamesOutputSchema,
        initialPrompt: z.string(),
        rawOutput: z.string(),
        modelName: z.string(),
    }),
  },
  async (input) => {
    // Step 1: Generate raw text content using search for grounding
    const initialResponse = await ai.generate({
      prompt: initialPromptText,
      config: {
        tools: [
          {
            googleSearch: {} // This enables native grounding in Gemini
          }
        ]
      }
    });

    const rawOutput = initialResponse.text ?? '[]';
    
    let games: FreeGame[] = [];
    try {
        let jsonString = rawOutput;
        const jsonStartIndex = rawOutput.indexOf('[');
        const jsonEndIndex = rawOmitut.lastIndexOf(']');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            jsonString = rawOutput.substring(jsonStartIndex, jsonEndIndex + 1);
        }
        games = JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse raw output as JSON:", e);
        console.error("Raw output was:", rawOutput);
        games = []; // Return empty array on parsing failure
    }

    // Filter the results to only include games with allowed image URLs
    const filteredGames = games.filter((game: FreeGame) => {
        try {
            if (!game.imageURL) return false;
            const url = new URL(game.imageURL);
            return ALLOWED_IMAGE_HOSTNAMES.includes(url.hostname);
        } catch (e) {
            return false;
        }
    });
    
    const modelName = initialResponse.candidates[0]?.model || 'unknown';

    return {
        games: filteredGames.length > 0 ? filteredGames : games, // Fallback to unfiltered if filter removes all
        initialPrompt: initialPromptText,
        rawOutput: rawOutput,
        modelName: modelName,
    };
  }
);

const getCachedGames = cache(
  async (platforms: string): Promise<Omit<FetchGamesResult, 'source'>> => {
    console.log('Fetching from API and caching...');
    try {
      const result = await fetchFreeGamesFlow({ platforms });
      return {
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while fetching games.');
    }
  },
  ['free-games-data-v3'],
  {
    tags: ['free-games-data-v3'],
    revalidate: 72000, // 20 hours in seconds
  }
);

export async function fetchAndCacheFreeGames(platforms: string): Promise<FetchGamesResult> {
  const data = await getCachedGames(platforms);
  
  const now = new Date();
  const cacheTime = new Date(data.timestamp);
  const diffInSeconds = (now.getTime() - cacheTime.getTime()) / 1000;

  // This is a heuristic to determine if the data is fresh from the API.
  // If the data was fetched within the last 5 seconds, we'll consider it "API".
  // Otherwise, we'll assume it's from the cache.
  const source = diffInSeconds < 5 ? 'API' : 'Cache';
  
  return {
    ...data,
    source,
  };
}
