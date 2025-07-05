'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ListChecks, Play, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ContentViewModal from '@/components/ui/content-view-modal';
import type { ContentItem } from '@/lib/databaseService';

interface ContentTableProps {
  content: ContentItem[];
}

export default function ContentTable({ content }: ContentTableProps) {
  const router = useRouter();
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set());
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  const toggleExpanded = (contentId: string) => {
    const newExpanded = new Set(expandedContent);
    
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    
    setExpandedContent(newExpanded);
  };

  const handleSelectContent = (contentId: string, contentName: string) => {
    // Navigate to setup page with content pre-selected
    router.push(`/setup?contentId=${contentId}`);
  };

  const handleViewContent = (contentId: string) => {
    setSelectedContentId(contentId);
    setIsContentModalOpen(true);
  };

  const closeContentModal = () => {
    setIsContentModalOpen(false);
    setSelectedContentId(null);
  };

  const handleContentNavigation = (direction: 'prev' | 'next') => {
    const currentIndex = content.findIndex(item => item.id === selectedContentId);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : content.length - 1;
    } else {
      newIndex = currentIndex < content.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedContentId(content[newIndex].id);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Content Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead className="text-center">Questions</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {content.map((item) => {
            const isExpanded = expandedContent.has(item.id);
            
            return (
              <>
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                      className="p-1 h-6 w-6"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="font-semibold">{item.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Content</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {item.topic || 'No topic'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      <span>{item.questionCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewContent(item.id)}
                        className="h-8"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSelectContent(item.id, item.name)}
                        className="h-8"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Create Game
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/20 p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Content Details</h4>
                        <div className="text-sm">
                          <div><strong>Description:</strong> {item.description || 'No description available'}</div>
                          <div><strong>Question Count:</strong> {item.questionCount}</div>
                          <div><strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}</div>
                          <div><strong>Updated:</strong> {new Date(item.updatedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>

      {/* Content View Modal */}
      {selectedContentId && (
        <ContentViewModal
          isOpen={isContentModalOpen}
          onClose={closeContentModal}
          contentId={selectedContentId}
          onNavigate={handleContentNavigation}
          showNavigation={content.length > 1}
        />
      )}
    </div>
  );
}
