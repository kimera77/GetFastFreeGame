'use server';
/**
 * @fileOverview This file defines a Genkit flow to retrieve relevant gameplay previews from YouTube based on game titles.
 *
 * retrieveGameplayPreview - A function that takes a game title and returns a YouTube video ID.
 * RetrieveGameplayPreviewInput - The input type for the retrieveGameplayPreview function.
 * RetrieveGameplayPreviewOutput - The return type for the retrieveGameplayPreview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RetrieveGameplayPreviewInputSchema = z.object({
  gameTitle: z.string().describe('The title of the game to search for.'),
});
export type RetrieveGameplayPreviewInput = z.infer<typeof RetrieveGameplayPreviewInputSchema>;

const RetrieveGameplayPreviewOutputSchema = z.object({
  youtubeVideoId: z.string().describe('The ID of the YouTube video.'),
});
export type RetrieveGameplayPreviewOutput = z.infer<typeof RetrieveGameplayPreviewOutputSchema>;

export async function retrieveGameplayPreview(input: RetrieveGameplayPreviewInput): Promise<RetrieveGameplayPreviewOutput> {
  return retrieveGameplayPreviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'retrieveGameplayPreviewPrompt',
  input: {schema: RetrieveGameplayPreviewInputSchema},
  output: {schema: RetrieveGameplayPreviewOutputSchema},
  prompt: `You are an AI assistant that retrieves YouTube video IDs for gameplay previews based on game titles.

  Given the game title, search YouTube for relevant gameplay previews and extract the video ID.
  Return only the video ID.

  Game Title: {{{gameTitle}}}
  `,
});

const retrieveGameplayPreviewFlow = ai.defineFlow(
  {
    name: 'retrieveGameplayPreviewFlow',
    inputSchema: RetrieveGameplayPreviewInputSchema,
    outputSchema: RetrieveGameplayPreviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
