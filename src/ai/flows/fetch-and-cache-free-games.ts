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

const initialPromptText = `The goal is to claim games that are available for a limited time only.

This excludes games that are always free, trials, betas, games you can play for a while and then can't anymore, and demos.

The games must be available for a limited time to claim and keep forever.

The games to claim must be from these platforms: Steam, GOG, Epic Games, and Amazon Gaming (Luna). it's mandatory search games for this 4 platforms



For your search for games on Amazon, primarily rely on this website: https://luna.amazon.com/claims/.

for games Steam, strictly check https://steamdb.info/upcoming/free/ for games labeled "Free Sub/Promo" or "Free on Demand" that are in the "Keep forever" category. Also use this website: https://store.steampowered.com/specials. Make sure they are not permanently Free-to-Play.

For Epic Games titles, refer to this website: https://store.epicgames.com/en-US/free-games.

There is no dedicated website for GOG games, although it always starts with https://www.gog.com/



---



### Data Mapping and Link Accuracy Rules



1.  **Platform (STRICT):** The platform key **MUST** clearly state the platform *where the game is claimed* (e.g., if the game is claimed via Amazon Prime Gaming, but is a Steam key, the platform should be 'Amazon Prime Gaming' because that is the claiming source). Use ONLY the allowed values: 'Epic Games Store', 'Amazon Prime Gaming', 'GOG', or 'Steam'.

2.  **dealLink (CRITICAL):** This **MUST** be the **DIRECT HTTPS URL** that leads the user to the specific game's claiming page. It must be the most direct link to claim or add the game to the library.

3.  **imageURL (MANDATORY):** This **MUST** be a valid HTTPS URL for the game's official artwork. The URL **MUST** strictly belong to one of the allowed hostnames: ${ALLOWED_IMAGE_HOSTNAMES.join(', ')}. If a valid image URL from the allowed list cannot be found, the game **MUST BE EXCLUDED**. **The imageURL domain is independent of the platform domain.**



---



### Output Format Rules (STRICT JSON)



1.  **JSON ONLY:** Your entire response **MUST** be a single, valid JSON array. Do not include any explanations, markdown (like \`\`\`json), comments, or text outside the JSON structure.

2.  **Schema (STRICT):** The JSON array elements **MUST** strictly adhere to this schema:

    * "title" (string)

    * "platform" (string: one of the allowed platforms above)

    * "dealLink" (string, valid HTTPS URL)

    * "imageURL" (string, valid HTTPS URL from allowed domains)

    * "endDate" (string, ISO 8601 format or empty string \`""\`)

    * "original_price" (string, may be empty \`""\` or use format like "$19.99")

3.  **Errors:** If you cannot produce a valid array of objects that follow **all** the rules, return an empty JSON array: \`[]\`.

Return ONLY the JSON array.`;


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
        const jsonEndIndex = raw.lastIndexOf(']');
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
