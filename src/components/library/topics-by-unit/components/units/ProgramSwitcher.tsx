'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ProgramSwitcherProps {
  programFilter?: string;
  onProgramChange?: (program: 'Grapeseed' | 'TATH') => void;
}

export const ProgramSwitcher: React.FC<ProgramSwitcherProps> = ({
  programFilter,
  onProgramChange
}) => {
  return (
    <div className="flex gap-1 mb-4">
      <Button
        variant={programFilter === 'Grapeseed' ? 'default' : 'outline'}
        onClick={() => onProgramChange?.('Grapeseed')}
        className={`flex-1 text-xs font-bold rounded-full transition-all duration-300 ${
          programFilter === 'Grapeseed' 
            ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg transform scale-105' 
            : 'bg-white border-2 border-green-300 text-green-600 hover:bg-green-50'
        }`}
        size="sm"
      >
        🍇 GS
      </Button>
      <Button
        variant={programFilter === 'TATH' ? 'default' : 'outline'}
        onClick={() => onProgramChange?.('TATH')}
        className={`flex-1 text-xs font-bold rounded-full transition-all duration-300 ${
          programFilter === 'TATH' 
            ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg transform scale-105' 
            : 'bg-white border-2 border-blue-300 text-blue-600 hover:bg-blue-50'
        }`}
        size="sm"
      >
        🎯 TATH
      </Button>
    </div>
  );
};
