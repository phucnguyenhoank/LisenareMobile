import { Learner } from "./learnner";

export interface Post {
  id: number;
  content: string;
  translation: string;
  audio_uri: string;
  accent: string | null;
  created_at: string;
  creator: Learner;
}

export interface PostPage {
  items: Post[];
  total: number;
}
