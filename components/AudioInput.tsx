import colors from "@/theme/colors";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  audioPath: string | null;
  onChange: (uri: string | null) => void;
};

export function AudioInput({ audioPath, onChange }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { isRecording } = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);

  const toggleRecord = async () => {
    if (isRecording) {
      await recorder.stop();
      if (recorder.uri) {
        onChange(recorder.uri);
      }
    } else {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) return;

      await recorder.prepareToRecordAsync();
      recorder.record();
    }
  };

  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (audioPath) {
      player.replace({ uri: audioPath });
    }
  }, [audioPath]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={toggleRecord}
          style={[
            styles.iconBtn,
            isRecording && { backgroundColor: "#FF3B30" },
          ]}
        >
          <FontAwesome
            name={isRecording ? "stop" : "microphone"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>

        {!isRecording && (
          <TouchableOpacity
            onPress={pickAudioFile}
            style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
          >
            <FontAwesome name="upload" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      {/* ▶️ Play */}
      {audioPath && !isRecording && (
        <TouchableOpacity
          style={styles.play}
          onPress={() => {
            player.seekTo(0);
            player.play();
          }}
        >
          <Feather name="play" size={14} color={colors.secondary} />
          <Text style={styles.playText}>Play audio</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  play: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  playText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
