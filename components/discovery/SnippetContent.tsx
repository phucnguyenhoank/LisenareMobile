import React from "react";
import { StyleSheet, View } from "react-native";

import { WordSegmentSecond } from "@/types/forced-alignment";
import Word from "./Word";

export default function SnippetContent({
  content,
  segments,
  onPlay,
}: {
  content: string;
  segments: WordSegmentSecond[];
  onPlay: (startTime?: number) => void;
}) {
  return (
    <View style={styles.contentContainer}>
      {content.split(" ").map((word, index) => (
        <Word
          key={index}
          word={word}
          segment={segments[index]}
          onPlay={onPlay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
});
