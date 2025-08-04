'use client';

import React from 'react';
import { UnitButton } from './UnitButton';

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

interface UnitGridProps {
  unitGroups: UnitGroup[];
  expandedUnits: Set<string>;
  isLoadingUnitQuestions: boolean;
  onUnitClick: (unit: string) => void;
  onPlayClick: (unitGroup: UnitGroup) => void;
}

export const UnitGrid: React.FC<UnitGridProps> = ({
  unitGroups,
  expandedUnits,
  isLoadingUnitQuestions,
  onUnitClick,
  onPlayClick
}) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {unitGroups.map((unitGroup, index) => (
        <UnitButton
          key={unitGroup.unit}
          unitGroup={unitGroup}
          index={index}
          isSelected={expandedUnits.has(unitGroup.unit)}
          isLoadingUnitQuestions={isLoadingUnitQuestions}
          onUnitClick={onUnitClick}
          onPlayClick={onPlayClick}
        />
      ))}
    </div>
  );
};
