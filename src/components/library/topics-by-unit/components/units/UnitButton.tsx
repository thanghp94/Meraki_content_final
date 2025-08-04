'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  image: string;
}

interface UnitGroup {
  unit: string;
  topics: Topic[];
}

interface UnitButtonProps {
  unitGroup: UnitGroup;
  index: number;
  isSelected: boolean;
  isLoadingUnitQuestions: boolean;
  onUnitClick: (unit: string) => void;
  onPlayClick: (unitGroup: UnitGroup) => void;
}

export const UnitButton: React.FC<UnitButtonProps> = ({
  unitGroup,
  index,
  isSelected,
  isLoadingUnitQuestions,
  onUnitClick,
  onPlayClick
}) => {
  const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'];
  const selectedColors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const colorIndex = index % colors.length;
  
  // Extract unit number from unit name (e.g., "Unit 1" -> "U1")
  const unitNumber = unitGroup.unit.replace(/Unit\s*/i, 'U');
  
  return (
    <div
      className={`flex items-center justify-between py-2 px-1 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected 
          ? `${selectedColors[colorIndex]} text-white shadow-lg border-2 border-white` 
          : `${colors[colorIndex]} text-gray-800 hover:shadow-md border-2 border-transparent`
      }`}
      onClick={() => onUnitClick(unitGroup.unit)}
    >
      <span className="font-bold truncate text-xs">
        {unitNumber}
      </span>
      <div className="flex items-center gap-1">
        {unitGroup.topics.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 text-white hover:text-yellow-200 hover:bg-white/20 rounded-full h-4 w-4"
            disabled={isLoadingUnitQuestions}
            onClick={(e) => {
              e.stopPropagation();
              onPlayClick(unitGroup);
            }}
          >
            {isLoadingUnitQuestions ? (
              <Loader2 className="h-2 w-2 animate-spin" />
            ) : (
              <Play className="h-2 w-2" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
