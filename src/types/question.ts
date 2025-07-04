export type ContentType = 'text' | 'image' | 'mixed';

export interface ContentData {
  type: ContentType;
  text?: string;
  image?: string;
}

export interface EnhancedFormData {
  chuong_trinh: string;
  questionlevel: string;
  contentid: string;
  question_type: string;
  questionContent: ContentData;
  choice1Content: ContentData;
  choice2Content: ContentData;
  choice3Content: ContentData;
  choice4Content: ContentData;
  correct_choice: string;
  time: string;
  explanation: string;
  answer: string;
  video: string;
  picture: string;
}

// Utility functions for backward compatibility
export const parseContentData = (data: string | null | undefined): ContentData => {
  if (!data) {
    return { type: 'text', text: '', image: undefined };
  }

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(data);
    if (parsed.type && (parsed.text !== undefined || parsed.image !== undefined)) {
      return parsed; // It's new enhanced format
    }
  } catch {
    // Not JSON, treat as plain text
  }
  
  // Fallback: treat as plain text (backward compatible)
  return { 
    type: 'text', 
    text: data,
    image: undefined 
  };
};

export const stringifyContentData = (content: ContentData): string => {
  // If it's just text with no image, save as plain string for backward compatibility
  if (content.type === 'text' && !content.image && content.text) {
    return content.text;
  }
  
  // Otherwise, save as JSON for enhanced features
  return JSON.stringify(content);
};

export const getContentText = (content: ContentData): string => {
  return content.text || '';
};

export const getContentImage = (content: ContentData): string | undefined => {
  return content.image;
};
