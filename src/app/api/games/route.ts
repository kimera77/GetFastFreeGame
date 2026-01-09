'use server';

import { fetchAndCacheFreeGames } from '@/ai/flows/fetch-and-cache-free-games';
import { NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes

export async function GET() {
  try {
    const result = await fetchAndCacheFreeGames('Epic Games Store,Amazon Prime Gaming,GOG,Steam');
    return NextResponse.json(result);
  } catch (e) {
    console.error("Failed to fetch games in API route:", e);
    const error = e instanceof Error ? e : new Error('An unknown error occurred.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
