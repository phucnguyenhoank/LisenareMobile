import { request } from "@/api/client";
import { BrickMetadataSelector } from "@/components/brick-form/BrickMetadataSelector";
import { FormField } from "@/components/FormField";
import colors from "@/theme/colors";
import {
  GrammarPoint,
  SentenceFunction,
  SentenceStructure,
  UnitType,
} from "@/types/brick";
import { cleanText } from "@/utils/brick-preprocessing";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";

export default function AddBrickScreen() {
  const params = useLocalSearchParams<{
    native?: string;
    target?: string;
    audio_path?: string;
  }>();

  const [form, setForm] = useState({
    native: params.native || "",
    target: params.target || "",
    coll: "my collection",
    group: "my group",
    public: true,
  });
  const [loading, setLoading] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(
    params.audio_path ?? null,
  );

  const [isTargetTextUnique, setIsTargetTextUnique] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { isRecording } = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);

  // Metadata Fields
  const [metadata, setMetadata] = useState({
    unitType: UnitType.word,
    structure: null as SentenceStructure | null,
    func: null as SentenceFunction | null,
    selectedGrammarPoints: [] as GrammarPoint[],
  });

  const toggleRecord = async () => {
    if (isRecording) {
      await recorder.stop();
      if (recorder.uri) {
        setAudioPath(recorder.uri);
        player.replace({ uri: recorder.uri });
      }
    } else {
      if (!(await AudioModule.requestRecordingPermissionsAsync()).granted)
        return Alert.alert("Thông báo", "Cần quyền micro");
      await recorder.prepareToRecordAsync();
      recorder.record();
    }
  };

  const onSubmit = async () => {
    if (!audioPath) return Alert.alert("Thông báo", "Hãy thêm ghi âm");
    if (!form.native || !form.target)
      return Alert.alert(
        "Thông báo",
        "Thiếu đầy đủ câu tiếng Việt và tiếng Anh",
      );

    setLoading(true);
    const data = new FormData();

    // 1. Append the audio file as usual
    data.append("audio_file", {
      uri: audioPath,
      name: `rec.m4a`,
      type: "audio/m4a",
    } as any);

    // 2. Prepare the structured JSON object matching BrickCreateRequest
    const brickRequestData = {
      native_text: form.native,
      target_text: form.target,
      collection_name: form.coll,
      group_name: form.group,
      is_public: form.public,
      brick_metadata: {
        unit_type: metadata.unitType,
        structure: metadata.structure,
        function: metadata.func,
        grammar_points: metadata.selectedGrammarPoints.map(
          (selectedGrammarPoint) => ({
            grammar_point: selectedGrammarPoint,
          }),
        ),
      },
    };

    // 3. Append as a serialized string
    data.append("brick_data", JSON.stringify(brickRequestData));

    try {
      await request("/bricks", {
        method: "POST",
        body: data,
      });

      Alert.alert("Thành công", "Đã tạo Brick!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Lỗi", "Kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*", // Limit to audio files
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        setAudioPath(asset.uri);
        player.replace({ uri: asset.uri });

        Alert.alert("Thành công", "Đã chọn file: " + asset.name);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể chọn file");
    }
  };

  useEffect(() => {
    if (audioPath) {
      player.replace({ uri: audioPath });
    }
  }, [audioPath]);

  useEffect(() => {
    if (!form.target) {
      setIsTargetTextUnique(true); // true is just for sensible UI
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await request<{ exists: boolean }>(
          `/bricks/check-exists?target_text=${encodeURIComponent(form.target)}`,
        );
        setIsTargetTextUnique(!res.exists);
      } catch (err) {
        console.error("Check failed", err);
      } finally {
        setIsChecking(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [form.target]);

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Giúp nhấn nút submit mượt hơn khi bàn phím đang mở
      >
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            {/* Record Button */}
            <TouchableOpacity
              onPress={toggleRecord}
              style={[
                styles.mic,
                isRecording && { backgroundColor: "#FF3B30" },
              ]}
            >
              <FontAwesome
                name={isRecording ? "stop" : "microphone"}
                size={30}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Upload Button */}
            {!isRecording && (
              <TouchableOpacity
                onPress={pickAudioFile}
                style={[styles.mic, { backgroundColor: colors.secondary }]} // Or any color you like
              >
                <FontAwesome name="upload" size={25} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.status}>
            {isRecording ? "Đang ghi âm..." : "Ghi âm hoặc Tải lên file audio"}
          </Text>
          {audioPath && !isRecording && (
            <TouchableOpacity
              onPress={() => {
                if (!audioPath) return;
                player.seekTo(0);
                player.play();
              }}
              style={styles.play}
            >
              <Feather name="play" size={18} color={colors.secondary} />
              <Text style={{ color: colors.secondary, fontWeight: "600" }}>
                Nghe thử bản ghi
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.form}>
          <FormField label="Tiếng Việt">
            <TextInput
              style={styles.input}
              value={form.native}
              onChangeText={(t: string) =>
                setForm((f) => ({ ...f, native: cleanText(t) }))
              }
              multiline
              placeholder="Xin chào"
            />
          </FormField>

          <FormField label="Tiếng Anh">
            <TextInput
              style={styles.input}
              value={form.target}
              onChangeText={(t: string) =>
                setForm((f) => ({ ...f, target: cleanText(t) }))
              }
              multiline
              placeholder="Hello"
            />
            {isChecking && (
              <ActivityIndicator size="small" style={styles.checkLoader} />
            )}
            {!isTargetTextUnique && (
              <Text style={styles.warningText}>Câu này đã được sở hữu.</Text>
            )}
          </FormField>

          <FormField label="Bộ sưu tập">
            <TextInput
              style={styles.input}
              value={form.coll}
              onChangeText={(t: string) => setForm((f) => ({ ...f, coll: t }))}
            />
          </FormField>

          <FormField label="Tên nhóm">
            <TextInput
              style={styles.input}
              value={form.group}
              onChangeText={(t: string) => setForm((f) => ({ ...f, group: t }))}
            />
          </FormField>

          <View style={styles.switchCard}>
            <View>
              <Text style={styles.switchLabel}>Chế độ công khai</Text>
              <Text style={styles.switchSubLabel}>
                Mọi người có thể thấy câu này
              </Text>
            </View>
            <Switch
              value={form.public}
              onValueChange={(v) => setForm((f) => ({ ...f, public: v }))}
              trackColor={{ true: colors.secondary }}
            />
          </View>
        </View>

        <BrickMetadataSelector
          state={metadata}
          onChange={(patch) => setMetadata((prev) => ({ ...prev, ...patch }))}
        />

        <TouchableOpacity
          style={[
            styles.btn,
            (loading || isRecording || !isTargetTextUnique) && { opacity: 0.5 },
          ]}
          onPress={onSubmit}
          disabled={loading || isRecording || !isTargetTextUnique}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Hoàn tất & Tạo</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  mic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  status: { marginTop: 12, color: "#444", fontWeight: "600" },
  play: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    gap: 6,
    padding: 8,
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
  },
  form: { gap: 16 },

  input: {
    fontSize: 16,
    color: "#333",
    minHeight: 40,
    paddingTop: 8,
  },

  btn: {
    backgroundColor: colors.secondary,
    height: 56,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    elevation: 2,
  },

  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  // metadata
  metadataToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  metadataToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  metadataContainer: {
    gap: 12,
  },

  //
  switchCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  switchLabel: { fontSize: 15, fontWeight: "600", color: "#333" },
  switchSubLabel: { fontSize: 12, color: "#888", marginTop: 2 },

  //
  checkLoader: {
    position: "absolute",
    right: 12,
    top: 15, // Adjust based on your input's padding
  },
  warningText: {
    color: colors.secondary2, // System red
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
});
