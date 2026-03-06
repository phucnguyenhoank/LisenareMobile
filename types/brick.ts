export type Brick = {
  id: number;
  creator_id?: number | null;
  target_text: string;
  is_public: boolean;
  native_text: string;
  target_audio_uri: string; // E.g.: GUksrGBeln0_sentence_254.wav
  created_at: string;
};
