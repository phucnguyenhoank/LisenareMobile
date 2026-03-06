import { request } from "@/api/client";
import CloseButton from "@/components/CloseButton";
import PlaySoundButton from "@/components/PlaySoundButton";
import { AnswerInputRow } from "@/components/practice/AnswerInputRow";
import { BrickDisplay } from "@/components/practice/BrickDisplay";
import { LearnMenu } from "@/components/practice/LearnMenu";
import ResultDisplay from "@/components/practice/ResultDisplay";
import { Toast } from "@/components/Toast";
import { useAudioCache } from "@/hooks/useAudioCache";
import type { StatusResponse } from "@/types/api";
import type { AudioTranscription } from "@/types/audio";
import type { Brick } from "@/types/brick";
import type { SentenceCompareResponse } from "@/types/comparison";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function normalizeCollectionIds(input?: string | string[]): number[] | null {
  if (!input) return null;
  const arr = Array.isArray(input) ? input : [input];
  const ids = arr.map(Number).filter(Number.isFinite);
  return ids.length > 0 ? ids : null;
}

function buildFetchBrickUrl(collectionIds: number[] | null) {
  if (!collectionIds) return "/bricks/fsrs";
  const params = new URLSearchParams();
  collectionIds.forEach((id) => params.append("collection_ids", id.toString()));
  return `/bricks/fsrs?${params.toString()}`;
}

const DEFAULT_SETTINGS = {
  firstShowTarget: false,
  firstShowNative: true,
};

const NUM_TRANSCRIPTION_ATTEMPTS = 5;

export default function PracticeScreen() {
  const { collection_ids } = useLocalSearchParams<{
    collection_ids?: string | string[];
  }>();
  const collectionIds = normalizeCollectionIds(collection_ids);
  const [brick, setBrick] = useState<Brick | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { audioPath, audioLoading } = useAudioCache(audioUrl);
  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);
  const [showTarget, setShowTarget] = useState<boolean>(
    DEFAULT_SETTINGS.firstShowTarget,
  );
  const [showNative, setShowNative] = useState<boolean>(
    DEFAULT_SETTINGS.firstShowNative,
  );
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [compareResult, setCompareResult] =
    useState<SentenceCompareResponse | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [microStatusMessage, setMicroStatusMessage] =
    useState<string>("nhấn mic để nói");
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const insets = useSafeAreaInsets();
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [hasSentReview, setHasSentReview] = useState<boolean>(false);

  const fetchBrickFSRS = async () => {
    try {
      setShowTarget(DEFAULT_SETTINGS.firstShowTarget);
      setShowNative(DEFAULT_SETTINGS.firstShowNative);
      setAnswer("");
      setCompareResult(null);
      const url = buildFetchBrickUrl(collectionIds);
      const br = await request<Brick>(url);
      setBrick(br);
      setAudioUrl(br.target_audio_uri);
      setIsAnswerRevealed(false);
      setHasSentReview(false);
    } catch (err) {
      console.error("Failed to fetch brick:", err);
    }
  };

  const playSound = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();
    setIsAnswerRevealed(true);
  };

  const showQuickMessage = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const reportBrokenFile = async () => {
    const response = await request<StatusResponse>(
      `/bricks/report/${brick?.target_audio_uri}`,
      {
        method: "POST",
      },
    );
    showQuickMessage(`${response.message}. Cảm ơn bạn!`);
    fetchBrickFSRS();
  };

  const submitAnswer = async () => {
    setMenuOpen(false);
    let finalAnswer = answer;
    if (recorderState.isRecording) {
      const transcribed = await stopRecordingAndTranscribeAudio();
      if (transcribed) finalAnswer = transcribed;
    }

    if (!finalAnswer.trim() || !brick) {
      showQuickMessage("Nhập câu trả lời của bạn trước nha!");
      return;
    }

    setSubmitting(true);
    setMicroStatusMessage("đang chấm điểm");
    try {
      let request_body: any = {
        sentence1: finalAnswer,
        sentence2: brick.target_text,
      };

      if (!hasSentReview) {
        request_body.review_base = {
          brick_id: brick.id,
          reviewed_at: new Date().toISOString(),
          is_answer_revealed: isAnswerRevealed,
        };
        setHasSentReview(true);
      }
      const result = await request<SentenceCompareResponse>(
        "/text/semantic-comparison",
        {
          method: "POST",
          body: request_body,
        },
      );

      setCompareResult(result);
    } catch (err) {
      console.error("Comparison failed:", err);
      showQuickMessage("Failed to check answer.");
    } finally {
      setSubmitting(false);
      setAnswer(finalAnswer);
      setMicroStatusMessage("nhấn mic để nói");
    }
  };

  const record = async () => {
    setMicroStatusMessage("đang nghe");
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecordingAudio = async () => {
    await audioRecorder.stop();
    setMicroStatusMessage("nhấn mic để nói");
  };

  const stopRecordingAndTranscribeAudio = async (): Promise<string | null> => {
    await audioRecorder.stop();
    setMicroStatusMessage("đang hiểu");
    console.log(`audioRecorder.uri:${audioRecorder.uri}`);
    const formData = new FormData();
    formData.append("file", {
      uri: audioRecorder.uri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as any);
    // The recorded file need to be released from the OS for some reason,
    // despite the file already exits and size greater than 0, hence we retry sending the
    // request until the file is released.
    for (let attempt = 1; attempt <= NUM_TRANSCRIPTION_ATTEMPTS; attempt++) {
      try {
        console.log(`attempt:${attempt}`);
        const { transcript } = await request<AudioTranscription>(
          "/audio/transcripts",
          {
            method: "POST",
            body: formData,
          },
        );

        // setAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
        const text = transcript.trim();
        setAnswer(text);
        return text;
      } catch {
        if (attempt < NUM_TRANSCRIPTION_ATTEMPTS)
          await new Promise((r) => setTimeout(r, 400));
      }
    }
    setMicroStatusMessage("ui, bạn thử lại nha :(");
    return null;
  };

  const closeBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // hidden position
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCompareResult(null); // hide content AFTER animation
    });
  };

  useEffect(() => {
    const init = async () => {
      fetchBrickFSRS();
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    };

    init();
  }, []);

  useEffect(() => {
    if (!compareResult) return;

    if (compareResult.correct) {
      playSound();
      // Open bottom sheet
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      showQuickMessage(
        `Làm lại nhé 💪, bạn được ${Math.round(compareResult.score * 100)}%`,
      );
    }
  }, [compareResult]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <LearnMenu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          brick={brick}
          reportBrokenFile={reportBrokenFile}
        />

        <CloseButton />
        <Text style={styles.debugText}>
          {isAnswerRevealed ? "REVEALED" : "Fresh"}
        </Text>

        {brick ? (
          <BrickDisplay
            target_text={brick.target_text}
            native_text={brick.native_text}
            showTarget={showTarget}
            setShowTarget={setShowTarget}
            showNative={showNative}
            setShowNative={setShowNative}
          />
        ) : (
          <Text>Loading brick...</Text>
        )}

        {audioLoading ? (
          <ActivityIndicator />
        ) : (
          <PlaySoundButton onPress={playSound} />
        )}

        <AnswerInputRow
          answer={answer}
          setAnswer={setAnswer}
          submitting={submitting}
          isRecording={recorderState.isRecording}
          onMicPress={recorderState.isRecording ? submitAnswer : record}
          onSubmit={submitAnswer}
          onQuitRecording={stopRecordingAudio}
        />

        <Text style={styles.microStatusLabel}>{microStatusMessage}</Text>
      </KeyboardAwareScrollView>

      {toast && (
        <View style={styles.toastWrapper}>
          <Toast message={toast} />
        </View>
      )}

      {compareResult?.correct && (
        <Pressable style={styles.backdrop} onPress={closeBottomSheet} />
      )}

      {compareResult?.correct && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.dragIndicator} />

          <ResultDisplay
            result={compareResult}
            targetText={brick?.target_text}
            userAnswerText={answer}
            onNext={() => {
              closeBottomSheet();
              fetchBrickFSRS();
            }}
            onPlaySound={playSound}
          />

          <View style={styles.sheetFooter}></View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    padding: 20,
  },
  microStatusLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 12,
    fontStyle: "italic",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
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

  toastWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 60,
    alignItems: "center",
  },

  debugText: {
    fontSize: 10,
  },
});
