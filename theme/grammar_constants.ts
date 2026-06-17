import { Question } from "../types/grammar";

// ─── Colors ───────────────────────────────────────────────────────────────────

export const C = {
  bg: "#F7FAF4",
  white: "#FFFFFF",
  primary: "#3A7D1E",
  primaryLight: "#E8F5E2",
  primaryMid: "#C5E0B0",
  primaryDark: "#1A2A0E",
  success: "#22C55E",
  successLight: "#F0FDF4",
  error: "#EF4444",
  errorLight: "#FFF1F2",
  text: "#111827",
  textMid: "#374151",
  textSoft: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  badge: "#FEF3C7",
  badgeText: "#92400E",
  muted: "#5f992c",
  progressBg: "#E5E7EB",
  progressFill: "#3A7D1E",
  cardBg: "#FFFFFF",
  headerBg: "#F0F7EA",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isMultiChoice = (q: Question) =>
  Array.isArray(q.answer) && q.answer.length > 1;

export const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ");