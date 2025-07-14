import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TopicActionsMenu } from './actions/TopicActionsMenu';
import type { Topic, Content } from '../types';

interface TopicListProps {
  topicsByUnit: { [unit: string]: Topic[] };
  content: Content[];
  selectedTopicForView: string;
  setSelectedTopicForView: (id: string) => void;
  handleMoveTopicUp: (topicId: string, unit: string) => void;
  handleMoveTopicDown: (topicId: string, unit: string) => void;
  handleToggleTopicVisibility: (topicId: string) => void;
  handleDeleteTopic: (topicId: string) => void;
  handleAddContentToTopic: (topicId: string) => void;
  handleAIGenerateContent: (topicId: string, topicName: string, summary?: string) => void;
  handleEditTopic: (topic: Topic) => void;
}

export default function TopicList({
  topicsByUnit,
  content,
  selectedTopicForView,
  setSelectedTopicForView,
  handleMoveTopicUp,
  handleMoveTopicDown,
  handleToggleTopicVisibility,
  handleDeleteTopic,
  handleAddContentToTopic,
  handleAIGenerateContent,
  handleEditTopic,
}: TopicListProps) {
  return (
    <>
      {Object.entries(topicsByUnit).map(([unit, unitTopics]) => (
        <div key={unit}>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-1 mb-4">
            {unitTopics.map((topic) => {
              const topicContent = content
                .filter(c => c.topicid === topic.id || c.topic_id === topic.id)
                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
              
              const isSelected = selectedTopicForView === topic.id;
              
              return (
                <Card 
                  key={topic.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  } ${topic.visible === false ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedTopicForView(topic.id)}
                >
                  <div className="px-2 py-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h3 className="font-medium text-xs truncate">{topic.topic}</h3>
                            <Badge variant="secondary" className="text-xs h-3 px-1 shrink-0">
                              {topicContent.length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <TopicActionsMenu
                        topic={topic}
                        unit={unit}
                        onMoveUp={() => handleMoveTopicUp(topic.id, unit)}
                        onMoveDown={() => handleMoveTopicDown(topic.id, unit)}
                        onToggleVisibility={() => handleToggleTopicVisibility(topic.id)}
                        onAddContent={() => handleAddContentToTopic(topic.id)}
                        onAIGenerate={() => handleAIGenerateContent(topic.id, topic.topic, topic.short_summary)}
                        onEdit={() => handleEditTopic(topic)}
                        onDelete={() => handleDeleteTopic(topic.id)}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
