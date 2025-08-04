'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Settings, Library as LibraryIcon, Eye, LogOut, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import '@/styles/figma-design-system.css';

export default function Header() {
  const { user, logout, hasAnyRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 border-b-4 border-yellow-300 shadow-xl">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between py-1">
          <Link href="/" className="flex items-center gap-2 text-white hover:scale-105 transition-transform duration-300">
            <div className="text-base animate-bounce">🌟</div>
            <span className="text-base font-bold bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Meraki Learning
            </span>
          </Link>
          
          <nav className="flex items-center space-x-3">
            <Link href="/library">
              <Button
                variant={isActive('/library') ? 'default' : 'outline'}
                size="lg"
                className={`flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold ${
                  isActive('/library') 
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white border-2 border-white' 
                    : 'bg-white/90 text-purple-700 border-2 border-purple-300 hover:bg-white hover:text-purple-700'
                }`}
              >
                <div className="text-lg">📚</div>
                Library
              </Button>
            </Link>
            
            {hasAnyRole(['admin', 'teacher']) && (
              <>
                <Link href="/vocabulary">
                  <Button
                    variant={isActive('/vocabulary') ? 'default' : 'outline'}
                    size="lg"
                    className={`flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold ${
                      isActive('/vocabulary') 
                        ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-2 border-white' 
                        : 'bg-white/90 text-purple-700 border-2 border-purple-300 hover:bg-white hover:text-purple-700'
                    }`}
                  >
                    <div className="text-lg">📖</div>
                    Vocabulary
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button
                    variant={isActive('/admin') ? 'default' : 'outline'}
                    size="lg"
                    className={`flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold ${
                      isActive('/admin') 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-white' 
                        : 'bg-white/90 text-purple-700 border-2 border-purple-300 hover:bg-white hover:text-purple-700'
                    }`}
                  >
                    <div className="text-lg">⚙️</div>
                    Admin
                  </Button>
                </Link>
              </>
            )}
            
            {user && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-white/30">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className="text-lg">👤</div>
                  <span className="text-sm font-bold text-white">{user.name}</span>
                  <Badge className={`${getRoleBadgeColor()} font-bold text-xs rounded-full px-2 py-1`}>
                    {user.role}
                  </Badge>
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm"
                  className="bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
                >
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
