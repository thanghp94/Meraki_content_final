'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-4 border-purple-200">
      <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
      <p className="text-lg font-semibold text-purple-700">Loading amazing content...</p>
      <p className="text-sm text-purple-500">Please wait while we fetch your topics</p>
    </div>
  );
};
