import { View, StyleSheet, Button, Text, Pressable } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { apiCall } from "@/api/client";
import { useEffect, useState } from 'react';
import type { Brick } from '@/types/brick';
import { brickAudioUrl } from '@/api/endpoints';

export default function Index() {
  const [brick, setBrick] = useState<Brick | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? {uri: audioUri} : null);
  const [showTarget, setShowTarget] = useState<boolean>(true);
  const [showNative, setShowNative] = useState<boolean>(true);

  const fetchRandomBrick = async () => {
    try {
      const br = await apiCall("/bricks/brick/random");
      setBrick(br);
      setAudioUri(brickAudioUrl(br.target_audio_url));
    }
    catch (err) {
      console.error("Failed to fetch brick:", err);
    }
  };

  useEffect(() => {
    fetchRandomBrick();
  }, []);

  return (
    <View>
      {
        brick?
        <>
          <Pressable onPress={() => setShowTarget(!showTarget)}>
            <Text style={{ fontSize: 24, color: "green"}}>{showTarget ? brick.target_text : "***"}</Text>
          </Pressable>
          
          <Pressable onPress={() => setShowNative(!showNative)}>
            <Text style={{ fontSize: 24, color: "blue"}} >{showNative ? brick.native_text : "***"}</Text>
          </Pressable>
          
          <Text style={{ fontSize: 9, color: "#666" }}>{brick.target_audio_url}</Text>
        </>:
        <Text>Loadding...</Text>
      }
      
      <Button
        title="Play"
        disabled={!player}
        onPress={() => {
          player?.seekTo(0);
          player?.play();
        }}
      />

      <Button
        title='Next'
        onPress={fetchRandomBrick}
      />

    </View>
  );
}
