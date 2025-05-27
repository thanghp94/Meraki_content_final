
'use client';

import type { Folder } from '@/types/library';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Folder as FolderIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';

interface FolderCardProps {
  folder: Folder;
}

export default function FolderCard({ folder }: FolderCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative aspect-video bg-muted flex items-center justify-center">
        {folder.coverImageUrl ? (
          <Image
            src={folder.coverImageUrl}
            alt={`Cover image for ${folder.name}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={folder.aiHint || "abstract pattern"}
          />
        ) : (
          <FolderIcon className="w-24 h-24 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold truncate">{folder.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{folder.itemCount} items</p>
      </CardContent>
      <CardFooter className="p-3 border-t flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
            {/* Placeholder for interactions count, e.g. games played or questions */}
            {/* <Users className="inline h-3 w-3 mr-1" /> 0 */}
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
