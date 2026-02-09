import { apiCall } from "@/api/client";
import { brickAudioUrl } from "@/api/endpoints";
import CloseButton from "@/components/CloseButton";
import { ActionRow } from "@/components/practice/ActionRow";
import { AnswerInputRow } from "@/components/practice/AnswerInputRow";
import { BrickDisplay } from "@/components/practice/BrickDisplay";
import { LearnMenu } from "@/components/practice/LearnMenu";
import { ResultDisplay } from "@/components/practice/ResultDisplay";
import { Toast } from "@/components/Toast";
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
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function PracticeScreen() {
  const DEFAULT_SETTINGS = {
    firstShowTarget: false,
    firstShowNative: true,
  };
  const NUM_TRANSCRIPTION_ATTEMPTS = 5;
  const { collection_id } = useLocalSearchParams();
  const [brick, setBrick] = useState<Brick | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);
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

  const fetchRandomBrick = async () => {
    try {
      setShowTarget(DEFAULT_SETTINGS.firstShowTarget);
      setShowNative(DEFAULT_SETTINGS.firstShowNative);
      setAnswer("");
      setCompareResult(null);
      const br = await apiCall<Brick>(`/bricks/random/${collection_id}`);
      setBrick(br);
      setAudioUri(brickAudioUrl(br.target_audio_uri));
    } catch (err) {
      console.error("Failed to fetch brick:", err);
    }
  };

  const playSound = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();
  };

  const showQuickMessage = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const reportBrokenFile = async () => {
    const response = await apiCall<StatusResponse>(
      `/bricks/report/${brick?.target_audio_uri}`,
      {
        method: "POST",
      },
    );
    showQuickMessage(`${response.message}. Cảm ơn bạn!`);
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
    setAnswer("scoring . . .");
    try {
      const result = await apiCall<SentenceCompareResponse>(
        "/text/comparisons",
        {
          method: "POST",
          body: {
            sentence1: finalAnswer,
            sentence2: brick.target_text,
          },
        },
      );

      setCompareResult(result);

      // Optional: Show a quick toast based on correctness
      if (result.correct) {
        showQuickMessage("Tuyệt vời! ✨");
      } else {
        showQuickMessage("Cố lên nhé! 💪");
      }
    } catch (err) {
      console.error("Comparison failed:", err);
      showQuickMessage("Failed to check answer.");
    } finally {
      setSubmitting(false);
      setAnswer(finalAnswer);
    }
  };

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecordingAudio = async () => {
    await audioRecorder.stop();
  };

  const stopRecordingAndTranscribeAudio = async (): Promise<string | null> => {
    await audioRecorder.stop();
    setAnswer("transcribing. . .");
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
        const { transcript } = await apiCall<AudioTranscription>(
          "/audio/transcribe",
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
    setAnswer("Thử lại");
    return null;
  };

  useEffect(() => {
    fetchRandomBrick();
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
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

      {brick ? (
        <BrickDisplay
          brick={brick}
          showTarget={showTarget}
          setShowTarget={setShowTarget}
          showNative={showNative}
          setShowNative={setShowNative}
        />
      ) : (
        <Text>Loading brick...</Text>
      )}

      <ActionRow playSound={playSound} next={fetchRandomBrick} />

      {compareResult && <ResultDisplay result={compareResult} />}

      <AnswerInputRow
        answer={answer}
        setAnswer={setAnswer}
        submitting={submitting}
        isRecording={recorderState.isRecording}
        onMicPress={recorderState.isRecording ? submitAnswer : record}
        onSubmit={submitAnswer}
        onQuitRecording={stopRecordingAudio}
      />

      {toast && <Toast message={toast} />}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
});
