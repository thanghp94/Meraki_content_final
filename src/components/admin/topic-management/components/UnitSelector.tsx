import React from 'react';

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
      <div className="flex flex-wrap gap-1">
        {availableUnits.map((unit) => {
          const unitNumber = unit.replace('Unit ', '');
          const topicsInUnit = topics.filter(t => t.unit === unit && t.program === 'Grapeseed');
          
          return (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              className={`
                w-6 h-6 rounded-full text-xs font-medium transition-all border cursor-pointer
                ${selectedUnit === unit 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600' 
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-900'
                }
              `}
              title={`${unit} (${topicsInUnit.length} topics)`}
            >
              {unitNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};
