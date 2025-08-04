import { useToast } from '@/hooks/use-toast';

/**
 * Error handling utilities for TopicsByUnit components
 */

export const createErrorHandler = (toast: ReturnType<typeof useToast>['toast']) => {
  return {
    handleApiError: (error: unknown, context: string) => {
      console.error(`API Error in ${context}:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${context}. Please try again.`,
        variant: 'destructive',
      });
    },

    handleVocabularyError: (error: unknown, contentTitle: string) => {
      console.error('Vocabulary extraction error:', error);
      toast({
        title: 'Vocabulary Error',
        description: `Could not extract vocabulary from "${contentTitle}". Please check the content format.`,
        variant: 'destructive',
      });
    },

    handleModalError: (error: unknown, modalType: string) => {
      console.error(`Modal error (${modalType}):`, error);
      toast({
        title: 'Modal Error',
        description: `Failed to open ${modalType}. Please try again.`,
        variant: 'destructive',
      });
    },

    handleStateError: (error: unknown, operation: string) => {
      console.error(`State error during ${operation}:`, error);
      toast({
        title: 'State Error',
        description: `Something went wrong during ${operation}. Please refresh the page.`,
        variant: 'destructive',
      });
    }
  };
};

/**
 * Safe vocabulary extraction with error handling
 */
export const safeExtractVocabulary = (content: any): string[] => {
  try {
    if (!content || !content.infor1) {
      console.warn('No vocabulary content found in infor1');
      return [];
    }

    const text = content.infor1;
    if (typeof text !== 'string') {
      console.warn('infor1 is not a string:', typeof text);
      return [];
    }

    // Split by comma or forward slash, then clean each word
    const words = text
      .split(/[,/]/)
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .map(word => {
        // Remove common markdown formatting and punctuation
        return word
          .replace(/[*_`~]/g, '') // Remove markdown formatting
          .replace(/[.!?;:]/g, '') // Remove punctuation
          .replace(/^\s+|\s+$/g, '') // Trim whitespace
          .toLowerCase();
      })
      .filter(word => word.length > 0);

    // Remove duplicates
    return [...new Set(words)];
  } catch (error) {
    console.error('Error extracting vocabulary:', error);
    return [];
  }
};

/**
 * Safe API call wrapper with retry logic
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  retries: number = 2,
  delay: number = 1000
): Promise<T | null> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`API call attempt ${attempt + 1} failed:`, error);
      
      if (attempt === retries) {
        console.error('All API call attempts failed');
        return null;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
};

/**
 * Validation utilities
 */
export const validateProps = {
  content: (content: any): boolean => {
    return content && typeof content === 'object' && content.id;
  },
  
  topic: (topic: any): boolean => {
    return topic && typeof topic === 'object' && topic.id && topic.topic;
  },
  
  unitGroup: (unitGroup: any): boolean => {
    return unitGroup && typeof unitGroup === 'object' && unitGroup.unit && Array.isArray(unitGroup.topics);
  }
};

/**
 * Safe state update wrapper
 */
export const safeStateUpdate = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  newState: T | ((prev: T) => T),
  errorHandler?: (error: unknown) => void
) => {
  try {
    setState(newState);
  } catch (error) {
    console.error('State update error:', error);
    if (errorHandler) {
      errorHandler(error);
    }
  }
};

/**
 * Debounce utility to prevent excessive API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

/**
 * Check if component is mounted (for cleanup)
 */
export const createMountedRef = () => {
  const mountedRef = { current: true };
  
  const cleanup = () => {
    mountedRef.current = false;
  };
  
  const isMounted = () => mountedRef.current;
  
  return { cleanup, isMounted };
};
