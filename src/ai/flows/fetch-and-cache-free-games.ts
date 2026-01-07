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
import {z} from 'genkit';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

const PlatformGamesSchema = z.object({
  title: z.string().describe('The title of the game.'),
  platform: z.string().describe('The platform the game is available on (e.g., Epic Games Store, Amazon Prime Gaming, GOG, Steam).'),
  dealLink: z.string().url().describe('Direct link to the game download page.'),
  imageURL: z.string().url().describe('Direct URL to the game image.'),
  endDate: z.string().optional().describe('The date the deal ends, if applicable, in ISO format.'),
  original_price: z.string().optional().describe('The standard retail price before the discount (e.g., "$19.99"). This can be an empty string if not applicable or not found.'),
  gameplay: z.string().url().optional().describe('A YouTube URL for the game gameplay.'),
});

export type FreeGame = z.infer<typeof PlatformGamesSchema>;

const FreeGamesOutputSchema = z.array(PlatformGamesSchema);

export type FetchGamesResult = {
  games: FreeGame[];
  source: 'API' | 'Cache';
  timestamp: string;
  initialPrompt: string;
  rawOutput: string;
  cleanupPrompt: string;
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

const initialPromptText = `You are a backend service, not a chat assistant. Your task is to return DATA ONLY. You MUST return a valid JSON array based on real-time web search results for games.

Search and Content Rules (STRICT):
1. Use Google Search to find real-time information.
2. Platforms to search: Epic Games Store, Amazon Prime Gaming, GOG, Steam.
3. Include ONLY games that are available for a **limited time only** to claim and **keep forever** (100% discount).
4. EXCLUDE: permanently Free-to-Play, trials, betas, demos, or games that require a subscription to play but are not 'claimed'.
5. Do NOT guess data. Do NOT hallucinate prices, dates, or links.

Schema Rules (STRICT):
The response MUST start with '[' and end with ']'. Each element MUST be an object with ONLY the following keys: title, platform, dealLink, imageURL, endDate, original_price, gameplay.

Platform Key: MUST use one of these exact strings: 'Epic Games Store', 'Amazon Prime Gaming', 'GOG', 'Steam'.

Image Rules (MANDATORY):
1. imageURL MUST be from one of these allowed domains ONLY: ${ALLOWED_IMAGE_HOSTNAMES.join(', ')}.
2. **HIGH ACCURACY:** To prevent image errors (e.g., incorrect Steam IDs), if the game exists on Steam, you MUST find and use the **verified Steam App ID** to construct the URL: https://cdn.akamai.steamstatic.com/steam/apps/[ID]/header.jpg.
3. If a valid, high-accuracy image URL from the allowed domains cannot be found or verified, that game MUST be excluded.

Gameplay rules:
give a url ( no more and no less) from youtube for videogame gameplay.

Do NOT include explanations, comments, markdown, or any text outside the JSON. Return ONLY the JSON array.`;

const cleanupPromptText = `You are a data sanitation service. Your only task is to take the following text and convert it into a valid JSON array of objects.
- Ensure the final output is ONLY the JSON array and nothing else.
- Correct any formatting errors.
- Do not add, remove, or change any data, just fix the structure.
- If the input is empty or contains no valid data, return an empty array [].
- The response MUST start with '[' and end with ']'.

Input text to clean:
`;

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
        cleanupPrompt: z.string(),
    }),
  },
  async (input) => {
    // Step 1: Generate raw text content using search for grounding
    const initialResponse = await ai.generate({
      prompt: initialPromptText,
      config: {
        tools: [
          {
            googleSearch: {} // Esto activa el grounding nativo de Gemini
          }
        ]
      }
    });

    const rawOutput = initialResponse.text ?? '[]';
    
    // DEBUG: Bypass Step 2 (Cleanup) and use raw output directly
    let games: FreeGame[] = [];
    let cleanupPromptForDebug = 'Cleanup step bypassed for debugging.';
    try {
        // Attempt to parse the raw output directly
        let jsonString = rawOutput;
        const jsonStartIndex = rawOutput.indexOf('[');
        const jsonEndIndex = rawOutput.lastIndexOf(']');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            jsonString = rawOutput.substring(jsonStartIndex, jsonEndIndex + 1);
        }
        games = JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse raw output as JSON:", e);
        console.error("Raw output was:", rawOutput);
        games = []; // Return empty array on parsing failure
        cleanupPromptForDebug = `Cleanup step bypassed. FAILED TO PARSE RAW OUTPUT. Error: ${e instanceof Error ? e.message : String(e)}`;
    }


    /*
    // Step 2: Clean up the raw text and format it as valid JSON
    const finalPrompt = cleanupPromptText + rawOutput;
    
    const { output: finalOutput } = await ai.generate({
        prompt: finalPrompt,
        output: {
            schema: FreeGamesOutputSchema,
        },
    });

    const games = finalOutput || [];
    */


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

    return {
        games: filteredGames,
        initialPrompt: initialPromptText,
        rawOutput: rawOutput,
        cleanupPrompt: cleanupPromptForDebug, // Using the debug prompt
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
        console.error("Error fetching games from API:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while fetching games.');
    }
  },
  ['free-games-data-v3'],
  {
    tags: ['free-games-data-v3'],
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
