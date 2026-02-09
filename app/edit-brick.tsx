import { apiCall } from "@/api/client";
import TextButton from "@/components/TextButton";
import colors from "@/theme/colors";
import type { Brick } from "@/types/brick";
import type { Collection } from "@/types/collection";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

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
          apiCall<Brick>(`/bricks/by-id/${brickId}`),
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
      await apiCall(`/bricks/by-id/${brickId}`, {
        method: "PATCH",
        body: {
          native_text: nativeText,
          target_text: targetText,
          is_public: isPublic,
          collection_ids: [collectionId],
        },
      });
      Alert.alert("Đã lưu");
    } catch {
      Alert.alert("Error", "Failed to save");
    }
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.secondary2} />;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAwareScrollView
        bottomOffset={62}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.muted}>Brick #{brick?.id}</Text>

        <Field label="Bộ sưu tập">
          <Picker
            selectedValue={collectionId}
            onValueChange={setCollectionId}
            style={styles.picker}
          >
            {collections.map((c) => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        </Field>

        <Pressable onPress={() => alert("Change coming soon")}>
          <Text style={styles.muted}>
            Audio: {brick?.target_audio_uri?.split("/").pop()}
          </Text>
        </Pressable>

        <Field label="Tiếng việt">
          <TextInput
            style={styles.input}
            value={nativeText}
            onChangeText={setNativeText}
            multiline
          />
        </Field>

        <Field label="Tiếng anh">
          <TextInput
            style={styles.input}
            value={targetText}
            onChangeText={setTargetText}
            multiline
          />
        </Field>

        <View style={styles.row}>
          <Text>Công khai</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ true: colors.secondary2 }}
          />
        </View>

        <View style={styles.actionRow}>
          <TextButton
            title="Thoát"
            variant="outline"
            onPress={() => router.back()}
            style={{ flex: 1 }}
          />

          <TextButton title="Lưu" onPress={handleSave} style={{ flex: 1 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary2,
    paddingVertical: 10,
    fontSize: 14,
  },
  picker: {
    marginLeft: -8,
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
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 40,
  },
});
