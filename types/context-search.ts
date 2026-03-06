export interface VideoContextSearchResult {
  ytb_video_id: string;
  text: string;
  start: number;
  duration: number;
}

export interface BrickContextSearchResult {
  native_text: string;
  target_text: string;
  target_audio_uri: string;
  cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  is_public: boolean;
}

export type ContextSearchResult =
  | VideoContextSearchResult
  | BrickContextSearchResult;

export type SearchMode = "videos" | "bricks";
