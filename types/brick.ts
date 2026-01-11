export type Brick = {
  id: number;
  creator_id?: number | null;
  target_text: string;
  is_public: boolean;
  native_text: string;
  target_audio_url: string;
  created_at: string;
};
