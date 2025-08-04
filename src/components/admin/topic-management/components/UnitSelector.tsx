import React from 'react';
import { BookOpen, Users } from 'lucide-react';

interface Topic {
  id: string;
  topic: string;
  unit?: string;
  program?: string;
}

interface UnitSelectorProps {
  topics: Topic[];
  selectedProgram: string;
  selectedUnit: string | null;
  setSelectedUnit: (unit: string | null) => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({ 
  topics, 
  selectedProgram, 
  selectedUnit, 
  setSelectedUnit 
}) => {
  if (selectedProgram !== 'Grapeseed') {
    return null;
  }

  // Get available units for Grapeseed program
  const availableUnits = Array.from(new Set(
    topics
      .filter(t => t.program === 'Grapeseed' && t.unit)
      .map(t => t.unit!)
      .sort((a, b) => {
        const unitA = parseInt(a.replace('Unit ', ''));
        const unitB = parseInt(b.replace('Unit ', ''));
        return unitA - unitB;
      })
  ));

  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-1">
        {availableUnits.map((unit, index) => {
          const unitNumber = unit.replace('Unit ', '');
          const topicsInUnit = topics.filter(t => t.unit === unit && t.program === 'Grapeseed');
          
          // Create different gradient colors for each unit
          const gradientColors = [
            'from-red-400 to-pink-400',
            'from-blue-400 to-purple-400', 
            'from-green-400 to-teal-400',
            'from-yellow-400 to-orange-400',
            'from-purple-400 to-indigo-400',
            'from-pink-400 to-rose-400',
            'from-cyan-400 to-blue-400',
            'from-emerald-400 to-green-400'
          ];
          const colorIndex = index % gradientColors.length;
          
          return (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              className={`
                relative group w-7 h-6 rounded text-xs font-bold transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md border
                ${selectedUnit === unit 
                  ? `bg-gradient-to-r ${gradientColors[colorIndex]} text-white border-white shadow-md scale-105` 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
              title={`${unit} (${topicsInUnit.length} topics)`}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-xs font-black">{unitNumber}</span>
              </div>
              
              {/* Topic count badge */}
              <div className={`
                absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs font-bold flex items-center justify-center
                ${selectedUnit === unit 
                  ? 'bg-white text-purple-600' 
                  : 'bg-purple-500 text-white'
                }
              `}>
                <span className="text-[8px]">{topicsInUnit.length}</span>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
