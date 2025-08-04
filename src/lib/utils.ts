import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract vocabulary words from text content
 * Words are separated by commas (,) or forward slashes (/)
 */
export function extractVocabularyWords(text: string): string[] {
  if (!text || typeof text !== 'string') {
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
}
