import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, GripVertical, FileText } from 'lucide-react';
import { ContentActionsMenu } from './actions/ContentActionsMenu';
import { Content } from '../types';

interface ContentCardProps {
  content: Content;
  topicId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onView: () => void;
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
  onAddQuestion,
  onAIGenerate,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className={`ml-8 ${content.visible === false ? 'opacity-50' : ''}`}>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="h-3 w-3 text-gray-400" />
            <FileText className="h-3 w-3 text-green-600" />
            <div>
              <h4 className="font-medium text-sm truncate">{content.title}...</h4>
              {content.infor1 && (
                <p className="text-xs text-gray-500 truncate">{content.infor1}...</p>
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
            onAddQuestion={onAddQuestion}
            onAIGenerate={onAIGenerate}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
