// Existing Components
export { TopicCard } from './components/TopicCard';
export { ContentCard } from './components/ContentCard';
export { UnitSelector } from './components/UnitSelector';
export { TopicActionsMenu } from './components/actions/TopicActionsMenu';
export { ContentActionsMenu } from './components/actions/ContentActionsMenu';
export { ContentQuestionsModal } from './components/questions/ContentQuestionsModal';
export { default as TopicList } from './components/TopicList';
export { default as ContentList } from './components/ContentList';
export { default as TopicFormModal } from './components/TopicFormModal';
export { default as ContentFormModal } from './components/ContentFormModal';

// New Layout Components
export { TopicManagementHeader } from './components/layout/TopicManagementHeader';
export { LoadingState } from './components/layout/LoadingState';
export { EmptyState } from './components/layout/EmptyState';

// New Modal Components
export { ModalManager } from './components/modals/ModalManager';

// Hooks
export { useTopicManagement } from './hooks/useTopicManagement';
export { useModalState } from './hooks/useModalState';
export { useFormHandlers } from './hooks/useFormHandlers';
export { useTopicActions } from './hooks/useTopicActions';

// Utilities
export * from './utils/topicUtils';

// Types
export type { Topic, Content, Question, TopicManagementState } from './types';
export type { ModalState, ModalActions } from './hooks/useModalState';
