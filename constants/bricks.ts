export const STATUS_OPTIONS = [
  { label: "Tất cả", value: null },
  { label: "Đã học", value: "LEARNED" },
  { label: "Chưa học", value: "NOT_LEARNED" },
] as const;

export const SORT_OPTIONS = [
  { label: "Đề xuất", value: "RECOMMENDED" },
  { label: "Mới nhất", value: "NEWEST" },
  { label: "A-Z", value: "AZ" },
  { label: "Z-A", value: "ZA" },
] as const;

export type BrickStatusFilter = "LEARNED" | "NOT_LEARNED" | null;

export type BrickSort = "RECOMMENDED" | "NEWEST" | "AZ" | "ZA";
