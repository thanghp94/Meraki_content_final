'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, BookOpen } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  infor1: string;
  infor2: string;
  image1: string;
  image2?: string;
  video1: string;
  video2?: string;
  topicid: string;
  date_created: string;
  question_count: number;
  visible?: boolean;
  order_index?: number;
}

interface ContentCardProps {
  content: Content;
  index: number;
  onContentClick: (contentId: string) => void;
  onPlayClick: (content: Content) => void;
  onReviewClick?: (content: Content) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  index,
  onContentClick,
  onPlayClick,
  onReviewClick
}) => {
  const cardColors = ['from-red-200 to-red-300', 'from-blue-200 to-blue-300', 'from-green-200 to-green-300', 'from-yellow-200 to-yellow-300', 'from-purple-200 to-purple-300', 'from-pink-200 to-pink-300'];
  const borderColors = ['border-red-400', 'border-blue-400', 'border-green-400', 'border-yellow-400', 'border-purple-400', 'border-pink-400'];
  const colorIndex = index % cardColors.length;
  
  // Check if content has vocabulary for review
  const hasVocabulary = content.infor1 && content.infor1.trim().length > 0;
  
  return (
    <Card 
      className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${cardColors[colorIndex]} ${borderColors[colorIndex]} border-4 rounded-2xl cursor-pointer overflow-hidden`}
      onClick={() => onContentClick(content.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold border-2 border-white rounded-full bg-white text-gray-700 shadow-md flex-shrink-0">
              {index + 1}
            </div>
            <h5 className="font-bold text-sm text-gray-800 leading-tight">{content.title}</h5>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {hasVocabulary && onReviewClick && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-md transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onReviewClick(content);
                }}
                title="Review vocabulary"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 bg-white hover:bg-yellow-100 text-purple-600 hover:text-purple-700 rounded-full shadow-md transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onPlayClick(content);
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
