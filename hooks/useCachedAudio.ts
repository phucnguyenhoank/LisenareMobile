import { resolveAudioUrl } from "@/api/endpoints";
import { getCachedAudioUri } from "@/utils/audioCache";
import { useEffect, useState } from "react";

export function useCachedAudio(audioUri: string | null) {
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(true);

  useEffect(() => {
    if (!audioUri) {
      setAudioPath(null);
      setIsAudioLoading(false);
      return;
    }

    const filename = audioUri.split("/").pop();
    if (!filename) {
      setAudioPath(null);
      setIsAudioLoading(false);
      return;
    }

    const loadAudio = async () => {
      try {
        const uri = await getCachedAudioUri(
          filename,
          resolveAudioUrl(audioUri), // TODO: resolve base on the audio is brick or post
        );
        setAudioPath(uri);
      } catch (err) {
        console.error("Audio load failed:", err);
      } finally {
        setIsAudioLoading(false);
      }
    };

    loadAudio();
  }, [audioUri]);

  return { audioPath, isAudioLoading };
}
