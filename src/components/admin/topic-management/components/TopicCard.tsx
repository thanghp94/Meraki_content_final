import React from 'react';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { TopicActionsMenu } from './actions/TopicActionsMenu';
import { ContentCard } from './ContentCard';
import { Topic, Content } from '../types';

interface TopicCardProps {
  topic: Topic;
  unit: string;
  content: Content[];
  expandedTopics: Set<string>;
  onToggleExpanded: (topicId: string) => void;
  onMoveTopicUp: (topicId: string, unit: string) => void;
  onMoveTopicDown: (topicId: string, unit: string) => void;
  onToggleTopicVisibility: (topicId: string) => void;
  onAddContentToTopic: (topicId: string) => void;
  onAIGenerateContent: (topicId: string, topicName: string, summary?: string) => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (topicId: string) => void;
  onMoveContentUp: (contentId: string, topicId: string) => void;
  onMoveContentDown: (contentId: string, topicId: string) => void;
  onToggleContentVisibility: (contentId: string) => void;
  onViewContent: (content: Content) => void;
  onAddQuestion: (contentId: string) => void;
  onAIGenerate: (contentId: string, contentTitle: string) => void;
  onEditContent: (content: Content) => void;
  onDeleteContent: (contentId: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  unit,
  content,
  expandedTopics,
  onToggleExpanded,
  onMoveTopicUp,
  onMoveTopicDown,
  onToggleTopicVisibility,
  onAddContentToTopic,
  onAIGenerateContent,
  onEditTopic,
  onDeleteTopic,
  onMoveContentUp,
  onMoveContentDown,
  onToggleContentVisibility,
  onViewContent,
  onAddQuestion,
  onAIGenerate,
  onEditContent,
  onDeleteContent,
}) => {
  const isExpanded = expandedTopics.has(topic.id);
  const topicContent = content
    .filter(c => c.topicid === topic.id || c.topic_id === topic.id)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggleExpanded(topic.id)}
    >
      <Card className={`${topic.visible === false ? 'opacity-50' : ''} hover:shadow-sm transition-shadow`}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors rounded">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{topic.topic}</h3>
                  <Badge variant="secondary" className="text-xs shrink-0 h-4 px-1">
                    {topicContent.length}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TopicActionsMenu
                topic={topic}
                unit={unit}
                onMoveUp={() => onMoveTopicUp(topic.id, unit)}
                onMoveDown={() => onMoveTopicDown(topic.id, unit)}
                onToggleVisibility={() => onToggleTopicVisibility(topic.id)}
                onAddContent={() => onAddContentToTopic(topic.id)}
                onAIGenerate={() => onAIGenerateContent(topic.id, topic.topic, topic.short_summary)}
                onEdit={() => onEditTopic(topic)}
                onDelete={() => onDeleteTopic(topic.id)}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-1">
          <div className="space-y-1 mt-1">
            {topicContent.map((contentItem) => (
              <ContentCard
                key={contentItem.id}
                content={contentItem}
                topicId={topic.id}
                onMoveUp={() => onMoveContentUp(contentItem.id, topic.id)}
                onMoveDown={() => onMoveContentDown(contentItem.id, topic.id)}
                onToggleVisibility={() => onToggleContentVisibility(contentItem.id)}
                onView={() => onViewContent(contentItem)}
                onAddQuestion={() => onAddQuestion(contentItem.id)}
                onAIGenerate={() => onAIGenerate(contentItem.id, contentItem.title)}
                onEdit={() => onEditContent(contentItem)}
                onDelete={() => onDeleteContent(contentItem.id)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
