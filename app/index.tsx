import { View, StyleSheet, Button, Text } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { apiCall } from "@/api/client";
import { useEffect, useState } from 'react';
import type { Brick } from '@/types/brick';
import { brickAudioUrl } from '@/api/endpoints';

export default function Index() {
  const [brick, setBrick] = useState<Brick | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri? {uri: audioUri}: null);

  useEffect(() => {
    const fetchBrick = async () => {
      try {
        const brick = await apiCall("/bricks/brick/2");
        setBrick(brick);
        setAudioUri(brickAudioUrl(brick.target_audio_url));
      }
      catch (err) {
        console.error("Failed to fetch brick:", err);
      }
    }
    fetchBrick();
  }, []);

  return (
    <View>
      {
        brick?
        <>
          <Text style={{ fontSize: 24 }}>{brick.target_text}</Text>
          <Text style={{ color: "#666" }}>{brick.native_text}</Text>
          <Text>{brick.target_audio_url}</Text>
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
    </View>
  );
}
