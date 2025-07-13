export interface Topic {
  id: string;
  topic: string;
  short_summary?: string;
  unit?: string;
  program?: string;
  visible?: boolean;
  order?: number;
}

export interface Content {
  id: string;
  title: string;
  infor1?: string;
  visible?: boolean;
  topic_id?: string;
  order?: number;
}

export interface Question {
  id: string;
  question: string;
  content_id?: string;
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
