'use client';

import React from 'react';
import { ProgramSwitcher } from '../units/ProgramSwitcher';
import { UnitGrid } from '../units/UnitGrid';
import { UnitGroup } from '../../types';

interface SidebarProps {
  programFilter?: string;
  onProgramChange?: (program: 'Grapeseed' | 'TATH') => void;
  unitGroups: UnitGroup[];
  expandedUnits: Set<string>;
  isLoadingUnitQuestions: boolean;
  onUnitClick: (unit: string) => void;
  onUnitPlayClick: (unitGroup: UnitGroup) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  programFilter,
  onProgramChange,
  unitGroups,
  expandedUnits,
  isLoadingUnitQuestions,
  onUnitClick,
  onUnitPlayClick
}) => {
  return (
    <div className="p-4">
      {/* Program Switcher */}
      <ProgramSwitcher
        programFilter={programFilter}
        onProgramChange={onProgramChange}
      />
      
      {/* Unit Grid */}
      <UnitGrid
        unitGroups={unitGroups}
        expandedUnits={expandedUnits}
        isLoadingUnitQuestions={isLoadingUnitQuestions}
        onUnitClick={onUnitClick}
        onPlayClick={onUnitPlayClick}
      />
    </div>
  );
};
