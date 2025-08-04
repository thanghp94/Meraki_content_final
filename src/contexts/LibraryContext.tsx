'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  image: string;
}

interface Content {
  id: string;
  title: string;
  infor1: string;
  infor2: string;
  image1: string;
  image2?: string;
  video1: string;
  video2?: string;
  topicid: string;
  date_created: string;
  question_count: number;
  visible?: boolean;
  order_index?: number;
}

interface UnitGroup {
  unit: string;
  topics: Topic[];
}

interface LibraryState {
  unitGroups: UnitGroup[];
  content: Content[];
  expandedUnits: Set<string>;
  expandedTopics: Set<string>;
  activeProgram: 'grapeseed' | 'tath';
  loadedTopics: Set<string>; // Track which topics have had their content loaded
}

interface LibraryContextType {
  libraryState: LibraryState;
  setUnitGroups: (unitGroups: UnitGroup[]) => void;
  setContent: (content: Content[]) => void;
  addContent: (newContent: Content[]) => void;
  setExpandedUnits: (units: Set<string>) => void;
  setExpandedTopics: (topics: Set<string>) => void;
  setActiveProgram: (program: 'grapeseed' | 'tath') => void;
  markTopicAsLoaded: (topicId: string) => void;
  isTopicLoaded: (topicId: string) => boolean;
  resetLibraryState: () => void;
}

const initialState: LibraryState = {
  unitGroups: [],
  content: [],
  expandedUnits: new Set(),
  expandedTopics: new Set(),
  activeProgram: 'grapeseed',
  loadedTopics: new Set(),
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [libraryState, setLibraryState] = useState<LibraryState>(initialState);

  const setUnitGroups = (unitGroups: UnitGroup[]) => {
    setLibraryState(prev => ({ ...prev, unitGroups }));
  };

  const setContent = (content: Content[]) => {
    setLibraryState(prev => ({ ...prev, content }));
  };

  const addContent = (newContent: Content[]) => {
    setLibraryState(prev => ({
      ...prev,
      content: [...prev.content, ...newContent]
    }));
  };

  const setExpandedUnits = (units: Set<string>) => {
    setLibraryState(prev => ({ ...prev, expandedUnits: units }));
  };

  const setExpandedTopics = (topics: Set<string>) => {
    setLibraryState(prev => ({ ...prev, expandedTopics: topics }));
  };

  const setActiveProgram = (program: 'grapeseed' | 'tath') => {
    setLibraryState(prev => ({ ...prev, activeProgram: program }));
  };

  const markTopicAsLoaded = (topicId: string) => {
    setLibraryState(prev => ({
      ...prev,
      loadedTopics: new Set([...prev.loadedTopics, topicId])
    }));
  };

  const isTopicLoaded = (topicId: string) => {
    return libraryState.loadedTopics.has(topicId);
  };

  const resetLibraryState = () => {
    setLibraryState(initialState);
  };

  return (
    <LibraryContext.Provider
      value={{
        libraryState,
        setUnitGroups,
        setContent,
        addContent,
        setExpandedUnits,
        setExpandedTopics,
        setActiveProgram,
        markTopicAsLoaded,
        isTopicLoaded,
        resetLibraryState,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
