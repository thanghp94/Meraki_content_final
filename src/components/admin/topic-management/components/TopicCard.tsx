import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, GripVertical, BookOpen } from 'lucide-react';
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
  const topicContent = content.filter(c => c.topic_id === topic.id);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggleExpanded(topic.id)}
    >
      <Card className={`mb-4 ${topic.visible === false ? 'opacity-50' : ''}`}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-4 w-4 text-gray-400" />
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg truncate">{topic.topic}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {topicContent.length} content
                    </Badge>
                  </div>
                  {topic.short_summary && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{topic.short_summary}...</p>
                  )}
                </div>
              </div>
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
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-4">
          <div className="space-y-2">
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
