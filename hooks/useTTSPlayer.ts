import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Buffer } from "buffer";

import { Directory, File, Paths } from "expo-file-system";

import * as Crypto from "expo-crypto";

import { API_BASE_URL } from "@/config/env";

const AUDIO_CACHE_DIR = new Directory(Paths.cache, "lisenare_audio");

async function ensureCacheDir() {
  const exists = await AUDIO_CACHE_DIR.exists;

  if (!exists) {
    await AUDIO_CACHE_DIR.create();
  }
}

async function createCacheKey(text: string) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    text,
  );
}

export function useTTSPlayer(text: string | null) {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const shouldPlayWhenReady = useRef(false);

  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  // Play automatically as soon as Expo confirms the new source is fully loaded/buffered
  useEffect(() => {
    if (shouldPlayWhenReady.current && status.isLoaded && !status.isBuffering) {
      shouldPlayWhenReady.current = false;
      setIsLoading(false);
      player.seekTo(0);
      player.play();
    }
  }, [status.isLoaded, status.isBuffering]);

  const play = async () => {
    if (!text?.trim() || isLoading) return;

    // If already downloaded and loaded, just play it
    if (audioUri) {
      player.seekTo(0);
      player.play();
      return;
    }

    try {
      setIsLoading(true);
      shouldPlayWhenReady.current = true;
      await ensureCacheDir();

      const hash = await createCacheKey(text);
      const audioFile = new File(AUDIO_CACHE_DIR, `${hash}.mp3`);

      // 1. Check cache first
      if (await audioFile.exists) {
        setAudioUri(audioFile.uri);
        player.replace({ uri: audioFile.uri });
        return;
      }

      // 2. Fetch from API if not cached
      const payload = JSON.stringify({ text });
      const encodedData = Buffer.from(payload).toString("base64");
      const streamUrl = `${API_BASE_URL}/text/tts-stream?data=${encodedData}`;

      // 3. Download to local storage
      await File.downloadFileAsync(streamUrl, audioFile);

      setAudioUri(audioFile.uri);

      player.replace({ uri: audioFile.uri });
    } catch (err) {
      console.error("TTS play error:", err);
      shouldPlayWhenReady.current = false;
      setIsLoading(false);
    }
  };

  return {
    play,
    player,
    loading: isLoading,
    ready: !!audioUri,
    audioUri,
  };
}
