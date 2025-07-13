import React from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {availableUnits.map((unit) => {
          const unitNumber = unit.replace('Unit ', '');
          const topicsInUnit = topics.filter(t => t.unit === unit && t.program === 'Grapeseed');
          
          return (
            <Button
              key={unit}
              variant={selectedUnit === unit ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedUnit(unit)}
              className={`
                w-8 h-8 rounded-full text-xs font-medium transition-all
                ${selectedUnit === unit 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600' 
                  : 'border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                }
              `}
              title={`${unit} (${topicsInUnit.length} topics)`}
            >
              {unitNumber}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
