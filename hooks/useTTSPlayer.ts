import { useEffect, useMemo, useState } from "react";
import { useAudioPlayer } from "expo-audio";
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

  useEffect(() => {
    let mounted = true;

    async function prepare() {
      if (!text?.trim()) {
        setAudioUri(null);
        return;
      }

      try {
        await ensureCacheDir();

        const hash = await createCacheKey(text);
        const audioFile = new File(AUDIO_CACHE_DIR, `${hash}.mp3`);

        // 1. Use cache if exists
        if (await audioFile.exists) {
          if (mounted) {
            setAudioUri(audioFile.uri);
          }
          return;
        }

        // 2. Build API URL
        const payload = JSON.stringify({ text });
        const encodedData = Buffer.from(payload).toString("base64");
        const streamUrl = `${API_BASE_URL}/text/tts-stream?data=${encodedData}`;

        // 3. Download directly to cache
        await File.downloadFileAsync(streamUrl, audioFile);

        if (mounted) {
          setAudioUri(audioFile.uri);
        }
      } catch (err) {
        console.error("TTS prepare error:", err);
      }
    }

    prepare();

    return () => {
      mounted = false;
    };
  }, [text]);

  const player = useAudioPlayer(audioUri ?? undefined);

  const play = () => {
    if (!audioUri) return;

    player.seekTo(0);
    player.play();
  };

  return {
    play,
    player,
    ready: !!audioUri,
    audioUri,
  };
}
