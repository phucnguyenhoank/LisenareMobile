export type TimeRange = "30d" | "90d" | "365d" | "all";
export type Metric = "total_learning" | "reviews";

export interface LearningCardStats {
  learner_id: number;
  total_learning: number;
  true_retention: number; // 0..1
  average_stability: number; // in days
  total_memorized: number;
  due_count: number;
}

export interface TimeSeriesPoint {
  date: string; // "2026-04-01"
  value: number;
}

export interface LearningTimeSeries {
  metric: string; // "total_learning"
  unit: string; // "cards"
  data: TimeSeriesPoint[];
}
