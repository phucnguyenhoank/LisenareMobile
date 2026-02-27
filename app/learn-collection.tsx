import { request } from "@/api/client";
import PronunciationDisplay from "@/components/learn/PronunciationDisplay";
import StepListenSpeak from "@/components/learn/StepListenSpeak";
import StepReadSpeak from "@/components/learn/StepReadSpeak";
import StepUnderstandSpeak from "@/components/learn/StepUnderstandSpeak";
import colors from "@/theme/colors";
import { PronunciationAnalysisResponse } from "@/types/audio";
import { Brick } from "@/types/brick";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export type BrickLearnResponse = {
  brick: Brick | null;
  total_bricks: number;
};

export default function LearnScreen() {
  const { collection_id } = useLocalSearchParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [totalBricks, setTotalBricks] = useState(0);
  const [currentBrick, setCurrentBrick] = useState<Brick | null>(null);
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
    const fetchBrickData = async () => {
      setLoading(true);
      try {
        const endpoint = `/bricks/learn/${collection_id}?brick_order=${currentIndex}`;
        const data = await request<BrickLearnResponse>(endpoint);

        setCurrentBrick(data.brick);
        setTotalBricks(data.total_bricks);
      } catch (error) {
        console.error("Error fetching brick:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrickData();
  }, [currentIndex, collection_id]);

  const goNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (currentIndex < totalBricks) {
      setCurrentIndex((prev) => prev + 1);
      setStep(1);
    } else {
      console.log("Đã hoàn thành bộ sưu tập!");
      router.back();
    }
    console.log(`goNext:${currentIndex},${step}`);
  };

  // Logic lùi lại (Ngược lại hoàn toàn với goNext)
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (currentIndex > 1) {
      setCurrentIndex(currentIndex - 1);
      setStep(3);
    } else {
      router.back();
    }
  };

  const closeBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight, // hidden position
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPronunciationResult(null); // hide content AFTER animation
    });
  };

  if (loading && !currentBrick) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={{ marginTop: 10, textAlign: "center" }}>
          Đang tải dữ liệu...
        </Text>
      </View>
    );
  }

  if (!currentBrick && !loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>Không tìm thấy dữ liệu.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <Text style={styles.progressText}>
        {currentIndex} / {totalBricks}
      </Text>

      {step === 1 && currentBrick && (
        <StepListenSpeak
          audioUri={currentBrick.target_audio_uri}
          changeStep={goNext}
        />
      )}

      {step === 2 && currentBrick && (
        <StepReadSpeak
          audioUri={currentBrick.target_audio_uri}
          target_text={currentBrick.target_text}
          native_text={currentBrick.native_text}
          changeStep={goNext}
        />
      )}

      {step === 3 && currentBrick && (
        <StepUnderstandSpeak
          brick_id={currentBrick.id}
          audioUri={currentBrick.target_audio_uri}
          target_text={currentBrick.target_text}
          native_text={currentBrick.native_text}
          setResult={setPronunciationResult}
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
  backButton: {
    alignSelf: "center",
    marginTop: 100,
    padding: 10,
  },
  backButtonText: {
    color: "#999", // Màu xám (grey)
    fontSize: 14,
    textDecorationLine: "underline", // Gạch chân để trông giống link (tùy chọn)
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
