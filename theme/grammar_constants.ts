import { Question } from "../types/grammar";

// ─── Colors ───────────────────────────────────────────────────────────────────

export const C = {
  bg: "#F4F6FB",
  white: "#FFFFFF",
  primary: "#293F16",           
  primaryLight: "#E8EDE0",     
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
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isMultiChoice = (q: Question) =>
  Array.isArray(q.answer) && q.answer.length > 1;

export const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ");