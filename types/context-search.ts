import { Snippet } from "./snippet";

export interface VideoContextSearchResult {
  ytb_video_id: string;
  text: string;
  start: number;
  duration: number;
}

export interface BrickContextSearchResult {
  brick_id: number;
  native_text: string;
  target_text: string;
}

export type ContextSearchResult =
  | Snippet
  | VideoContextSearchResult
  | BrickContextSearchResult;

export type SearchMode = "snippets" | "videos" | "bricks";
