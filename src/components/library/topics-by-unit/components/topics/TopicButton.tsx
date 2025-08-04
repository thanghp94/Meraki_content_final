'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  image: string;
}

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

interface TopicButtonProps {
  topic: Topic;
  index: number;
  isExpanded: boolean;
  topicContent: Content[];
  onTopicClick: (topicId: string) => void;
  onPlayClick: (topic: Topic, topicContent: Content[]) => void;
}

export const TopicButton: React.FC<TopicButtonProps> = ({
  topic,
  index,
  isExpanded,
  topicContent,
  onTopicClick,
  onPlayClick
}) => {
  const lessonNumber = index + 1;
  const buttonColors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const hoverColors = ['hover:bg-red-500', 'hover:bg-blue-500', 'hover:bg-green-500', 'hover:bg-yellow-500', 'hover:bg-purple-500', 'hover:bg-pink-500'];
  const colorIndex = index % buttonColors.length;
  
  return (
    <div className="relative">
      {/* Smaller Lesson Button */}
      <button
        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 border-white transition-all duration-300 cursor-pointer text-xs font-bold relative transform hover:scale-105 shadow-md ${
          isExpanded 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
            : `${buttonColors[colorIndex]} ${hoverColors[colorIndex]} text-white`
        }`}
        onClick={() => onTopicClick(topic.id)}
        title={topic.topic || 'Untitled Topic'}
      >
        L{lessonNumber}
        
        {/* Smaller Play Button */}
        <div
          className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick(topic, topicContent);
          }}
          title="🎮 Start Game!"
        >
          <Play className="h-3 w-3 text-white" />
        </div>
      </button>
    </div>
  );
};
