export const STATUS_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Chưa học", value: "not_started" },
  { label: "Đang học", value: "in_progress" },
  { label: "Hoàn thành", value: "completed" },
] as const;

export const SORT_OPTIONS = [
  { label: "Đề xuất", value: "recommended" },
  { label: "Mới nhất", value: "newest" },
  { label: "Tên A-Z", value: "az" },
  { label: "Tên Z-A", value: "za" },
] as const;
