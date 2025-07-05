import { NextResponse } from 'next/server';

interface ImageResult {
  type: 'giphy' | 'google';
  url: string;
  thumbnail: string;
  title: string;
}

// GIPHY Search
async function searchGiphy(query: string): Promise<ImageResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  if (!apiKey) {
    throw new Error('GIPHY API key not configured');
  }

  const response = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
  );
  const data = await response.json();
  
  return data.data.map((gif: any) => ({
    type: 'giphy' as const,
    url: gif.images.fixed_height.url,
    thumbnail: gif.images.fixed_height_small.url,
    title: gif.title,
  }));
}

// Google Custom Search
async function searchGoogleImages(query: string): Promise<ImageResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    throw new Error('Google Search API not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&safe=active`
  );
  const data = await response.json();
  
  return data.items?.map((item: any) => ({
    type: 'google' as const,
    url: item.link,
    thumbnail: item.image.thumbnailLink,
    title: item.title,
  })) || [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const source = searchParams.get('source') || 'all';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    let results: ImageResult[] = [];

    if (source === 'all' || source === 'giphy') {
      try {
        const giphyResults = await searchGiphy(query);
        results = [...results, ...giphyResults];
      } catch (error) {
        console.error('GIPHY search error:', error);
      }
    }

    if (source === 'all' || source === 'google') {
      try {
        const googleResults = await searchGoogleImages(query);
        results = [...results, ...googleResults];
      } catch (error) {
        console.error('Google search error:', error);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}
