import { request } from "@/services/client";
import colors from "@/theme/colors";
import { SentenceTranslateResponse } from "@/types/sentence";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function SentenceItem({ text }: { text: string }) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (translation) {
      setTranslation(null); // Toggle off if already translated
      return;
    }

    setLoading(true);
    try {
      const result = await request<SentenceTranslateResponse>(
        "/text/translations",
        {
          method: "POST",
          body: { text: text }, // Adjust key name based on your SentenceTranslateRequest schema
        },
      );
      setTranslation(result.text);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.exampleContainer}>
      <View style={styles.exampleItem}>
        <Text style={styles.exampleBullet}>•</Text>
        <View style={styles.exampleTextContainer}>
          <Text style={styles.exampleText}>{text}</Text>

          {/* The small translate button */}
          <TouchableOpacity
            onPress={handleTranslate}
            style={styles.translateButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <Text style={styles.translateButtonText}>
                {translation ? "Hide" : "Translate"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Show translated text if available */}
      {translation && <Text style={styles.translationText}>{translation}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  exampleContainer: {
    marginBottom: 12,
  },
  exampleTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  translateButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  translateButtonText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: "600",
  },
  translationText: {
    fontSize: 14,
    color: colors.secondary3, // A softer color for the translation
    marginLeft: 20,
    marginTop: 4,
    fontWeight: "500",
  },

  exampleItem: { flexDirection: "row", marginBottom: 8 },
  exampleBullet: { color: colors.secondary3, marginRight: 8, fontSize: 18 },
  exampleText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontStyle: "italic",
  },
});
