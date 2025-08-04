'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Header component with no SSR
const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 border-b-4 border-yellow-300 shadow-xl">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-white">
            <div className="text-base">🌟</div>
            <span className="text-base font-bold bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Meraki Learning
            </span>
          </div>
          <nav className="flex items-center space-x-3">
            <div className="h-10 w-20 bg-white/20 rounded-full animate-pulse"></div>
            <div className="h-10 w-24 bg-white/20 rounded-full animate-pulse"></div>
            <div className="h-10 w-20 bg-white/20 rounded-full animate-pulse"></div>
          </nav>
        </div>
      </div>
    </header>
  )
});

export default function HeaderWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 border-b-4 border-yellow-300 shadow-xl">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-white">
              <div className="text-base">🌟</div>
              <span className="text-base font-bold bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Meraki Learning
              </span>
            </div>
            <nav className="flex items-center space-x-3">
              <div className="h-10 w-20 bg-white/20 rounded-full"></div>
              <div className="h-10 w-24 bg-white/20 rounded-full"></div>
              <div className="h-10 w-20 bg-white/20 rounded-full"></div>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return <Header />;
}
