import { View, Button } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { Buffer } from "buffer";
import { API_BASE_URL } from "@/config/env";

export default function AudioPlayerScreen() {
  const text = "hello world";

  // 1. Construct your streaming URL
  const payload = JSON.stringify({ text });
  const encodedData = Buffer.from(payload).toString("base64");
  const streamUrl = `${API_BASE_URL}/text/tts-stream?data=${encodedData}`;

  // 2. Use the hook (this handles the player state automatically)
  const player = useAudioPlayer(streamUrl);

  const play = () => {
    player.seekTo(0);
    player.play();
  };
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Button title={player.playing ? "Pause" : "Play Audio"} onPress={play} />
    </View>
  );
}
