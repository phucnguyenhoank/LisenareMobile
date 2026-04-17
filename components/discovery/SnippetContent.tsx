import React from "react";
import { StyleSheet, View } from "react-native";

import { WordSegmentSecond } from "@/types/forced-alignment";
import Word from "./Word";

export default function SnippetContent({
  content,
  segments,
  player,
}: {
  content: string;
  segments: WordSegmentSecond[];
  player: any;
}) {
  return (
    <View style={styles.contentContainer}>
      {content.split(" ").map((word, index) => (
        <Word
          key={index}
          word={word}
          segment={segments[index]}
          player={player}
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
