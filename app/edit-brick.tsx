import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  Pressable,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { apiCall } from "@/api/client";
import type { Brick } from "@/types/brick";

export default function EditBrick() {
  const { brick_id } = useLocalSearchParams();
  const brickId = Number(brick_id);
  const [brick, setBrick] = useState<Brick | null>(null);
  const [nativeText, setNativeText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [collectionId, setCollectionId] = useState<number>(1);

  useEffect(() => {
    apiCall<Brick>(`/bricks/${brickId}`).then((data) => {
      setBrick(data);
      setNativeText(data.native_text);
      setTargetText(data.target_text);
      setIsPublic(data.is_public);
    });
  }, [brickId]);

  const handleSave = async () => {
    await apiCall(`/bricks/${brickId}`, {
      method: "PATCH",
      data: {
        native_text: nativeText,
        target_text: targetText,
        is_public: isPublic,
      }
    });
    alert("✅ Brick updated");
  };

  const handlePickAudio = () => {
    alert("Update audio is coming.");
  }

  if (!brick) return null;

  return (
    <View style={styles.container}>
      {/* Collection selector */}
      <Text style={styles.label}>Collection</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={collectionId}
          onValueChange={(value) => setCollectionId(value)}
        >
          <Picker.Item label="Essential 3000 Words" value={1} />
          <Picker.Item label="TOEIC Core" value={2} />
        </Picker>
      </View>

      {/* Metadata */}
      <View style={styles.metaBox}>
        <Text style={styles.metaText}>Brick ID: {brick.id}</Text>
      </View>

      {/* Audio */}
      <Text style={styles.label}>Audio</Text>

      <View style={styles.audioRow}>
        <Text style={styles.audioName}>
          {brick.target_audio_url.split("/").pop()}
        </Text>

        <Pressable onPress={() => { handlePickAudio() }}>
          <Text style={styles.audioChange}>Change</Text>
        </Pressable>
      </View>

      {/* Native text */}
      <Text style={styles.label}>Native Text</Text>
      <TextInput
        style={styles.input}
        value={nativeText}
        onChangeText={setNativeText}
        placeholder="Enter native text"
      />

      {/* Target text */}
      <Text style={styles.label}>Target Text</Text>
      <TextInput
        style={styles.input}
        value={targetText}
        onChangeText={setTargetText}
        placeholder="Enter target text"
      />

      {/* Public toggle */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Public</Text>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ true: "green" }}
        />
      </View>

      {/* Save */}
      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },

  label: {
    color: "black",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    overflow: "hidden",
  },

  metaBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },

  metaText: {
    color: "black",
    fontSize: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    padding: 10,
    color: "black",
    backgroundColor: "#fff",
  },

  switchRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  saveButton: {
    marginTop: 24,
    backgroundColor: "green",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  audioName: {
    color: "#000",
    fontSize: 14,
    flexShrink: 1,
  },

  audioChange: {
    color: "green",
    fontWeight: "600",
    fontSize: 14,
  },

});
