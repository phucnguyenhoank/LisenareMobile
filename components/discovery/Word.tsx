import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface WordProps {
  word: string;
  blur: boolean;
}

export default function Word({ word, blur }: WordProps) {
  const handlePress = () => {
    console.log("Play audio from word:", word);
  };

  const displayWord = blur ? "▇".repeat(word.length) : word;

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={styles.word}>{displayWord} </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  word: { fontSize: 18, lineHeight: 28, color: "#1c1e21" },
});
