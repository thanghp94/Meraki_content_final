'use client';

import TopicsByUnit from '@/components/library/TopicsByUnit';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
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
        return <TopicsByUnit programFilter="Grapeseed" onProgramChange={handleProgramChange} />;
      case 'tath':
        return <TopicsByUnit programFilter="TATH" onProgramChange={handleProgramChange} />;
      default:
        return <TopicsByUnit programFilter="Grapeseed" onProgramChange={handleProgramChange} />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header />

      <div className="pt-10">
        {renderContent()}
      </div>
    </div>
  );
}
