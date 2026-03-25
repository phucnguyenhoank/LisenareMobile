import { request } from "@/api/client";
import colors from "@/theme/colors";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const Input = ({ label, value, onChange, ...props }: any) => (
  <View style={{ gap: 8 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      {...props}
    />
  </View>
);

export default function AddBrickScreen() {
  const [form, setForm] = useState({
    native: "",
    target: "",
    coll: "my collection",
    group: "my group",
    public: true,
  });
  const [loading, setLoading] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { isRecording } = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);

  const toggleRecord = async () => {
    if (isRecording) {
      await recorder.stop();
      if (recorder.uri) player.replace({ uri: recorder.uri });
    } else {
      if (!(await AudioModule.requestRecordingPermissionsAsync()).granted)
        return Alert.alert("Lỗi", "Cần quyền micro");
      await recorder.prepareToRecordAsync();
      recorder.record();
    }
  };

  const onSubmit = async () => {
    if (!recorder.uri || !form.native || !form.target)
      return Alert.alert("Lỗi", "Thiếu thông tin hoặc chưa ghi âm");

    setLoading(true);
    const data = new FormData();
    data.append("audio_file", {
      uri: recorder.uri,
      name: `rec.m4a`,
      type: "audio/m4a",
    } as any);
    data.append("native_text", form.native);
    data.append("target_text", form.target);
    data.append("collection_name", form.coll);
    data.append("group_name", form.group);
    data.append("is_public", String(form.public));

    try {
      await request("/bricks", { method: "POST", body: data });
      Alert.alert("Thành công", "Đã tạo Brick!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu. Kiểm tra lại kết nối.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Giúp nhấn nút submit mượt hơn khi bàn phím đang mở
      >
        <View style={styles.card}>
          <TouchableOpacity
            onPress={toggleRecord}
            style={[styles.mic, isRecording && { backgroundColor: "#FF3B30" }]}
          >
            <FontAwesome
              name={isRecording ? "stop" : "microphone"}
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.status}>
            {isRecording
              ? "Đang ghi âm..."
              : recorder.uri
                ? "Đã ghi âm thành công"
                : "Nhấn để bắt đầu ghi âm"}
          </Text>
          {recorder.uri && !isRecording && (
            <TouchableOpacity
              onPress={() => {
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
          <Input
            label="Tiếng Việt"
            value={form.native}
            onChange={(t: string) => setForm((f) => ({ ...f, native: t }))}
            placeholder="Xin chào"
          />
          <Input
            label="Tiếng Anh"
            value={form.target}
            onChange={(t: string) => setForm((f) => ({ ...f, target: t }))}
            placeholder="Hello"
          />
          <Input
            label="Bộ sưu tập"
            value={form.coll}
            onChange={(t: string) => setForm((f) => ({ ...f, coll: t }))}
          />
          <Input
            label="Tên nhóm"
            value={form.group}
            onChange={(t: string) => setForm((f) => ({ ...f, group: t }))}
          />

          <View style={styles.row}>
            <Text style={styles.label}>Chế độ công khai</Text>
            <Switch
              value={form.public}
              onValueChange={(v) => setForm((f) => ({ ...f, public: v }))}
              trackColor={{ true: colors.secondary }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, (loading || isRecording) && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={loading || isRecording}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Hoàn tất & Tạo</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      {/* <KeyboardToolbar /> */}
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
  label: { fontSize: 15, fontWeight: "700", color: "#333" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
});
