export interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  unit?: string;
  program?: string;
  visible?: boolean;
  order?: number;
  image?: string;
  parentid?: string | null;
  showstudent?: boolean;
  order_index?: number;
}

export interface Content {
  id: string;
  title: string;
  infor1?: string;
  infor2?: string;
  image1?: string;
  image2?: string;
  video1?: string;
  video2?: string;
  visible?: boolean;
  topic_id?: string;
  topicid?: string;
  order?: number;
  order_index?: number;
}

export interface Question {
  id: string;
  question: string;
  contentid?: string;
  content_id?: string; // Keep both for backward compatibility
  visible?: boolean;
}

export interface TopicManagementState {
  topics: Topic[];
  content: Content[];
  questions: Question[];
  selectedProgram: string;
  selectedUnit: string | null;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}
