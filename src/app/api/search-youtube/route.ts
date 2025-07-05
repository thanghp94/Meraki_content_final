import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      // Fallback to mock data if no API key is configured
      console.log('No YouTube API key found, using mock data');
      const mockVideos = [
        {
          id: 'mock1',
          title: `${query} - Educational Video`,
          thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '3:32',
          channelTitle: 'Educational Channel',
          description: `Learn about ${query} in this comprehensive educational video.`
        },
        {
          id: 'mock2',
          title: `${query} Tutorial - Step by Step Guide`,
          thumbnail: `https://img.youtube.com/vi/oHg5SJYRHA0/mqdefault.jpg`,
          url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
          duration: '10:15',
          channelTitle: 'Tutorial Channel',
          description: `Complete tutorial on ${query} with practical examples.`
        },
        {
          id: 'mock3',
          title: `${query} Explained Simply`,
          thumbnail: `https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg`,
          url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
          duration: '7:45',
          channelTitle: 'Science Channel',
          description: `Simple explanation of ${query} concepts for beginners.`
        }
      ];
      
      return NextResponse.json({ videos: mockVideos });
    }

    // Real YouTube API call
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=12&order=relevance&safeSearch=strict`;
    
    const response = await fetch(youtubeUrl);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Get video details for duration
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    // Create a map of video durations
    const durationMap = detailsData.items.reduce((acc: any, item: any) => {
      acc[item.id] = item.contentDetails.duration;
      return acc;
    }, {});
    
    // Format the videos
    const videos = data.items.map((item: any) => {
      const duration = durationMap[item.id.videoId] || 'PT0S';
      const formattedDuration = formatDuration(duration);
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration: formattedDuration,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description
      };
    });
    
    return NextResponse.json({ videos });
    
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}

// Helper function to format ISO 8601 duration to readable format
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  if (!match) return '0:00';
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  let formatted = '';
  
  if (hours) {
    formatted += `${hours}:`;
  }
  
  if (minutes) {
    formatted += hours ? minutes.padStart(2, '0') : minutes;
  } else {
    formatted += hours ? '00' : '0';
  }
  
  formatted += ':';
  
  if (seconds) {
    formatted += seconds.padStart(2, '0');
  } else {
    formatted += '00';
  }
  
  return formatted;
}
