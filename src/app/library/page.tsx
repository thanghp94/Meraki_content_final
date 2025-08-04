'use client';

import TopicsByUnitWrapper from '@/components/library/TopicsByUnitWrapper';
import { useRouter } from 'next/navigation';
import HeaderWrapper from '@/components/HeaderWrapper';
import { useToast } from '@/hooks/use-toast';
import { useLibrary } from '@/contexts/LibraryContext';
import '@/styles/figma-design-system.css';

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { libraryState, setActiveProgram } = useLibrary();

  const handleProgramChange = (program: 'Grapeseed' | 'TATH') => {
    setActiveProgram(program === 'Grapeseed' ? 'grapeseed' : 'tath');
  };

  const renderContent = () => {
    switch (libraryState.activeProgram) {
      case 'grapeseed':
        return <TopicsByUnitWrapper programFilter="Grapeseed" onProgramChange={handleProgramChange} />;
      case 'tath':
        return <TopicsByUnitWrapper programFilter="TATH" onProgramChange={handleProgramChange} />;
      default:
        return <TopicsByUnitWrapper programFilter="Grapeseed" onProgramChange={handleProgramChange} />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <HeaderWrapper />

      <div className="pt-10">
        {renderContent()}
      </div>
    </div>
  );
}
