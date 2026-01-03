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
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

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

const ALLOWED_IMAGE_HOSTNAMES = [
    'cdn.akamai.steamstatic.com',
    'shared.fastly.steamstatic.com',
    'cdn1.epicgames.com',
    'cdn2.unrealengine.com',
    'images.gog-statics.com',
    'm.media-amazon.com',
    'images-na.ssl-images-amazon.com',
];

const fullPrompt = `Give me the list of free or claimable games available right now on the following platforms: Epic Games Store,Amazon Prime Gaming,GOG,Steam.
    I need the response to be ONLY a raw JSON array, without any additional text, explanations, or markdown formatting like \`\`\`json.
    Each game object in the array must have these exact properties:
    - 'title': The full and exact title of the game (string).
    - 'platform': The platform the game is on, matching one of the requested platforms (string).
    - 'dealLink': The direct URL to the game's store or claim page (string).
    - 'imageURL': A direct, publicly accessible HTTPS URL for the game's cover art.
       VERY IMPORTANT: You MUST ONLY use image URLs from the following allowed domains: ${ALLOWED_IMAGE_HOSTNAMES.join(', ')}. Do NOT use any other domains like 'www.legacygames.com' or any other. Find an image from the allowed list. If you cannot find an image from an allowed domain, do not include the game in the list.
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
      //tools: [googleAI.tool.googleSearch()],
      
      // AÑADE ESTA CONFIGURACIÓN PARA HABILITAR EL "GROUNDING" DE GOOGLE SEARCH
      config: {
        tools: [{ googleSearch: {} }],
      },
      output: {
        schema: FreeGamesOutputSchema,
      },
    });

    if (!output) {
        return [];
    }

    // Filter the results to only include games with allowed image URLs
    const filteredGames = output.filter(game => {
        try {
            const url = new URL(game.imageURL);
            return ALLOWED_IMAGE_HOSTNAMES.includes(url.hostname);
        } catch (e) {
            return false;
        }
    });

    return filteredGames;
  }
);

const getCachedGames = cache(
  async (platforms: string): Promise<Omit<FetchGamesResult, 'source'>> => {
    console.log('Fetching from API and caching...');
    try {
      const games = await fetchFreeGamesFlow({ platforms });
      return {
        games,
        prompt: fullPrompt,
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
