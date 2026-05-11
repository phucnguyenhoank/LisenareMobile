import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface WordProps {
  word: string;
  segment?: {
    start_sec: number;
    end_sec: number;
  };
  onPlay: (startTime?: number) => void;
}

export default function Word({ word, segment, onPlay }: WordProps) {
  const handlePress = () => {
    if (!segment) return;
    onPlay(segment.start_sec);
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
