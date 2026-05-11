import { useCachedAudio } from "@/hooks/useCachedAudio";
import colors from "@/theme/colors";
import type {
  PhonemeAnalysis,
  PronunciationAnalysisResponse,
} from "@/types/audio";

import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PronunciationDisplayProps {
  targetText: string;
  data: PronunciationAnalysisResponse;
  originalAudioUri: string;
  recordedAudioUri: string | null;
  onNext?: () => void;
}

function PhonemeItem({ item }: { item: PhonemeAnalysis }) {
  return (
    <View style={styles.phonemeBox}>
      <Text style={[styles.phonemeText, styles[item.status]]}>
        {item.phoneme}
      </Text>

      {item.status === "mispronounced" && item.heard && (
        <Text style={styles.heardText}>({item.heard})</Text>
      )}

      {item.status === "missing" && <View style={styles.missingUnderline} />}
    </View>
  );
}

function PronunciationDisplay({
  targetText,
  data,
  originalAudioUri,
  recordedAudioUri,
  onNext,
}: PronunciationDisplayProps) {
  const { audioPath, isAudioLoading } = useCachedAudio(originalAudioUri);
  const originalPlayer = useAudioPlayer(audioPath ? { uri: audioPath } : null);

  const recordedPlayer = useAudioPlayer(
    recordedAudioUri ? { uri: recordedAudioUri } : null,
  );

  const playOriginal = () => {
    originalPlayer.seekTo(0);
    originalPlayer.play();
  };

  const playRecorded = () => {
    if (!recordedAudioUri) return;
    recordedPlayer.seekTo(0);
    recordedPlayer.play();
  };

  return (
    <View style={styles.container}>
      {/* 1. TARGET TEXT */}
      <Text style={styles.targetText}>{targetText}</Text>

      {/* 2. ACCURACY */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Accuracy:</Text>
        <Text
          style={[
            styles.scoreValue,
            { color: getScoreColor(data.accuracy_score) },
          ]}
        >
          {(data.accuracy_score * 100).toFixed(0)}%
        </Text>
      </View>

      {/* 3. ORIGINAL AUDIO + IPA */}
      <View style={styles.sectionHeader}>
        <Text style={styles.label}>Teacher Pronunciation</Text>
        <TouchableOpacity onPress={playOriginal}>
          <Ionicons name="volume-high" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.phonemeList}>
        {data.analysis.map((item, index) => (
          <PhonemeItem key={index} item={item} />
        ))}
      </View>

      {/* 4. LEARNER AUDIO + IPA */}
      <View style={styles.sectionHeader}>
        <Text style={styles.label}>Yours</Text>
        <TouchableOpacity onPress={playRecorded} disabled={!recordedAudioUri}>
          <Ionicons
            name="mic"
            size={22}
            color={recordedAudioUri ? "#333" : "#ccc"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.phonemeList}>
        {data.learner_phonemes.map((phoneme, index) => (
          <View key={index} style={styles.phonemeBox}>
            <Text style={styles.phonemeText}>{phoneme}</Text>
          </View>
        ))}
      </View>

      {/* 5. NEXT BUTTON */}
      {onNext && (
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Ionicons
            name="arrow-forward-circle"
            size={40}
            color={colors.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Helper to color the total score
const getScoreColor = (score: number) => {
  if (score > 0.8) return colors.secondary5; // Green
  if (score > 0.5) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  targetText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
    color: colors.secondary,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  phonemeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  phonemeBox: {
    alignItems: "center",
    marginRight: 6,
    marginBottom: 10,
    minWidth: 20,
  },
  phonemeText: {
    fontSize: 22,
    fontFamily: "System", // IPA characters usually render well in system fonts
    fontWeight: "500",
  },
  heardText: {
    fontSize: 10,
    color: "#f44336",
    marginTop: 2,
  },
  missingUnderline: {
    height: 2,
    width: "100%",
    backgroundColor: "#bdbdbd",
    marginTop: 2,
  },

  // Status Styles
  correct: {
    color: colors.secondary5,
  },
  mispronounced: {
    color: "#FF9800",
  },
  missing: {
    color: "#bdbdbd",
    textDecorationLine: "line-through",
  },
  extra: {
    color: "#F44336",
    borderBottomWidth: 1,
    borderBottomColor: "#F44336",
  },

  // Next button
  nextButton: {
    alignSelf: "flex-end",
    marginTop: 16,
  },
});

export default PronunciationDisplay;
