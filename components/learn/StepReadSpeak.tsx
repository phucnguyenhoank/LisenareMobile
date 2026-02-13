import { brickAudioUrl } from "@/api/endpoints";
import { useAudioPlayer } from "expo-audio";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PlaySoundButton from "../PlaySoundButton";
import { BrickDisplay } from "../practice/BrickDisplay";
import NextButton from "../practice/NextButton";

interface Props {
  audioUri: string;
  target_text: string;
  native_text: string;
  changeStep: () => void;
}

export default function StepReadSpeak({
  audioUri,
  target_text,
  native_text,
  changeStep,
}: Props) {
  const player = useAudioPlayer({ uri: brickAudioUrl(audioUri) });
  const DEFAULT_SETTINGS = {
    firstShowTarget: true,
    firstShowNative: false,
  };
  const [showTarget, setShowTarget] = useState<boolean>(
    DEFAULT_SETTINGS.firstShowTarget,
  );
  const [showNative, setShowNative] = useState<boolean>(
    DEFAULT_SETTINGS.firstShowNative,
  );
  const playSound = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đọc hiểu và Nói lại</Text>
      <BrickDisplay
        target_text={target_text}
        native_text={native_text}
        showTarget={showTarget}
        showNative={showNative}
        setShowTarget={setShowTarget}
        setShowNative={setShowNative}
      />
      <PlaySoundButton onPress={playSound} style={styles.playSoundButton} />
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
