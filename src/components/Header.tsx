'use client';

import Link from 'next/link';
import { LayoutGrid, Settings, Library, Eye, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import '@/styles/figma-design-system.css';

export default function Header() {
  const { user, logout, hasAnyRole } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
            {hasAnyRole(['admin', 'teacher']) && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="button button--outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            
            {user && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge className={getRoleBadgeColor()}>
                    {user.role}
                  </Badge>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
