import { request } from "@/services/client";
import SentenceItem from "@/features/explain-word/SentenceItem";
import StreamListenButton from "@/features/explain-word/StreamListenButton";
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
import Button from "@/components/Button";

interface ExplanationResponse {
  target_term: string;
  explanation: string;
  examples: string[];
}

export default function WordExplanationScreen() {
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
    setError(null);
    setData(null);
    setExplanationTranslation(null);

    try {
      const result = await request<ExplanationResponse>("/explanations", {
        method: "POST",
        body: { target_term: inputText },
      });

      if (!result?.explanation) {
        setError(
          "I couldn't find an explanation for that word. Try another one!",
        );
      } else {
        setData(result);
      }
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
      setError("Sorry, I don't have information on that term right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateExplanation = async () => {
    if (!data?.explanation) return;

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
          body: { text: data.explanation },
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
          if (error) setError(null);
        }}
        multiline
      />

      <Button
        onPress={handleExplain}
        title={loading ? "Searching..." : "Explain for me"}
        disabled={loading}
        style={styles.button}
      />

      {loading && (
        <View style={[styles.resultCard, styles.loadingCard]}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>🤔 {error}</Text>
        </View>
      )}

      {data && (
        <View style={styles.resultCard}>
          <Text style={styles.targetLabel}>{data.target_term}</Text>

          {/* Explanation */}
          <View style={styles.row}>
            <Text style={styles.sectionLabel}>Explanation</Text>

            <StreamListenButton text={data.explanation} />
          </View>

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
            <Text style={styles.translationText}>{explanationTranslation}</Text>
          )}

          <View style={styles.divider} />

          {/* Examples */}
          <Text style={styles.sectionLabel}>Examples</Text>

          {data.examples.map((ex, index) => (
            <View key={index} style={styles.exampleItem}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <SentenceItem text={ex} />
                </View>

                <StreamListenButton text={ex} />
              </View>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.aiWarningText}>
        ⚠️ AI-generated, check important info
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    borderStyle: "dashed",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerSection: { marginBottom: 24 },
  targetLabel: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },

  translateButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },

  translateButtonText: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: "600",
  },

  translationText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 8,
  },

  exampleItem: {
    marginBottom: 14,
  },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60 },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 20,
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
    paddingVertical: 14,
    marginBottom: 30,
    alignSelf: "auto",
  },

  block: { marginBottom: 8 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.secondary4,
    textTransform: "uppercase",
  },

  explanationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },

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
    backgroundColor: "#fafbf9",
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

  aiWarningText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
