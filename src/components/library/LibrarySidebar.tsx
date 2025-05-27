
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, Folder as FolderIcon, Gamepad2, Heart, Users, History, Trash2, Sparkles, ArrowDownAZ, FolderPlus 
} from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Import useRouter

interface LibrarySidebarProps {
  className?: string;
  onSearch: (term: string) => void;
  activeFilter: 'all' | 'folders' | 'games';
  onFilterChange: 
    ((filter: 'all' | 'folders' | 'games') => void) |
    ((filter: 'likes' | 'following' | 'history' | 'deleted') => void);
  onNewGame: () => void; // Kept for consistency, but will be overridden by direct navigation
  onNewFolder: () => void;
  folderCount: number;
}

type NavItemKey = 'all' | 'games' | 'folders' | 'likes' | 'following';

const navItems: { key: NavItemKey; label: string; icon: React.ElementType }[] = [
  { key: 'games', label: 'Games', icon: Gamepad2 },
  { key: 'folders', label: 'Folders', icon: FolderIcon },
  { key: 'likes', label: 'Likes', icon: Heart },
  { key: 'following', label: 'Following', icon: Users },
];

const filterButtons = [
  { label: 'New', icon: Sparkles },
  { label: 'Old' }, 
  { label: 'Edited' },
  { label: 'A-Z', icon: ArrowDownAZ },
];

export default function LibrarySidebar({ 
  className, onSearch, activeFilter, onFilterChange, onNewFolder, folderCount
}: LibrarySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter(); // Initialize router

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  const handleNavFilterChange = (filterKey: NavItemKey) => {
    if (filterKey === 'all' || filterKey === 'folders' || filterKey === 'games') {
      (onFilterChange as (filter: 'all' | 'folders' | 'games') => void)(filterKey);
    } else {
      (onFilterChange as (filter: 'likes' | 'following' | 'history' | 'deleted') => void)(filterKey as 'likes' | 'following');
      alert(`${navItems.find(item => item.key === filterKey)?.label} clicked - TBI`);
    }
  };

  const handleCreateGame = () => {
    router.push('/make-game'); // Navigate to the new make-game page
  };

  return (
    <aside className={cn("bg-card p-4 rounded-lg shadow-md flex flex-col space-y-4", className)}>
      <div className="bg-library-sidebar-header text-library-sidebar-header-foreground p-3 rounded-md flex items-center justify-center">
        <FolderIcon className="mr-2 h-5 w-5" />
        <span className="font-semibold">{folderCount} folders</span>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <Input
          type="search"
          placeholder="Search my folders"
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if(!e.target.value) onSearch('');
          }}
        />
        <Button type="submit" size="icon" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm text-muted-foreground space-x-1 sm:space-x-2">
        {filterButtons.map(fb => (
          <Button 
            key={fb.label} 
            variant="ghost" 
            size="sm" 
            className="flex-1 justify-start px-1 sm:px-2 text-xs sm:text-sm" 
            onClick={() => alert(`${fb.label} filter clicked - TBI`)}
          >
            {fb.icon && <fb.icon className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />}
            {fb.label}
          </Button>
        ))}
      </div>

      <nav className="space-y-1">
        {navItems.map(item => (
          <Button
            key={item.key}
            variant={'ghost'}
            className={cn(
              "w-full justify-start text-base py-3",
              activeFilter === item.key && item.key === 'folders' && "bg-library-sidebar-active text-library-sidebar-active-foreground hover:bg-library-sidebar-active/90",
              activeFilter === item.key && item.key !== 'folders' && "bg-primary text-primary-foreground hover:bg-primary/90",
              activeFilter !== item.key && "hover:bg-accent/50"
            )}
            onClick={() => handleNavFilterChange(item.key)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>
      
      <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
         <Button variant="ghost" className="w-full justify-start" onClick={() => alert('History clicked - TBI')}>
            <History className="mr-2 h-4 w-4" /> History
         </Button>
         <Button variant="ghost" className="w-full justify-start" onClick={() => alert('Deleted clicked - TBI')}>
            <Trash2 className="mr-2 h-4 w-4" /> Deleted
         </Button>
      </div>

      <div className="mt-auto pt-4 border-t space-y-2">
        <Button 
          size="lg" 
          className="w-full bg-library-action-button text-library-action-button-foreground hover:bg-library-action-button/90 text-base"
          onClick={handleCreateGame} // Updated to use the new handler
        >
          <Gamepad2 className="mr-2 h-5 w-5" /> + Game
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full border-[hsl(var(--library-action-button-background))] text-[hsl(var(--library-action-button-background))] hover:bg-[hsla(var(--library-action-button-background),0.1)] text-base"
          onClick={onNewFolder}
        >
          <FolderPlus className="mr-2 h-5 w-5" /> Folder
        </Button>
      </div>
    </aside>
  );
}

