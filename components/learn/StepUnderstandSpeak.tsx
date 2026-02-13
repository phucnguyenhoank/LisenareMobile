import { apiCall } from "@/api/client";
import { brickAudioUrl } from "@/api/endpoints";
import {
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PlaySoundButton from "../PlaySoundButton";
import { BrickDisplay } from "../practice/BrickDisplay";
import { MicButton } from "../practice/MicButton";

interface Props {
  audioUri: string;
  target_text: string;
  native_text: string;
  changeStep: () => void;
}

export default function StepUnderstandSpeak({
  audioUri,
  target_text,
  native_text,
  changeStep,
}: Props) {
  const player = useAudioPlayer({ uri: brickAudioUrl(audioUri) });
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

  const record = async () => {
    setStatusMessage("Đang ghi âm...");
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecordingAndTranscribeAudio = async (): Promise<string | null> => {
    await audioRecorder.stop();
    setStatusMessage("Đang chuyển đổi giọng nói..."); // Label update

    const formData = new FormData();
    formData.append("file", {
      uri: audioRecorder.uri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as any);

    for (let attempt = 1; attempt <= NUM_TRANSCRIPTION_ATTEMPTS; attempt++) {
      try {
        const { transcript } = await apiCall<{ transcript: string }>(
          "/audio/transcribe",
          { method: "POST", body: formData },
        );

        const text = transcript.trim();
        setStatusMessage("Hoàn tất!"); // Displayed in the status label
        return text;
      } catch {
        if (attempt < NUM_TRANSCRIPTION_ATTEMPTS)
          await new Promise((r) => setTimeout(r, 400));
      }
    }

    setStatusMessage("Không thể nhận diện. Thử lại!");
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nói bằng tiếng Anh câu bạn hiểu</Text>

      <BrickDisplay
        target_text={target_text}
        native_text={native_text}
        showTarget={showTarget}
        showNative={showNative}
        setShowTarget={setShowTarget}
        setShowNative={setShowNative}
      />

      {/* <ActionRow playSound={playSound} next={changeStep} /> */}
      <PlaySoundButton onPress={playSound} />
      <View style={{ margin: 20 }}></View>
      <MicButton
        isRecording={recorderState.isRecording}
        onPress={
          recorderState.isRecording ? stopRecordingAndTranscribeAudio : record
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
