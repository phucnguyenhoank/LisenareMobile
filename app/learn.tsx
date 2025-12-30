import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { apiCall } from "@/api/client";
import { useEffect, useState } from 'react';
import type { Brick } from '@/types/brick';
import { brickAudioUrl } from '@/api/endpoints';
import PlaySoundButton from '@/components/PlaySoundButton';
import NextButton from '@/components/NextButton';
import ReportButton from '@/components/ReportButton';

export default function Index() {
  const [brick, setBrick] = useState<Brick | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? {uri: audioUri} : null);
  const [showTarget, setShowTarget] = useState<boolean>(true);
  const [showNative, setShowNative] = useState<boolean>(true);

  const fetchRandomBrick = async () => {
    try {
      const br = await apiCall("/bricks/random");
      setBrick(br);
      setAudioUri(brickAudioUrl(br.target_audio_url));
    }
    catch (err) {
      console.error("Failed to fetch brick:", err);
    }
  };

  const playSound = () => {
    player.seekTo(0);
    player.play();
  };

  const reportBrokenFile = async () => {
    const response = await apiCall(`/bricks/report/${brick?.target_audio_url}`, 'POST');
    alert("Issue reported. Thank you!");
    console.log("Report Success:", response);
  }

  useEffect(() => {
    fetchRandomBrick();
  }, []);

  return (
    <View style={styles.container}>
      {
        brick?
        <>
          <Pressable onPress={() => setShowTarget(!showTarget)}>
            <Text style={{ ...styles.text, color: "green"}}>{showTarget ? brick.target_text : "******"}</Text>
          </Pressable>
          <Pressable onPress={() => setShowNative(!showNative)}>
            <Text style={styles.text} >{showNative ? brick.native_text : "******"}</Text>
          </Pressable>
          <Text style={{ fontSize: 9, color: "#666" }}>{brick.target_audio_url}</Text>
        </>:
        <Text>Loadding...</Text>
      }
      <PlaySoundButton onPress={playSound} />
      <NextButton onPress={fetchRandomBrick} />
      <ReportButton onPress={reportBrokenFile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 20,
  }
});
