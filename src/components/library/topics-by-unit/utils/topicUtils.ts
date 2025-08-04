import { Content, Topic } from '../types';

/**
 * Get content by topic ID, filtering out hidden content and sorting by order_index
 */
export const getContentForTopic = (topic: Topic, content: Content[]): Content[] => {
  return content
    .filter(item => item.topicid === topic.id)
    .filter(item => item.visible !== false) // Only show visible content (default to visible if not specified)
    .sort((a, b) => {
      // Sort by order_index, with items without order_index appearing last
      const orderA = a.order_index ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order_index ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
};

/**
 * Load content for a specific topic from API
 */
export const loadTopicContent = async (topicId: string): Promise<Content[]> => {
  try {
    console.log('Fetching content for topic:', topicId);
    const url = `/api/admin/content/paginated?topicIds=${encodeURIComponent(topicId)}&limit=50`;
    console.log('Fetching from URL:', url);
    
    const contentResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      console.error('API Error:', contentResponse.status, contentResponse.statusText, errorText);
      throw new Error(`Failed to fetch topic content: ${contentResponse.status} - ${contentResponse.statusText}`);
    }
    
    const contentData = await contentResponse.json();
    console.log('Received content for topic:', topicId, contentData);
    
    return contentData.content || [];
  } catch (error) {
    console.error('Error fetching content for topic:', topicId, error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - server might be down or unreachable');
    }
    
    // Fallback: try to get content from the original API
    try {
      console.log('Trying fallback API for topic:', topicId);
      const fallbackResponse = await fetch('/api/admin/content', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const topicContent = fallbackData.filter((item: any) => item.topicid === topicId);
        console.log('Fallback: Found', topicContent.length, 'content items');
        return topicContent;
      } else {
        console.error('Fallback API also returned error:', fallbackResponse.status, fallbackResponse.statusText);
      }
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
    }
    
    // Return empty array instead of throwing to prevent UI crashes
    console.warn('Returning empty content array for topic:', topicId);
    return [];
  }
};

/**
 * Load questions for all topics in a unit
 */
export const loadUnitQuestions = async (topics: Topic[]): Promise<Topic[]> => {
  return Promise.all(
    topics.map(async (topic) => {
      console.log(`Processing topic: ${topic.topic} (ID: ${topic.id})`);
      let allQuestions: any[] = [];
      
      // First, get content for this topic
      const topicContent = await loadTopicContent(topic.id);
      console.log(`Topic ${topic.topic} has ${topicContent.length} content items`);
      
      // Now load questions from each content item
      for (const contentItem of topicContent) {
        try {
          console.log(`Loading questions for content ${contentItem.id} (${contentItem.title})`);
          const response = await fetch(`/api/admin/content/${contentItem.id}`);
          if (response.ok) {
            const contentData = await response.json();
            console.log(`Content ${contentItem.id} response:`, contentData);
            if (contentData.questions && Array.isArray(contentData.questions)) {
              console.log(`Found ${contentData.questions.length} questions for content ${contentItem.id}`);
              allQuestions.push(...contentData.questions);
            } else {
              console.log(`No questions found for content ${contentItem.id}`);
            }
          } else {
            console.error(`Failed to fetch content ${contentItem.id}: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error loading questions for content ${contentItem.id}:`, error);
        }
      }
      
      console.log(`Topic ${topic.topic} loaded ${allQuestions.length} questions total`);
      return {
        ...topic,
        questions: allQuestions
      };
    })
  );
};

/**
 * Color utility functions for consistent styling
 */
export const getUnitColors = (index: number) => {
  const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'];
  const selectedColors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const colorIndex = index % colors.length;
  
  return {
    normal: colors[colorIndex],
    selected: selectedColors[colorIndex],
    colorIndex
  };
};

export const getTopicColors = (index: number) => {
  const buttonColors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const hoverColors = ['hover:bg-red-500', 'hover:bg-blue-500', 'hover:bg-green-500', 'hover:bg-yellow-500', 'hover:bg-purple-500', 'hover:bg-pink-500'];
  const colorIndex = index % buttonColors.length;
  
  return {
    button: buttonColors[colorIndex],
    hover: hoverColors[colorIndex],
    colorIndex
  };
};

export const getContentColors = (index: number) => {
  const cardColors = ['from-red-200 to-red-300', 'from-blue-200 to-blue-300', 'from-green-200 to-green-300', 'from-yellow-200 to-yellow-300', 'from-purple-200 to-purple-300', 'from-pink-200 to-pink-300'];
  const borderColors = ['border-red-400', 'border-blue-400', 'border-green-400', 'border-yellow-400', 'border-purple-400', 'border-pink-400'];
  const colorIndex = index % cardColors.length;
  
  return {
    card: cardColors[colorIndex],
    border: borderColors[colorIndex],
    colorIndex
  };
};
