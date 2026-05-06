import { Learner } from "./learnner";

export interface Snippet {
  id: number;
  content: string;
  audio_path: string;
  created_at: string;
  translation: string;
  creator: Learner;
  reaction: Reaction;
}

export interface SnippetPage {
  items: Snippet[];
  total: number;
}

export type Reaction = "LIKE" | "DISLIKE" | null;
