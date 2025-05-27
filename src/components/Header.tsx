import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-90 transition-opacity">
          <LayoutGrid size={28} />
          GridWise Quizzing
        </Link>
        {/* Add navigation links here if needed in the future */}
      </div>
    </header>
  );
}
