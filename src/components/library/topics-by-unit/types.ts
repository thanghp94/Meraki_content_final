export interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  image: string;
  questions?: any[]; // Optional questions array for when loaded
}

export interface Content {
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

export interface UnitGroup {
  unit: string;
  topics: Topic[];
}

export interface GameSetupData {
  contentIds?: string[];
  unit?: string;
  topicId?: string;
  topicName?: string;
  unitTopics?: Topic[];
}

export interface TopicsByUnitProps {
  programFilter?: string;
  onProgramChange?: (program: 'Grapeseed' | 'TATH') => void;
}

export interface LibraryState {
  unitGroups: UnitGroup[];
  content: Content[];
  expandedUnits: Set<string>;
  expandedTopics: Set<string>;
}
