'use client';
import Link from 'next/link';
import { Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SetupForm from '@/components/quiz/SetupForm';
import { Suspense } from 'react'; // This import is correct!

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-lg">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/library">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Library className="h-4 w-4" />
                  Library
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">🎮 Create New Game</h1>
            </div>
            <div id="sticky-start-button" className="min-w-[120px]">
              {/* Start Game button will be moved here */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-4">
        {/* YOU MUST WRAP SetupForm HERE */}
        <Suspense fallback={<div>Loading setup form...</div>}> {/* Add a fallback UI */}
          <SetupForm />
        </Suspense>
      </div>
    </div>
  );
}