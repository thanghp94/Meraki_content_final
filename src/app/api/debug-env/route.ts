import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasGiphyKey: !!process.env.GIPHY_API_KEY,
    hasGoogleKey: !!process.env.GOOGLE_API_KEY,
    hasSearchEngineId: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
    hasGoogleAiKey: !!process.env.GOOGLE_AI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    // For debugging - show first few characters (never show full keys)
    giphyKeyPreview: process.env.GIPHY_API_KEY ? process.env.GIPHY_API_KEY.substring(0, 8) + '...' : 'missing',
    googleKeyPreview: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 8) + '...' : 'missing',
  });
}
