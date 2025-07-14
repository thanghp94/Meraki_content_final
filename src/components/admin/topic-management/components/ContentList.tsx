import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { ContentActionsMenu } from './actions/ContentActionsMenu';
import type { Content, Question } from '../types';

interface ContentListProps {
  content: Content[];
  questions: Question[];
  selectedTopicForView: string;
  handleMoveContentUp: (contentId: string, topicId: string) => void;
  handleMoveContentDown: (contentId: string, topicId: string) => void;
  handleToggleContentVisibility: (contentId: string) => void;
  handleViewContent: (content: Content) => void;
  handleViewQuestions: (content: Content) => void;
  handleAddQuestion: (contentId: string) => void;
  handleAIGenerate: (contentId: string, contentTitle: string) => void;
  handleEditContent: (content: Content) => void;
  handleDeleteContent: (contentId: string) => void;
}

export default function ContentList({
  content,
  questions,
  selectedTopicForView,
  handleMoveContentUp,
  handleMoveContentDown,
  handleToggleContentVisibility,
  handleViewContent,
  handleViewQuestions,
  handleAddQuestion,
  handleAIGenerate,
  handleEditContent,
  handleDeleteContent,
}: ContentListProps) {
  const selectedTopicContent = content
    .filter(c => c.topicid === selectedTopicForView || c.topic_id === selectedTopicForView)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  if (selectedTopicContent.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No content available for this topic</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white">
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {selectedTopicContent.map((contentItem) => {
            const contentQuestions = questions.filter(q =>
              q.contentid === contentItem.id || q.content_id === contentItem.id
            );
            return (
              <Card key={contentItem.id} className="hover:shadow-sm transition-shadow">
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-3 w-3 text-green-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-xs truncate">{contentItem.title}</h4>
                          <Badge variant="outline" className="text-xs h-4 px-1 shrink-0">
                            {contentQuestions.length}Q
                          </Badge>
                        </div>
                        {contentItem.infor1 && (
                          <span className="text-xs text-gray-500 truncate block mt-1">• {contentItem.infor1}</span>
                        )}
                      </div>
                    </div>
                    <ContentActionsMenu
                      contentItem={contentItem}
                      topicId={selectedTopicForView}
                      onMoveUp={() => handleMoveContentUp(contentItem.id, selectedTopicForView)}
                      onMoveDown={() => handleMoveContentDown(contentItem.id, selectedTopicForView)}
                      onToggleVisibility={() => handleToggleContentVisibility(contentItem.id)}
                      onView={() => handleViewContent(contentItem)}
                      onViewQuestions={() => handleViewQuestions(contentItem)}
                      onAddQuestion={() => handleAddQuestion(contentItem.id)}
                      onAIGenerate={() => handleAIGenerate(contentItem.id, contentItem.title)}
                      onEdit={() => handleEditContent(contentItem)}
                      onDelete={() => handleDeleteContent(contentItem.id)}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
