'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { TopicButton } from '../topics/TopicButton';
import { ContentCard } from '../topics/ContentCard';
import { UnitGroup, Topic, Content } from '../../types';

interface MainContentProps {
  unitGroups: UnitGroup[];
  expandedUnits: Set<string>;
  expandedTopics: Set<string>;
  loadingTopics: Set<string>;
  getContentForTopic: (topic: Topic) => Content[];
  onTopicClick: (topicId: string) => void;
  onTopicPlayClick: (topic: Topic, topicContent: Content[]) => void;
  onTopicReviewClick?: (topic: Topic, topicContent: Content[]) => void;
  onContentClick: (contentId: string) => void;
  onContentPlayClick: (content: Content) => void;
  onContentReviewClick?: (content: Content) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  unitGroups,
  expandedUnits,
  expandedTopics,
  loadingTopics,
  getContentForTopic,
  onTopicClick,
  onTopicPlayClick,
  onTopicReviewClick,
  onContentClick,
  onContentPlayClick,
  onContentReviewClick
}) => {
  // Global state to track which button is active across all topics
  const [activeButton, setActiveButton] = useState<{topicId: string, buttonType: 'play' | 'review'} | null>(null);

  const handleTopicPlayClick = (topic: Topic, topicContent: Content[]) => {
    setActiveButton({topicId: topic.id, buttonType: 'play'});
    onTopicPlayClick(topic, topicContent);
    // Reset after a delay to show the effect
    setTimeout(() => setActiveButton(null), 2000);
  };

  const handleTopicReviewClick = (topic: Topic, topicContent: Content[]) => {
    setActiveButton({topicId: topic.id, buttonType: 'review'});
    onTopicReviewClick?.(topic, topicContent);
    // Reset after a delay to show the effect
    setTimeout(() => setActiveButton(null), 2000);
  };

  if (expandedUnits.size === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {unitGroups.map((unitGroup) => {
        const isExpanded = expandedUnits.has(unitGroup.unit);
        
        if (!isExpanded) return null;
        
        return (
          <div key={`${unitGroup.unit}-content`} className="w-full">
            <div className="space-y-4">
              {/* Compact Lesson Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {unitGroup.topics.map((topic, index) => {
                  const topicContent = getContentForTopic(topic);
                  
                  return (
                    <TopicButton
                      key={`${unitGroup.unit}-${topic.id}-${index}`}
                      topic={topic}
                      index={index}
                      isExpanded={expandedTopics.has(topic.id)}
                      topicContent={topicContent}
                      onTopicClick={onTopicClick}
                      onPlayClick={handleTopicPlayClick}
                      onReviewClick={handleTopicReviewClick}
                      globalActiveButton={activeButton}
                    />
                  );
                })}
              </div>

              {/* Content Display Area */}
              {Array.from(expandedTopics).map(topicId => {
                const topic = unitGroup.topics.find(t => t.id === topicId);
                if (!topic) return null;
                
                const topicContent = getContentForTopic(topic);
                
                return (
                  <div key={`content-${topicId}`} className="bg-gradient-to-r from-pink-100 to-purple-100 border-4 border-pink-300 rounded-2xl p-6 shadow-lg">
                    {loadingTopics.has(topicId) ? (
                      <div className="flex flex-col items-center justify-center py-8 bg-white rounded-2xl border-4 border-dashed border-blue-300">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
                        <p className="text-lg font-semibold text-blue-600">Loading activities...</p>
                        <p className="text-sm text-blue-500">Please wait while we fetch the content!</p>
                      </div>
                    ) : topicContent.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {topicContent.map((content, index) => (
                          <ContentCard
                            key={content.id}
                            content={content}
                            index={index}
                            onContentClick={onContentClick}
                            onPlayClick={onContentPlayClick}
                            onReviewClick={onContentReviewClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-2xl border-4 border-dashed border-gray-300">
                        <div className="text-4xl mb-2">🎭</div>
                        <p className="text-lg font-semibold text-gray-600">No activities yet!</p>
                        <p className="text-sm text-gray-500">Check back soon for fun learning content!</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
