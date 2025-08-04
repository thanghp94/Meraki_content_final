'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the TopicsByUnit component with no SSR
const TopicsByUnit = dynamic(() => import('./TopicsByUnit'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-muted-foreground">Loading topics...</p>
    </div>
  )
});

interface TopicsByUnitWrapperProps {
  programFilter?: string;
  onProgramChange?: (program: 'Grapeseed' | 'TATH') => void;
}

export default function TopicsByUnitWrapper({ programFilter, onProgramChange }: TopicsByUnitWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-8 w-8 mb-4 bg-gray-200 rounded animate-pulse" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <TopicsByUnit programFilter={programFilter} onProgramChange={onProgramChange} />;
}
