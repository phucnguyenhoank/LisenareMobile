import { request } from "@/api/client";
import { useAudioCache } from "@/hooks/useAudioCache";
import type { PronunciationAnalysisResponse } from "@/types/audio";
import {
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Dispatch, SetStateAction, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import PlaySoundButton from "../PlaySoundButton";
import { BrickDisplay } from "../practice/BrickDisplay";
import { MicButton } from "../practice/MicButton";

interface Props {
  brick_id: number;
  audioUri: string;
  target_text: string;
  native_text: string;
  setResult: Dispatch<SetStateAction<PronunciationAnalysisResponse | null>>;
}

export default function StepUnderstandSpeak({
  brick_id,
  audioUri,
  target_text,
  native_text,
  setResult,
}: Props) {
  const { audioPath, audioLoading } = useAudioCache(audioUri);
  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);
  const DEFAULT_SETTINGS = {
    firstShowTarget: false,
    firstShowNative: true,
  };
  const [showTarget, setShowTarget] = useState<boolean>(
    DEFAULT_SETTINGS.firstShowTarget,
  );
  const [showNative, setShowNative] = useState<boolean>(
    DEFAULT_SETTINGS.firstShowNative,
  );

  const [statusMessage, setStatusMessage] = useState<string>("Nhấn mic và nói");
  const NUM_TRANSCRIPTION_ATTEMPTS = 5;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const playSound = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();
  };

  // TODO: Ask for permission (currently only ask if first in the practice.tsx screen.)
  const record = async () => {
    setStatusMessage("Đang ghi âm...");
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecordingAndEvaluateAudio = async (): Promise<any | null> => {
    await audioRecorder.stop();
    setStatusMessage("Đang đánh giá phát âm...");

    const formData = new FormData();
    formData.append("learner_file", {
      uri: audioRecorder.uri,
      name: "learner_recording.m4a",
      type: "audio/m4a",
    } as any);

    const endpoint = `/audio/ipa-evaluation?target_brick_id=${encodeURIComponent(brick_id)}`;

    for (let attempt = 1; attempt <= NUM_TRANSCRIPTION_ATTEMPTS; attempt++) {
      try {
        const result = await request<PronunciationAnalysisResponse>(endpoint, {
          method: "POST",
          body: formData,
        });

        setStatusMessage("Hoàn tất!");
        setResult(result);
        console.log(JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        if (attempt < NUM_TRANSCRIPTION_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    }
    setStatusMessage("Lỗi đánh giá. Thử lại!");
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hiểu và Nói lại bằng tiếng Anh</Text>

      <BrickDisplay
        target_text={target_text}
        native_text={native_text}
        showTarget={showTarget}
        showNative={showNative}
        setShowTarget={setShowTarget}
        setShowNative={setShowNative}
      />

      {audioLoading ? (
        <ActivityIndicator />
      ) : (
        <PlaySoundButton onPress={playSound} />
      )}
      <View style={{ margin: 20 }}></View>
      <MicButton
        isRecording={recorderState.isRecording}
        onPress={
          recorderState.isRecording ? stopRecordingAndEvaluateAudio : record
        }
        onCancel={async () => {
          await audioRecorder.stop();
          setStatusMessage("Đã hủy ghi âm");
        }}
      />
      <Text style={styles.statusLabel}>{statusMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 100,
  },
  statusLabel: {
    color: "#666",
    marginTop: 12,
    fontStyle: "italic",
  },
});
