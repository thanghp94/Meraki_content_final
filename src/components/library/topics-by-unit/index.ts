// Main component
export { TopicsByUnitContainer as TopicsByUnit } from './TopicsByUnitContainer';

// Layout components
export { TopicsByUnitLayout } from './components/layout/TopicsByUnitLayout';
export { EmptyState } from './components/layout/EmptyState';
export { LoadingState } from './components/layout/LoadingState';
export { Sidebar } from './components/layout/Sidebar';
export { MainContent } from './components/layout/MainContent';

// Unit components
export { ProgramSwitcher } from './components/units/ProgramSwitcher';
export { UnitButton } from './components/units/UnitButton';
export { UnitGrid } from './components/units/UnitGrid';

// Topic components
export { TopicButton } from './components/topics/TopicButton';
export { ContentCard } from './components/topics/ContentCard';

// Hooks
export { useTopicsByUnit } from './hooks/useTopicsByUnit';

// Utilities
export * from './utils/topicUtils';

// Types
export type {
  Topic,
  Content,
  UnitGroup,
  GameSetupData,
  TopicsByUnitProps,
  LibraryState
} from './types';
