import { NextResponse } from 'next/server';

// Mock content data that matches your Nostradamus example
const nostradamusContent = {
  id: 'nostradamus-sample',
  title: 'Nostradamus and his prediction',
  content: `Real name: Michel de Nostredame, French astrologer, physician.

Known for: Les Prophéties, 900+ quatrains predicting events.

Impact: Predictions on French Revolution, Hitler; inspired books, movies.

Nostradamus: His real name was Michel de Nostredame, a French astrologer and physician.

Prophecies: He is known for his book Les Prophéties, containing over 900 quatrains predicting future events.

Historical Impact: Nostradamus's predictions include major events like the French Revolution and the rise of Hitler.

Interpretation: His writings are often vague, leading to varied interpretations, making them popular over time.

Cultural Influence: Nostradamus has inspired countless books, movies, and discussions about prophecy and fate.`,
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=face',
  image2: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  video2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  unit: 'History',
  topic: 'Famous Predictions',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(nostradamusContent);
  } catch (error) {
    console.error('Error fetching sample content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
