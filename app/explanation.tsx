import { request } from "@/api/client";
import SentenceItem from "@/components/explanation/SentenceItem";
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

interface ExplanationResponse {
  target_term: string;
  explanation: string;
  examples: string[];
}

export default function ExplanationScreen() {
  const [inputText, setInputText] = useState("");
  const [data, setData] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanationTranslation, setExplanationTranslation] = useState<
    string | null
  >(null);

  const [translationLoading, setTranslationLoading] = useState(false);

  const handleExplain = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null); // Reset error
    setData(null); // Clear previous data

    try {
      const result = await request<ExplanationResponse>("/explanations", {
        method: "POST",
        body: { target_term: inputText },
      });
      // Check if the backend returned data but it's empty
      if (!result || !result.explanation) {
        setError(
          "I couldn't find an explanation for that word. Try another one!",
        );
      } else {
        setData(result);
      }
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
      // Handle your 422 or other network errors
      setError("Sorry, I don't have information on that term right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateExplanation = async () => {
    if (!data?.explanation) return;

    // Toggle hide
    if (explanationTranslation) {
      setExplanationTranslation(null);
      return;
    }

    setTranslationLoading(true);

    try {
      const result = await request<SentenceTranslateResponse>(
        "/text/translations",
        {
          method: "POST",
          body: {
            text: data.explanation,
          },
        },
      );

      setExplanationTranslation(result.text);
    } catch (error) {
      console.error("Explanation translation failed:", error);
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerSection}>
        <Text style={styles.title}>Word Context</Text>
        <Text style={styles.subtitle}>
          Get a simple explanation and real-life examples to help you actually
          use new words.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Type a word (e.g., 'elated') or a phrase..."
        placeholderTextColor="#9CA3AF"
        value={inputText}
        onChangeText={(text) => {
          setInputText(text);
          if (error) setError(null); // Clear error when user types again
        }}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleExplain}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Explain for me</Text>
        )}
      </TouchableOpacity>

      {/* No Data / Error State */}
      {error && !loading && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>🤔 {error}</Text>
        </View>
      )}

      {/* Success State */}
      {data && (
        <View style={styles.resultCard}>
          <Text style={styles.targetLabel}>{data.target_term}</Text>
          <View>
            <Text style={styles.explanationText}>{data.explanation}</Text>

            <TouchableOpacity
              onPress={handleTranslateExplanation}
              style={styles.translateButton}
            >
              {translationLoading ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : (
                <Text style={styles.translateButtonText}>
                  {explanationTranslation ? "Hide" : "Translate"}
                </Text>
              )}
            </TouchableOpacity>

            {explanationTranslation && (
              <Text style={styles.translationText}>
                {explanationTranslation}
              </Text>
            )}
          </View>
          <View style={styles.divider} />
          <Text style={styles.exampleHeader}>Examples</Text>
          {data.examples.map((ex, index) => (
            <SentenceItem key={index} text={ex} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60 },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28, // Made it a bit bigger
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280", // Softer gray
    lineHeight: 20,
    fontWeight: "400",
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.secondary, // Deep Forest
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  resultCard: {
    backgroundColor: colors.buttonBackground, // Light Mint tint
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  targetLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary2,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  exampleHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.secondary4,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  emptyCard: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },

  //
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
});
