'use client';
import SetupForm from '@/components/quiz/SetupForm';

export default function SetupPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">Create New Game</h1>
      <SetupForm />
    </div>
  );
}
