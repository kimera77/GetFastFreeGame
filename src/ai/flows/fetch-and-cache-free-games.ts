'use server';
/**
 * @fileOverview This file defines a Genkit flow to fetch and cache free game listings using a two-step AI process.
 *
 * It includes:
 * - fetchAndCacheFreeGames: The main function to fetch and cache free game listings.
 * - PlatformGamesSchema: Zod schema for validating the game data.
 * - FreeGame: Type definition based on PlatformGamesSchema.
 */

import {ai, modelGenkit} from '@/ai/genkit';
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

Gameplay Rules (STRICT):
1. URL Source: The value for 'gameplay' MUST be a direct, single YouTube video URL (https://www.youtube.com/watch?v=...).
2. STABLE LINK SEARCH: For each game, you MUST perform a Google Search query for "youtube [Game Title] Gameplay".
3. **VETTING & LONGEVITY (MANDATORY HIERARCHY):** The selected URL MUST satisfy the following conditions, strictly in this order of priority:
    a. **Stability & Authority Priority (P1):** The video MUST be from a **verified, high-authority channel** (Official Developer/Publisher, IGN, GameSpot, PC Gamer, etc.). Videos from these channels are prioritized even if they are not the #1 search result.
    b. **Substantial Footage (P2):** The video MUST have a duration of **over 5 minutes** to ensure it is substantial, unedited gameplay footage, not a short cinematic trailer or cutscene.
    c. **Top Result Vetting (P3):** If multiple authoritative links exist, use the highest-ranking one. If the #1 search result does not meet P1 or P2, the search must proceed to vet the next result (2nd, 3rd, etc.) until a link is found that meets P1 and P2.
4. EXCLUSION: Links to channels, playlists (URLs containing 'list='), short cinematic trailers, cutscenes, or videos from unknown/small user accounts are forbidden. The video must be pure in-game action.
Do NOT include explanations, comments, markdown, or any text outside the JSON. Return ONLY the JSON array.`;


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
        const jsonEndIndex = rawOutput.lastIndexOf(']');
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
    
    const modelName = modelGenkit || 'unknown';

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
  ['free-games-list-data'],
  {
    revalidate: 72000, // 20 hours
    tags: ['free-games-data'], 
  }
);


export async function fetchAndCacheFreeGames(platforms: string): Promise<FetchGamesResult> {
  const data = await getCachedGames(platforms);
  
  const now = new Date();
  const cacheTime = new Date(data.timestamp);
  const diffInSeconds = (now.getTime() - cacheTime.getTime()) / 1000;

  const source = diffInSeconds < 5 ? 'API' : 'Cache';
  
  return {
    ...data,
    source,
  };
}