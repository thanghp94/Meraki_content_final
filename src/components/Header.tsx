import Link from 'next/link';
import { LayoutGrid, Settings, Library } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-90 transition-opacity">
          <LayoutGrid size={28} />
          GridWise Quizzing
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/library" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Library size={20} />
            Library
          </Link>
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Settings size={20} />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
