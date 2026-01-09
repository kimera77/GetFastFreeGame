'use server';

import { revalidatePath } from 'next/cache';

export async function clearGamesCache() {
  console.log('Revalidating cache for path: /api/games');
  revalidatePath('/api/games');
}