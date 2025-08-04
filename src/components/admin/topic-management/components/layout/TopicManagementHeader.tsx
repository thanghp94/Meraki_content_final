'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';

interface TopicManagementHeaderProps {
  selectedProgram: string;
  setSelectedProgram: (program: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddTopic: () => void;
}

export const TopicManagementHeader: React.FC<TopicManagementHeaderProps> = ({
  selectedProgram,
  setSelectedProgram,
  searchTerm,
  setSearchTerm,
  onAddTopic
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-xl py-2 px-4 mb-2 border-4 border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">📚 Content</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <Label htmlFor="program-select" className="text-white font-medium">📚 Program:</Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grapeseed">🍇 Grapeseed</SelectItem>
                <SelectItem value="TATH">🎯 TATH</SelectItem>
                <SelectItem value="WSC">🌟 WSC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
            <Input
              placeholder="🔍 Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm"
            />
          </div>
          <Button 
            onClick={onAddTopic}
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            ✨ Add Topic
          </Button>
        </div>
      </div>
    </div>
  );
};
