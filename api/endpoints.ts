import { API_BASE_URL } from "@/config/env";

export const resolveAudioUrl = (relativePath: string) =>
  `${API_BASE_URL}/${relativePath}`;
