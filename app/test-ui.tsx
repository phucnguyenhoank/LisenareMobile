import { View, Button } from "react-native";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useEffect } from "react";

export default function AudioPlayerScreen() {
  const audioSource = require("../assets/audio.mp3");
  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    // Configure audio session for background playback
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  const handlePlay = () => {
    // Enable lock screen controls with metadata
    player.setActiveForLockScreen(true, {
      title: "My Audio Title",
      artist: "Artist Name",
      albumTitle: "Album Name",
      artworkUrl: "https://example.com/artwork.jpg", // optional
    });

    // Start playback - this will continue in the background
    player.play();
  };

  const handleStop = () => {
    player.pause();
    // Optionally disable lock screen controls when done
    player.setActiveForLockScreen(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Play" onPress={handlePlay} />
      <Button title="Stop" onPress={handleStop} />
    </View>
  );
}
