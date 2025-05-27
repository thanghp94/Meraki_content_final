
'use client';

import MakeGameForm from '@/components/make-game/MakeGameForm';
import { Card } from '@/components/ui/card';

export default function MakeGamePage() {
  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <header className="text-center mb-8 py-6 bg-[hsl(var(--library-header-background))] text-[hsl(var(--library-header-foreground))] rounded-lg shadow-md">
        <h1 className="text-5xl font-bold">MAKE A GAME</h1>
        <p className="text-lg mt-1">Make it once. Play it forever.</p>
      </header>
      <Card className="max-w-4xl mx-auto p-0 overflow-hidden shadow-xl">
        <MakeGameForm />
      </Card>
       <div className="text-center mt-8">
        <a href="#" className="text-sm text-primary hover:underline flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          Get beautiful free images
        </a>
      </div>
    </div>
  );
}
