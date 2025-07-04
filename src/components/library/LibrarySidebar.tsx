'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FolderPlus, Search, Library, Folder, BookOpen } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import '@/styles/figma-design-system.css';

interface LibrarySidebarProps {
  className?: string;
  style?: React.CSSProperties;
  onSearch: (term: string) => void;
  activeFilter: 'all' | 'folders' | 'content' | 'units';
  onFilterChange: (filter: 'all' | 'folders' | 'content' | 'units') => void;
  onNewFolder: () => void;
  folderCount: number;
  isCreatingFolder: boolean;
}

export default function LibrarySidebar({
  className,
  style,
  onSearch,
  activeFilter,
  onFilterChange,
  onNewFolder,
  folderCount,
  isCreatingFolder,
}: LibrarySidebarProps) {
  return (
    <aside className={cn('card bg-sidebar', className)} style={{ padding: 'var(--spacing-4)', ...style }}>
      <div className="relative" style={{ marginBottom: 'var(--spacing-4)' }}>
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-sidebar-foreground opacity-60" />
        <Input
          placeholder="Search library..."
          className="pl-8"
          style={{ 
            borderColor: 'var(--sidebar-border)', 
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--sidebar-background)'
          }}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        <Button
          variant={activeFilter === 'all' ? 'secondary' : 'ghost'}
          className={`w-full justify-start button ${activeFilter === 'all' ? 'button--secondary' : 'button--outline'}`}
          onClick={() => onFilterChange('all')}
        >
          <Library className="mr-2 h-4 w-4" />
          All
        </Button>
        <Button
          variant={activeFilter === 'folders' ? 'secondary' : 'ghost'}
          className={`w-full justify-start button ${activeFilter === 'folders' ? 'button--secondary' : 'button--outline'}`}
          onClick={() => onFilterChange('folders')}
        >
          <Folder className="mr-2 h-4 w-4" />
          Folders ({folderCount})
        </Button>
        <Button
          variant={activeFilter === 'content' ? 'secondary' : 'ghost'}
          className={`w-full justify-start button ${activeFilter === 'content' ? 'button--secondary' : 'button--outline'}`}
          onClick={() => onFilterChange('content')}
        >
          <Library className="mr-2 h-4 w-4" />
          Content
        </Button>
        <Button
          variant={activeFilter === 'units' ? 'secondary' : 'ghost'}
          className={`w-full justify-start button ${activeFilter === 'units' ? 'button--secondary' : 'button--outline'}`}
          onClick={() => onFilterChange('units')}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          View by Unit
        </Button>
      </div>

      <div style={{ marginTop: 'var(--spacing-6)' }}>
        <Button
          variant="outline"
          className="w-full justify-start button button--primary"
          onClick={onNewFolder}
          disabled={isCreatingFolder}
        >
          {isCreatingFolder ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
