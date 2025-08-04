'use client';

import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl border-4 border-dashed border-purple-300">
      <div className="text-8xl mb-4 animate-bounce">📚</div>
      <h3 className="text-2xl font-bold text-purple-700 mb-4">Select a Unit to View Topics</h3>
      <p className="text-lg text-purple-600 bg-white/70 px-6 py-2 rounded-full inline-block">
        🌟 Choose a unit from the selector above to see all topics and content! 🌟
      </p>
    </div>
  );
};
