'use server';

import { revalidateTag } from 'next/cache';

export async function clearGamesCache() {
  console.log('Revalidating cache for free-games-data-v3');
  revalidateTag('free-games-data-v3');
}
