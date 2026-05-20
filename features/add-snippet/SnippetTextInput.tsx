import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  maxWords?: number;
};

export function SnippetTextInput({
  value,
  onChange,
  placeholder,
  maxWords = 25,
}: Props) {
  const wordCount = useMemo(() => {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
  }, [value]);

  const isOverLimit = wordCount > maxWords;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        textAlignVertical="top"
      />
      <View style={styles.footer}>
        <Text style={[styles.counter, isOverLimit && { color: "#FF3B30" }]}>
          {wordCount} / {maxWords} words
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
  },

  input: {
    fontSize: 16,
    color: "#333",
    minHeight: 60,
  },

  footer: {
    marginTop: 8,
    alignItems: "flex-end",
  },

  counter: {
    fontSize: 12,
    color: "#888",
  },
});
