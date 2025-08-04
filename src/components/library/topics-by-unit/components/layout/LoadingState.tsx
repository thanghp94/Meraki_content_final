'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading topics by unit...",
  submessage = "Loading..."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-muted-foreground">{message}</p>
      {submessage && <p className="text-sm text-muted-foreground mt-1">{submessage}</p>}
    </div>
  );
};
