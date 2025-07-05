import Link from 'next/link';
import { LayoutGrid, Settings, Library, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/figma-design-system.css';

export default function Header() {
  return (
    <header className="bg-background border-b" style={{ borderColor: 'var(--colors-border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-4) 0' }}>
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80" 
                style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', transition: 'var(--transition-normal)' }}>
            <LayoutGrid size={28} />
            GridWise Quizzing
          </Link>
          
          <nav className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
            <Link href="/library">
              <Button variant="outline" size="sm" className="button button--outline">
                <Library className="h-4 w-4 mr-2" />
                Library
              </Button>
            </Link>
            <Link href="/content-demo">
              <Button variant="outline" size="sm" className="button button--outline">
                <Eye className="h-4 w-4 mr-2" />
                Content Demo
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="button button--outline">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}