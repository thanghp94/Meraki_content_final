'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { TopicsByUnitLayout } from './components/layout/TopicsByUnitLayout';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { LoadingState } from './components/layout/LoadingState';
import { useTopicsByUnit } from './hooks/useTopicsByUnit';
import { Topic, Content, UnitGroup, GameSetupData } from './types';

interface TopicsByUnitContainerProps {
  programFilter?: string;
  onProgramChange?: (program: 'Grapeseed' | 'TATH') => void;
}

export const TopicsByUnitContainer: React.FC<TopicsByUnitContainerProps> = ({
  programFilter,
  onProgramChange
}) => {
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    unitGroups,
    content,
    expandedUnits,
    expandedTopics,
    isLoading,
    isMounted,
    loadingTopics,
    isLoadingUnitQuestions,
    toggleUnit,
    toggleTopic,
    handleUnitPlayClick,
    handleTopicPlayClick,
    getContentForTopic,
  } = useTopicsByUnit(programFilter);

  // Handle client-side mounting
  if (!isMounted) {
    return <LoadingState />;
  }

  // Handle loading state
  if (isLoading) {
    return <LoadingState />;
  }

  const handleUnitPlay = async (unitGroup: UnitGroup) => {
    try {
      const gameSetupData = await handleUnitPlayClick(unitGroup);
      
      // Navigate to make-game page with the setup data
      const searchParams = new URLSearchParams({
        contentIds: gameSetupData.contentIds?.join(',') || '',
        unit: gameSetupData.unit || '',
        topicName: gameSetupData.topicName || '',
        mode: 'unit'
      });
      
      router.push(`/make-game?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error setting up unit game:', error);
    }
  };

  const handleTopicPlay = async (topic: Topic, topicContent: Content[]) => {
    try {
      const gameSetupData = await handleTopicPlayClick(topic);
      
      // Navigate to make-game page with the setup data
      const searchParams = new URLSearchParams({
        contentIds: gameSetupData.contentIds?.join(',') || '',
        topicId: gameSetupData.topicId || '',
        topicName: gameSetupData.topicName || '',
        mode: 'topic'
      });
      
      router.push(`/make-game?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error setting up topic game:', error);
    }
  };

  const handleTopicReview = (topic: Topic, topicContent: Content[]) => {
    // Navigate to review mode
    const searchParams = new URLSearchParams({
      contentIds: topicContent.map(c => c.id).join(','),
      topicId: topic.id,
      topicName: topic.topic,
      mode: 'review'
    });
    
    router.push(`/make-game?${searchParams.toString()}`);
  };

  const handleContentClick = (contentId: string) => {
    // Handle individual content click - could open a modal or navigate
    console.log('Content clicked:', contentId);
  };

  const handleContentPlay = (content: Content) => {
    // Navigate to make-game page with single content
    const searchParams = new URLSearchParams({
      contentIds: content.id,
      topicName: content.title || 'Content',
      mode: 'content'
    });
    
    router.push(`/make-game?${searchParams.toString()}`);
  };

  const handleContentReview = (content: Content) => {
    // Navigate to review mode with single content
    const searchParams = new URLSearchParams({
      contentIds: content.id,
      topicName: content.title || 'Content',
      mode: 'review'
    });
    
    router.push(`/make-game?${searchParams.toString()}`);
  };

  const sidebar = (
    <Sidebar
      programFilter={programFilter}
      onProgramChange={onProgramChange}
      unitGroups={unitGroups}
      expandedUnits={expandedUnits}
      isLoadingUnitQuestions={isLoadingUnitQuestions}
      onUnitClick={toggleUnit}
      onUnitPlayClick={handleUnitPlay}
    />
  );

  const mainContent = (
    <MainContent
      unitGroups={unitGroups}
      expandedUnits={expandedUnits}
      expandedTopics={expandedTopics}
      loadingTopics={loadingTopics}
      getContentForTopic={getContentForTopic}
      onTopicClick={toggleTopic}
      onTopicPlayClick={handleTopicPlay}
      onTopicReviewClick={handleTopicReview}
      onContentClick={handleContentClick}
      onContentPlayClick={handleContentPlay}
      onContentReviewClick={handleContentReview}
    />
  );

  return (
    <TopicsByUnitLayout
      sidebar={sidebar}
      mainContent={mainContent}
    />
  );
};
