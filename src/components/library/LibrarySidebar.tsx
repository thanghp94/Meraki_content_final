
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, Folder as FolderIcon, Gamepad2, Heart, Users, History, Trash2, Sparkles, ArrowDownAZ, FolderPlus, AlignJustify 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibrarySidebarProps {
  className?: string;
  onSearch: (term: string) => void;
  activeFilter: 'all' | 'folders' | 'games';
  onFilterChange: (filter: 'all' | 'folders' | 'games')
    | (() => void) // For Likes, Following etc. which are not implemented yet
    | ((filter: 'likes' | 'following' | 'history' | 'deleted') => void); // Type expanded for future
  onNewGame: () => void;
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
  className, onSearch, activeFilter, onFilterChange, onNewGame, onNewFolder, folderCount
}: LibrarySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  // Cast onFilterChange for specific nav items
  const handleNavFilterChange = (filter: 'all' | 'folders' | 'games') => {
    (onFilterChange as (filter: 'all' | 'folders' | 'games') => void)(filter);
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
            if(!e.target.value) onSearch(''); // Clear search on empty
          }}
        />
        <Button type="submit" size="icon" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm text-muted-foreground space-x-2">
        {filterButtons.map(fb => (
          <Button key={fb.label} variant="ghost" size="sm" className="flex-1 justify-start px-2" onClick={() => alert(`${fb.label} filter clicked - TBI`)}>
            {fb.icon && <fb.icon className="mr-1.5 h-3.5 w-3.5" />}
            {fb.label}
          </Button>
        ))}
      </div>

      <nav className="space-y-1">
        {navItems.map(item => (
          <Button
            key={item.key}
            variant={activeFilter === item.key ? 'default' : 'ghost'}
            className={cn(
              "w-full justify-start text-base py-3",
              activeFilter === item.key && item.key === 'folders' && "bg-library-sidebar-active text-library-sidebar-active-foreground hover:bg-library-sidebar-active/90",
              activeFilter === item.key && item.key !== 'folders' && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => {
              if (item.key === 'all' || item.key === 'folders' || item.key === 'games') {
                handleNavFilterChange(item.key);
              } else {
                 // For Likes, Following - Cast to the broader type or handle appropriately
                 (onFilterChange as (filter: 'likes' | 'following' | 'history' | 'deleted') => void)(item.key as 'likes' | 'following');
                 alert(`${item.label} clicked - TBI`);
              }
            }}
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
          className="w-full bg-teal-500 hover:bg-teal-600 text-white text-base"
          onClick={onNewGame}
        >
          <Gamepad2 className="mr-2 h-5 w-5" /> + Game
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full border-teal-500 text-teal-500 hover:bg-teal-500/10 text-base"
          onClick={onNewFolder}
        >
          <FolderPlus className="mr-2 h-5 w-5" /> Folder
        </Button>
      </div>
    </aside>
  );
}
