import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface WordProps {
  word: string;
  segment?: {
    start_sec: number;
    end_sec: number;
  };
  player: any;
}

export default function Word({ word, segment, player }: WordProps) {
  const handlePress = async () => {
    if (!segment) return;

    console.log("Play:", word, segment);

    // Seek to start
    await player.seekTo(segment.start_sec);
    player.play();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={styles.word}>{word} </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  word: { fontSize: 20, lineHeight: 28, color: "#1c1e21" },
});
