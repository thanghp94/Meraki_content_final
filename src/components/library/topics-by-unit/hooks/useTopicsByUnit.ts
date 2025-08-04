'use client';

import { useState, useEffect, useRef } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/hooks/use-toast';
import { UnitGroup, Topic, Content, GameSetupData } from '../types';
import { getContentForTopic, loadTopicContent, loadUnitQuestions } from '../utils/topicUtils';

export const useTopicsByUnit = (programFilter?: string) => {
  const { toast } = useToast();
  const {
    libraryState,
    setUnitGroups,
    addContent,
    setExpandedUnits,
    setExpandedTopics,
    markTopicAsLoaded,
    isTopicLoaded,
  } = useLibrary();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState<Set<string>>(new Set());
  const [isLoadingUnitQuestions, setIsLoadingUnitQuestions] = useState(false);
  
  // Extract state from context
  const { unitGroups, content, expandedUnits, expandedTopics } = libraryState;
  
  // Track if we've already fetched data for this program to prevent infinite loops
  const lastFetchedProgram = useRef<string | null>(null);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Build API URL with program filter if provided (no unit filter for initial load)
        const topicsUrl = programFilter 
          ? `/api/topics/by-unit?program=${encodeURIComponent(programFilter)}`
          : '/api/topics/by-unit';
        
        console.log('Fetching initial placeholders for program:', programFilter, 'URL:', topicsUrl);
        
        // Only fetch topics initially, content will be loaded lazily when topics are expanded
        const topicsResponse = await fetch(topicsUrl);
        
        if (!topicsResponse.ok) {
          throw new Error('Failed to fetch topics');
        }
        
        const topicsData = await topicsResponse.json();
        
        console.log('Received initial placeholders for', programFilter, ':', topicsData);
        
        setUnitGroups(topicsData);
        lastFetchedProgram.current = programFilter || null;
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if programFilter is provided and we haven't already fetched for this program
    if (programFilter && lastFetchedProgram.current !== programFilter) {
      fetchInitialData();
    }
  }, [programFilter, setUnitGroups]);

  const toggleUnit = async (unit: string) => {
    // Only allow one unit to be selected at a time
    if (expandedUnits.has(unit)) {
      // If clicking the same unit, collapse it
      setExpandedUnits(new Set());
    } else {
      // If clicking a different unit, expand only that one
      setExpandedUnits(new Set([unit]));
      
      // Check if this unit already has topics loaded
      const unitGroup = unitGroups.find(group => group.unit === unit);
      if (unitGroup && unitGroup.topics.length === 0 && programFilter) {
        // Fetch topics for this specific unit
        try {
          console.log('Fetching topics for unit:', unit, 'program:', programFilter);
          const topicsUrl = `/api/topics/by-unit?program=${encodeURIComponent(programFilter)}&unit=${encodeURIComponent(unit)}`;
          const response = await fetch(topicsUrl);
          
          if (!response.ok) {
            throw new Error('Failed to fetch unit topics');
          }
          
          const unitData = await response.json();
          console.log('Received topics for unit:', unit, unitData);
          
          // Update the specific unit with its topics
          if (unitData.length > 0 && unitData[0].topics) {
            const updatedGroups = unitGroups.map((group: UnitGroup) =>
              group.unit === unit
                ? { ...group, topics: unitData[0].topics }
                : group
            );
            setUnitGroups(updatedGroups);
          }
        } catch (error) {
          console.error('Error fetching topics for unit:', unit, error);
        }
      }
    }
  };

  const toggleTopic = async (topicId: string) => {
    // Only allow one topic to be expanded at a time
    if (expandedTopics.has(topicId)) {
      // If clicking the same topic, collapse it
      setExpandedTopics(new Set());
    } else {
      // If clicking a different topic, expand only that one
      setExpandedTopics(new Set([topicId]));
      
      // Check if content for this topic is already loaded
      const hasContentForTopic = content.some(item => item.topicid === topicId) || isTopicLoaded(topicId);
      
      if (!hasContentForTopic) {
        // Set loading state for this topic
        setLoadingTopics(prev => new Set([...prev, topicId]));
        
        try {
          const topicContent = await loadTopicContent(topicId);
          
          // Add the new content to existing content
          if (topicContent.length > 0) {
            console.log('Adding', topicContent.length, 'content items to state');
            addContent(topicContent);
            markTopicAsLoaded(topicId);
          } else {
            console.log('No content returned for topic:', topicId);
            markTopicAsLoaded(topicId); // Mark as loaded even if empty
          }
        } catch (error) {
          console.error('Error fetching content for topic:', topicId, error);
        } finally {
          // Remove loading state for this topic
          setLoadingTopics(prev => {
            const newSet = new Set(prev);
            newSet.delete(topicId);
            return newSet;
          });
        }
      }
    }
  };

  const handleUnitPlayClick = async (unitGroup: UnitGroup): Promise<GameSetupData> => {
    setIsLoadingUnitQuestions(true);
    
    // Show loading toast
    toast({
      title: "Loading Questions",
      description: "Please wait while we load questions for all lessons...",
    });
    
    try {
      // Load questions for all topics in the unit
      const topicsWithQuestions = await loadUnitQuestions(unitGroup.topics);
      
      console.log('All topics with questions:', topicsWithQuestions);
      
      // Calculate total questions
      const totalQuestions = topicsWithQuestions.reduce((sum, topic) => 
        sum + (topic.questions?.length || 0), 0
      );
      
      // Show success toast
      toast({
        title: "Questions Loaded Successfully!",
        description: `Found ${totalQuestions} questions across ${topicsWithQuestions.length} lessons.`,
      });
      
      // Collect all content IDs from all topics in the unit
      const allContentIds = unitGroup.topics
        .flatMap(topic => getContentForTopic(topic, content))
        .map(content => content.id);
      
      return {
        contentIds: allContentIds,
        unit: unitGroup.unit,
        topicName: unitGroup.unit,
        unitTopics: topicsWithQuestions // Pass the topics with loaded questions
      };
    } catch (error) {
      console.error('Error loading unit questions:', error);
      toast({
        title: "Error Loading Questions",
        description: "Failed to load questions for the unit.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoadingUnitQuestions(false);
    }
  };

  const handleTopicPlayClick = async (topic: Topic): Promise<GameSetupData> => {
    try {
      // First, get content for this topic (may need to load it)
      let topicContent = getContentForTopic(topic, content);
      
      // If no content in cache, load it directly
      if (topicContent.length === 0) {
        console.log(`Loading content for individual topic ${topic.id} directly`);
        topicContent = await loadTopicContent(topic.id);
        
        if (topicContent.length === 0) {
          toast({
            title: "No Content Found",
            description: `No content available for ${topic.topic}`,
            variant: "destructive"
          });
          throw new Error(`No content found for ${topic.topic}`);
        }
      }
      
      return {
        contentIds: topicContent.map(content => content.id),
        topicId: topic.id,
        topicName: topic.topic
      };
    } catch (error) {
      console.error(`Error loading content for individual topic ${topic.id}:`, error);
      toast({
        title: "Error Loading Content",
        description: `Failed to load content for ${topic.topic}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    // State
    unitGroups,
    content,
    expandedUnits,
    expandedTopics,
    isLoading,
    isMounted,
    loadingTopics,
    isLoadingUnitQuestions,
    
    // Actions
    toggleUnit,
    toggleTopic,
    handleUnitPlayClick,
    handleTopicPlayClick,
    getContentForTopic: (topic: Topic) => getContentForTopic(topic, content),
  };
};
