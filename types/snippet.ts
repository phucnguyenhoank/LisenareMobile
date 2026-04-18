import { Learner } from "./learnner";

export interface Snippet {
  id: number;
  content: string;
  audio_path: string;
  created_at: string;
  translation: string;
  creator: Learner;
  is_liked: boolean;
}

export interface SnippetPage {
  items: Snippet[];
  total: number;
}
