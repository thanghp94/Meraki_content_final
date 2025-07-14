import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { ContentActionsMenu } from './actions/ContentActionsMenu';
import { Content } from '../types';

interface ContentCardProps {
  content: Content;
  topicId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onView: () => void;
  onViewQuestions: () => void;
  onAddQuestion: () => void;
  onAIGenerate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  topicId,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onView,
  onViewQuestions,
  onAddQuestion,
  onAIGenerate,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className={`ml-4 ${content.visible === false ? 'opacity-50' : ''} hover:shadow-sm transition-shadow`}>
      <div className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors rounded">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-3 w-3 text-green-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-xs truncate">{content.title}</h4>
            {content.infor1 && (
              <p className="text-xs text-gray-500 truncate">{content.infor1}</p>
            )}
          </div>
        </div>
        <ContentActionsMenu
          contentItem={content}
          topicId={topicId}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onToggleVisibility={onToggleVisibility}
          onView={onView}
          onViewQuestions={onViewQuestions}
          onAddQuestion={onAddQuestion}
          onAIGenerate={onAIGenerate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
};
