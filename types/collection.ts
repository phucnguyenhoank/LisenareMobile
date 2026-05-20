export type Collection = {
  id: number;
  name: string;
  creator_id: number;
  created_at: string;
  brick_count?: number;
  learned_count?: number;
};

export type SystemLevel = {
  name: string;
  id: number;
};
