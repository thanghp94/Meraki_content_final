'use client';

import { Topic } from '../types';

/**
 * Groups topics by unit for display
 */
export const getTopicsByUnit = (topics: Topic[]): { [key: string]: Topic[] } => {
  const grouped: { [key: string]: Topic[] } = {};
  
  topics.forEach(topic => {
    const unit = topic.unit || 'No Unit';
    if (!grouped[unit]) {
      grouped[unit] = [];
    }
    grouped[unit].push(topic);
  });

  // Sort topics within each unit by order_index
  Object.keys(grouped).forEach(unit => {
    grouped[unit].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  });

  return grouped;
};

/**
 * Filters topics based on search term and selected program
 */
export const filterTopics = (
  topics: Topic[],
  searchTerm: string,
  selectedProgram: string
): Topic[] => {
  return topics.filter(topic => {
    const matchesSearch = !searchTerm || 
      topic.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.short_summary && topic.short_summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProgram = !selectedProgram || topic.program === selectedProgram;
    
    return matchesSearch && matchesProgram;
  });
};

/**
 * Gets topics for a specific unit
 */
export const getTopicsForUnit = (
  topics: Topic[],
  selectedUnit: string | null,
  searchTerm: string,
  selectedProgram: string
): Topic[] => {
  if (!selectedUnit) return [];
  
  const filteredTopics = filterTopics(topics, searchTerm, selectedProgram);
  
  return filteredTopics.filter(topic => topic.unit === selectedUnit);
};

/**
 * Validates topic form data
 */
export const validateTopicForm = (formData: {
  topic: string;
  short_summary: string;
  unit: string;
  program: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!formData.topic.trim()) {
    errors.push('Topic name is required');
  }
  
  if (!formData.unit.trim()) {
    errors.push('Unit is required');
  }
  
  if (!formData.program.trim()) {
    errors.push('Program is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates content form data
 */
export const validateContentForm = (formData: {
  title: string;
  topicid: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!formData.title.trim()) {
    errors.push('Content title is required');
  }
  
  if (!formData.topicid.trim()) {
    errors.push('Topic selection is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats topic display name
 */
export const formatTopicDisplayName = (topic: Topic): string => {
  return `${topic.topic}${topic.short_summary ? ` - ${topic.short_summary}` : ''}`;
};

/**
 * Gets available units from topics
 */
export const getAvailableUnits = (topics: Topic[]): string[] => {
  const units = new Set<string>();
  
  topics.forEach(topic => {
    if (topic.unit) {
      units.add(topic.unit);
    }
  });
  
  return Array.from(units).sort();
};

/**
 * Gets topic count by unit
 */
export const getTopicCountByUnit = (topics: Topic[]): { [unit: string]: number } => {
  const counts: { [unit: string]: number } = {};
  
  topics.forEach(topic => {
    const unit = topic.unit || 'No Unit';
    counts[unit] = (counts[unit] || 0) + 1;
  });
  
  return counts;
};
