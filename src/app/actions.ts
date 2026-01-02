
'use server';

import { retrieveGameplayPreview } from '@/ai/flows/retrieve-gameplay-preview';

export async function getGameplayVideo(gameTitle: string) {
  try {
    const result = await retrieveGameplayPreview({ gameTitle });
    if (result && result.youtubeVideoId) {
      return { success: true, videoId: result.youtubeVideoId };
    }
    return { success: false, error: 'Could not find a gameplay video.' };
  } catch (error) {
    console.error('Error retrieving gameplay preview:', error);
    return { success: false, error: 'An error occurred while fetching the video.' };
  }
}
