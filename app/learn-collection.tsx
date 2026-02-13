import { apiCall } from "@/api/client";
import StepListenSpeak from "@/components/learn/StepListenSpeak";
import StepReadSpeak from "@/components/learn/StepReadSpeak";
import StepUnderstandSpeak from "@/components/learn/StepUnderstandSpeak";
import { Brick } from "@/types/brick";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  useEffect(() => {
    const fetchBrickData = async () => {
      setLoading(true);
      try {
        const endpoint = `/bricks/learn/${collection_id}?brick_order=${currentIndex}`;
        const data = await apiCall<BrickLearnResponse>(endpoint);

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

  if (loading && !currentBrick) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
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
          audioUri={currentBrick.target_audio_uri}
          target_text={currentBrick.target_text}
          native_text={currentBrick.native_text}
          changeStep={goNext}
        />
      )}

      <Pressable onPress={goBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </Pressable>
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
});
