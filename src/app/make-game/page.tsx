// src/app/make-game/page.tsx
'use client';

import { Suspense } from 'react'; // This import is correct!
import MakeGameForm from '@/components/make-game/MakeGameForm';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import { Camera } from 'lucide-react';

export default function MakeGamePage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Header />
      <div className="flex-grow py-8 px-4 pt-20">
        <header className="text-center mb-8 py-6 bg-[hsl(var(--library-header-background))] text-[hsl(var(--library-header-foreground))] rounded-lg shadow-md container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold">MAKE A GAME</h1>
          <p className="text-lg mt-1">Make it once. Play it forever.</p>
        </header>
        <Card className="max-w-4xl mx-auto p-0 overflow-hidden shadow-xl">
          {/* YOU MUST WRAP MakeGameForm HERE */}
          <Suspense fallback={<div>Loading game form...</div>}> {/* Add a fallback UI */}
            <MakeGameForm />
          </Suspense>
        </Card>
        <div className="text-center mt-8">
          <a href="#" className="text-sm text-primary hover:underline flex items-center justify-center">
            <Camera className="mr-2 h-4 w-4" />
            Get beautiful free images
          </a>
        </div>
      </div>
    </div>
  );
}