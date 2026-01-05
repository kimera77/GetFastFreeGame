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
import { googleSearch } from '@genkit-ai/google-genai';


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

const initialPromptText = `You are a backend service, not a chat assistant. Your task is to return DATA ONLY. You MUST return a valid JSON array based on real-time web search results for currently free games on the following platforms: Epic Games Store, Amazon Prime Gaming, GOG, Steam. Use Google Search to find real-time information. Do NOT include explanations, comments, markdown, or any text outside the JSON. If you cannot produce valid JSON, return an empty JSON array: []. Schema rules (STRICT): The response MUST start with '[' and end with ']'. Each element MUST be an object with ONLY the following keys: title (string), platform (string: Epic Games Store | Amazon Prime Gaming | GOG | Steam), dealLink (string, valid HTTPS URL), imageURL (string, valid HTTPS URL from allowed domains), endDate (string, ISO 8601 or empty string), original_price (string, may be empty). Image rules (MANDATORY): imageURL MUST be from one of these domains ONLY: ${ALLOWED_IMAGE_HOSTNAMES.join(', ')}. If an image URL from the allowed domains cannot be found for a game, that game MUST be excluded from the results. Content rules: Include ONLY games that are currently free or claimable. If a platform has no free games, exclude it entirely. Do NOT guess data. Do NOT hallucinate prices, dates, or links. Return ONLY the JSON array.`;

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
    // Step 1: Generate raw text content using search
    const initialResponse = await ai.generate({
      prompt: initialPromptText,
      tools: [googleSearch],
    });

    const rawOutput = initialResponse.text ?? '[]';

    // Step 2: Clean up the raw text and format it as valid JSON
    const finalPrompt = cleanupPromptText + rawOutput;
    
    const { output: finalOutput } = await ai.generate({
        prompt: finalPrompt,
        output: {
            schema: FreeGamesOutputSchema,
        },
    });

    const games = finalOutput || [];

    // Filter the results to only include games with allowed image URLs
    const filteredGames = games.filter(game => {
        try {
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
        cleanupPrompt: finalPrompt,
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
