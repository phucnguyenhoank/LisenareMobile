import { useCachedAudio } from "@/hooks/useCachedAudio";
import { useAudioPlayer } from "expo-audio";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import PlaySoundButton from "../PlaySoundButton";
import NextButton from "../practice/NextButton";

interface Props {
  audioUri: string;
  changeStep: () => void;
}

export default function StepListenSpeak({ audioUri, changeStep }: Props) {
  const { audioPath, isAudioLoading } = useCachedAudio(audioUri);
  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);

  const playSound = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nghe và Nói theo</Text>
      {isAudioLoading ? (
        <ActivityIndicator />
      ) : (
        <PlaySoundButton onPress={playSound} style={styles.playSoundButton} />
      )}
      <NextButton onPress={changeStep} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 100,
  },
  playSoundButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 20,
  },
});
