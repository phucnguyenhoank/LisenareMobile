import { brickAudioUrl } from "@/api/endpoints";
import { getCachedAudioUri } from "@/utils/audioCache";
import { useEffect, useState } from "react";

export function useAudioCache(audioUri: string | null) {
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [audioLoading, setLoadingAudio] = useState(true);

  useEffect(() => {
    if (!audioUri) {
      setAudioPath(null);
      setLoadingAudio(false);
      return;
    }
    getCachedAudioUri(audioUri, brickAudioUrl(audioUri)).then((uri) => {
      setAudioPath(uri);
      setLoadingAudio(false);
    });
  }, [audioUri]);

  return { audioPath, audioLoading };
}
