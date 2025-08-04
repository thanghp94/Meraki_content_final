'use client';

import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-6xl mb-4 animate-bounce">📖</div>
      <h3 className="text-2xl font-bold mb-4 text-purple-700">Let's Start Learning!</h3>
      <p className="text-lg text-blue-600 bg-white px-6 py-3 rounded-full shadow-lg">
        🎯 Pick a colorful unit from the sidebar to begin your adventure!
      </p>
    </div>
  );
};
