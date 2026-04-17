import { request } from "@/api/client";
import { AudioInput } from "@/components/AudioInput";
import { SnippetTextInput } from "@/components/SnippetTextInput";
import colors from "@/theme/colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddSnippetScreen() {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState("");
  const [translation, setTranslation] = useState("");
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!content) {
      return Alert.alert("Missing content");
    }
    if (!audioPath) {
      return Alert.alert("Missing audio");
    }

    const formData = new FormData();

    formData.append("audio_file", {
      uri: audioPath,
      name: "recording.m4a",
      type: "audio/m4a",
    } as any);

    formData.append("snippet_content", content);

    if (translation) {
      formData.append("snippet_translation", translation);
    }

    setLoading(true);
    try {
      await request("/snippets", {
        method: "POST",
        body: formData,
      });

      Alert.alert("Success", "Snippet created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to create snippet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { marginTop: insets.top, marginBottom: insets.bottom },
      ]}
    >
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New Snippet</Text>
          <Text style={styles.subtitle}>Share your sentence in English.</Text>
        </View>
        <AudioInput audioPath={audioPath} onChange={setAudioPath} />

        <SnippetTextInput
          value={content}
          onChange={setContent}
          placeholder="The beautiful thing about learning is that no one can take it away from you."
        />

        <SnippetTextInput
          value={translation}
          onChange={setTranslation}
          placeholder="Điều tuyệt vời của việc học là không ai có thể lấy nó đi khỏi bạn."
          maxWords={100}
        />

        <TouchableOpacity
          style={[styles.btn, (loading || !audioPath) && { opacity: 0.5 }]}
          disabled={loading || !audioPath}
          onPress={onSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Snippet</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  screen: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { padding: 20, gap: 16 },

  form: {},

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
  },

  btn: {
    backgroundColor: colors.secondary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
