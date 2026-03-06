import { Directory, File, Paths } from "expo-file-system";

const AUDIO_CACHE_DIR = new Directory(Paths.cache, "brick_audio");

export const getCachedAudioUri = async (
  filename: string,
  remoteUrl: string,
) => {
  try {
    if (!AUDIO_CACHE_DIR.exists) {
      AUDIO_CACHE_DIR.create();
    }

    const localFile = new File(AUDIO_CACHE_DIR, filename);
    if (localFile.exists) {
      console.log("Cached hit: ", localFile.uri);
      return localFile.uri;
    }

    const output = await File.downloadFileAsync(remoteUrl, localFile);
    console.log("Download and cached: ", output.uri);
    return output.uri;
  } catch (error) {
    console.error("Audio caching failed: ", error);
    return remoteUrl;
  }
};
