import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, ArrowUp, ArrowDown, Eye, EyeOff, FileText, Plus, Sparkles, Pencil, Trash2
} from 'lucide-react';

interface Content {
  id: string;
  title: string;
  visible?: boolean;
}

interface ContentActionsMenuProps {
  contentItem: Content;
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

export const ContentActionsMenu: React.FC<ContentActionsMenuProps> = ({ 
  contentItem, 
  topicId, 
  onMoveUp, 
  onMoveDown, 
  onToggleVisibility, 
  onView, 
  onAddQuestion, 
  onAIGenerate, 
  onEdit, 
  onDelete 
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveUp(); }}>
        <ArrowUp className="h-4 w-4 mr-2" />
        Move Up
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveDown(); }}>
        <ArrowDown className="h-4 w-4 mr-2" />
        Move Down
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}>
        {contentItem.visible !== false ? (
          <>
            <EyeOff className="h-4 w-4 mr-2" />
            Hide Content
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Show Content
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
        <FileText className="h-4 w-4 mr-2 text-blue-600" />
        View Content
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddQuestion(); }}>
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAIGenerate(); }}>
        <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
        AI Generate Questions
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit Content
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Content
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
