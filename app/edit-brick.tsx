import { apiCall } from "@/api/client";
import CloseButton from "@/components/CloseButton";
import colors from "@/theme/colors";
import type { Brick } from "@/types/brick";
import type { Collection } from "@/types/collection";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function EditBrickScreen() {
  const { brick_id } = useLocalSearchParams();
  const brickId = Number(brick_id);

  const [loading, setLoading] = useState(true);
  const [brick, setBrick] = useState<Brick | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [nativeText, setNativeText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [collectionId, setCollectionId] = useState<number>(1);

  useEffect(() => {
    (async () => {
      try {
        const [b, c] = await Promise.all([
          apiCall<Brick>(`/bricks/${brickId}`),
          apiCall<Collection[]>("/collections"),
        ]);
        setBrick(b);
        setNativeText(b.native_text);
        setTargetText(b.target_text);
        setIsPublic(b.is_public);
        setCollections(c);
      } finally {
        setLoading(false);
      }
    })();
  }, [brickId]);

  const handleSave = async () => {
    try {
      await apiCall(`/bricks/${brickId}`, {
        method: "PATCH",
        body: {
          native_text: nativeText,
          target_text: targetText,
          is_public: isPublic,
          collection_ids: [collectionId],
        },
      });
      Alert.alert("Saved");
    } catch {
      Alert.alert("Error", "Failed to save");
    }
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.secondary2} />;

  return (
    <KeyboardAwareScrollView
      bottomOffset={62}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.muted}>Brick #{brick?.id}</Text>
      <CloseButton />
      <Picker
        selectedValue={collectionId}
        onValueChange={setCollectionId}
        style={styles.input}
      >
        {collections.map((c) => (
          <Picker.Item key={c.id} label={c.name} value={c.id} />
        ))}
      </Picker>

      <Pressable onPress={() => alert("Change coming soon")}>
        <Text style={styles.muted}>
          Audio: {brick?.target_audio_uri?.split("/").pop()}
        </Text>
      </Pressable>

      <TextInput
        style={styles.input}
        value={nativeText}
        onChangeText={setNativeText}
        placeholder="Native text"
        multiline
      />

      <TextInput
        style={styles.input}
        value={targetText}
        onChangeText={setTargetText}
        placeholder="Target text"
        multiline
      />

      <View style={styles.row}>
        <Text>Public</Text>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ true: colors.secondary2 }}
        />
      </View>

      <Pressable style={styles.save} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    marginTop: 20,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  muted: {
    fontSize: 12,
    color: "#888",
    marginTop: 20,
  },
  save: {
    marginTop: 40,
    backgroundColor: "#23412a",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },
  close: {
    position: "absolute",
    top: 30,
    right: 30,
    zIndex: 10,
  },
});
