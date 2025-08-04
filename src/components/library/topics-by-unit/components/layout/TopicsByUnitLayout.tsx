'use client';

import React from 'react';

interface TopicsByUnitLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
}

export const TopicsByUnitLayout: React.FC<TopicsByUnitLayoutProps> = ({
  sidebar,
  mainContent
}) => {
  return (
    <div className="box-border flex relative w-full max-w-[1440px] min-h-[600px] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-4 border-rainbow rounded-2xl mx-auto mt-0 shadow-xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 border-r-4 border-yellow-300 bg-gradient-to-b from-yellow-100 to-orange-100">
        {sidebar}
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6 bg-gradient-to-br from-white to-blue-50">
        {mainContent}
      </div>
    </div>
  );
};
