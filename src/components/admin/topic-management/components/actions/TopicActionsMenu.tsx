import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, ArrowUp, ArrowDown, Eye, EyeOff, Plus, Sparkles, Pencil, Trash2
} from 'lucide-react';

interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  visible?: boolean;
}

interface TopicActionsMenuProps {
  topic: Topic;
  unit: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onAddContent: () => void;
  onAIGenerate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TopicActionsMenu: React.FC<TopicActionsMenuProps> = ({ 
  topic, 
  unit, 
  onMoveUp, 
  onMoveDown, 
  onToggleVisibility, 
  onAddContent, 
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
        <MoreHorizontal className="h-4 w-4" />
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
        {topic.visible !== false ? (
          <>
            <EyeOff className="h-4 w-4 mr-2" />
            Hide Topic
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Show Topic
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddContent(); }}>
        <Plus className="h-4 w-4 mr-2" />
        Add Content
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAIGenerate(); }}>
        <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
        AI Generate Content
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit Topic
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Topic
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
