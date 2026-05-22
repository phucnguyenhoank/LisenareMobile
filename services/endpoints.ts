import { GCS_BASE_URL } from "@/config/env";

export const resolveAudioUrl = (relativePath: string) =>
  `${GCS_BASE_URL}/${relativePath}`;
