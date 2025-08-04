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
  
  // Option 4: Responsive text sizing based on unit number length
  const getTextSize = (text: string) => {
    if (text.length <= 2) return 'text-xs'; // U1, U2, etc.
    if (text.length <= 3) return 'text-[10px]'; // U10, U11, etc.
    return 'text-[9px]'; // U100+ (very long units)
  };
  
  return (
    <div
      className={`relative flex items-center justify-center py-2 px-1 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected 
          ? `${selectedColors[colorIndex]} text-white shadow-lg border-4 border-orange-400 ring-4 ring-orange-300` 
          : `${colors[colorIndex]} text-gray-800 hover:shadow-md border-2 border-transparent`
      }`}
      onClick={() => onUnitClick(unitGroup.unit)}
    >
      {/* Main unit text - centered */}
      <span className={`font-bold ${getTextSize(unitNumber)} leading-tight`}>
        {unitNumber}
      </span>
      
      {/* Option 3: Compact play button as overlay in top-right corner */}
      {unitGroup.topics.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-0.5 -right-0.5 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full h-3 w-3 shadow-md border border-white/50"
          disabled={isLoadingUnitQuestions}
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick(unitGroup);
          }}
        >
          {isLoadingUnitQuestions ? (
            <Loader2 className="h-1.5 w-1.5 animate-spin" />
          ) : (
            <Play className="h-1.5 w-1.5" />
          )}
        </Button>
      )}
    </div>
  );
};
