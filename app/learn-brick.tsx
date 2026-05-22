import { request } from "@/services/client";
import PronunciationDisplay from "@/features/brick-learn/PronunciationDisplay";
import StepListenSpeak from "@/features/brick-learn/StepListenSpeak";
import StepReadSpeak from "@/features/brick-learn/StepReadSpeak";
import StepUnderstandSpeak from "@/features/brick-learn/StepUnderstandSpeak";
import colors from "@/theme/colors";
import { PronunciationAnalysisResponse } from "@/types/audio";
import { Brick } from "@/types/brick";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LearnScreen() {
  const { brick_id } = useLocalSearchParams();
  const [currentBrick, setCurrentBrick] = useState<Brick | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const [pronunciationResult, setPronunciationResult] =
    useState<PronunciationAnalysisResponse | null>(null);
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (pronunciationResult) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [pronunciationResult]);

  useEffect(() => {
    const fetchSingleBrick = async () => {
      if (!brick_id) return;
      setLoading(true);
      try {
        const data = await request<Brick>(`/bricks/by-id/${brick_id}`);
        setCurrentBrick(data);
      } catch (error) {
        console.error("Error fetching individual brick detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleBrick();
  }, [brick_id]);

  const goNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Exit directly when learning session for this single brick is done
      router.back();
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const closeBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPronunciationResult(null);
    });
  };

  if (loading && !currentBrick) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.infoText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!currentBrick && !loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Không tìm thấy dữ liệu.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Visual Step Indicator instead of collection indexes */}
      <Text style={styles.progressText}>Bước {step} / 3</Text>

      {step === 1 && currentBrick && (
        <StepListenSpeak
          audioUri={currentBrick.target_audio_path}
          changeStep={goNext}
        />
      )}

      {step === 2 && currentBrick && (
        <StepReadSpeak
          audioUri={currentBrick.target_audio_path}
          target_text={currentBrick.target_text}
          native_text={currentBrick.native_text}
          changeStep={goNext}
        />
      )}

      {step === 3 && currentBrick && (
        <StepUnderstandSpeak
          brick_id={currentBrick.id}
          audioUri={currentBrick.target_audio_path}
          target_text={currentBrick.target_text}
          native_text={currentBrick.native_text}
          setResult={setPronunciationResult}
          setRecordedUri={setRecordedUri}
        />
      )}

      <Pressable onPress={goBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </Pressable>

      {pronunciationResult && (
        <Pressable style={styles.backdrop} onPress={closeBottomSheet} />
      )}

      {pronunciationResult && currentBrick && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              paddingBottom: insets.bottom,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.dragIndicator} />
          <PronunciationDisplay
            targetText={currentBrick.target_text}
            data={pronunciationResult}
            originalAudioUri={currentBrick.target_audio_path}
            recordedAudioUri={recordedUri}
            onNext={
              pronunciationResult.accuracy_score >= 0.7
                ? () => {
                    goNext();
                    closeBottomSheet();
                  }
                : undefined
            }
          />
          <View style={styles.sheetFooter}></View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  progressText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
  },
  infoText: {
    marginTop: 10,
    textAlign: "center",
  },
  backButton: {
    alignSelf: "center",
    marginTop: 100,
    padding: 10,
  },
  backButtonText: {
    color: "#999",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    elevation: 12,
    maxHeight: "80%",
  },
  sheetFooter: {
    alignItems: "flex-end",
    padding: 20,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
