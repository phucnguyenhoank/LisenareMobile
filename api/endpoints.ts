import { API_BASE_URL } from "@/config/env";

export const brickAudioUrl = (filename: string) => 
    `${API_BASE_URL}/bricks/audio/${filename}`;