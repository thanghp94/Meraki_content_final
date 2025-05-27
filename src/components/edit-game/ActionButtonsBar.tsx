
'use client';

import { Button } from "@/components/ui/button";
import { Upload, ListChecks, Settings, Trash2 } from "lucide-react";

export default function ActionButtonsBar() {
  const handleAction = (action: string) => {
    alert(`${action} button clicked - TBI`);
  };

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 mb-6">
      <Button variant="secondary" onClick={() => handleAction('Import')}>
        <Upload className="mr-2 h-4 w-4" /> Import
      </Button>
      <Button variant="secondary" onClick={() => handleAction('Multiple Choice')}>
        <ListChecks className="mr-2 h-4 w-4" /> Multiple Choice
      </Button>
      <Button variant="secondary" onClick={() => handleAction('Settings')}>
        <Settings className="mr-2 h-4 w-4" /> Settings
      </Button>
      <Button variant="destructive" onClick={() => handleAction('Delete Game')}>
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </Button>
    </div>
  );
}
