import { authService } from './authService';

// Cache for storing calculated points per question ID per user
const pointsCaches = new Map<string, Map<string, number>>();

/**
 * Get user-specific points cache
 */
const getUserPointsCache = (): Map<string, number> => {
  const userId = authService.getCurrentUser()?.id || 'anonymous';
  
  if (!pointsCaches.has(userId)) {
    pointsCaches.set(userId, new Map<string, number>());
  }
  
  return pointsCaches.get(userId)!;
};

// Hybrid point system with caching - uses existing points or generates/caches random ones
export const getQuestionPoints = (question: any): number => {
  // If question already has points (hardcoded quiz data), use them
  if (question?.points && typeof question.points === 'number' && !isNaN(question.points)) {
    return question.points;
  }
  
  // For database questions, check user-specific cache first
  const questionId = question?.id;
  const cache = getUserPointsCache();
  
  if (questionId && cache.has(questionId)) {
    return cache.get(questionId)!;
  }
  
  // Generate random points and cache them
  const randomPoints = getRandomPoints(questionId);
  if (questionId) {
    cache.set(questionId, randomPoints);
  }
  
  return randomPoints;
};

// Generic random point distribution system (for database questions)
export const getRandomPoints = (questionId?: string): number => {
  const seed = questionId ? questionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Math.random() * 1000;
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  
  const pointOptions = [
    { points: 5, weight: 0.1 },   // 10% chance - 5 points
    { points: 10, weight: 0.3 },  // 30% chance - 10 points  
    { points: 15, weight: 0.3 },  // 30% chance - 15 points
    { points: 20, weight: 0.2 },  // 20% chance - 20 points
    { points: 25, weight: 0.1 },  // 10% chance - 25 points
  ];
  
  let cumulative = 0;
  for (const option of pointOptions) {
    cumulative += option.weight;
    if (random <= cumulative) {
      return option.points;
    }
  }
  
  return 10; // Fallback
};

// Optional: Clear cache when starting a new game
export const clearPointsCache = (): void => {
  const cache = getUserPointsCache();
  cache.clear();
};

// Optional: Get cache size for debugging
export const getCacheSize = (): number => {
  const cache = getUserPointsCache();
  return cache.size;
};
