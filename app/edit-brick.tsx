import { request } from "@/api/client";
import { BrickMetadataSelector } from "@/components/brick-form/BrickMetadataSelector";
import { FormField } from "@/components/FormField";
import TextButton from "@/components/TextButton";
import colors from "@/theme/colors";
import type { Brick, GrammarPoint } from "@/types/brick";
import { SentenceFunction, SentenceStructure, UnitType } from "@/types/brick";
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

const cleanText = (text: string) => text.replace(/\n/g, " ");

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

  const [metadata, setMetadata] = useState({
    unitType: UnitType.word,
    structure: null as SentenceStructure | null,
    func: null as SentenceFunction | null,
    selectedGrammarPoints: [] as GrammarPoint[],
  });

  useEffect(() => {
    (async () => {
      try {
        const [b, c] = await Promise.all([
          request<Brick>(`/bricks/by-id/${brickId}`),
          request<Collection[]>("/collections"),
        ]);
        setBrick(b);
        setNativeText(b.native_text);
        setTargetText(b.target_text);
        setIsPublic(b.is_public);
        setCollectionId(b.collection_id || 1);

        setMetadata({
          unitType: b.brick_metadata.unit_type,
          structure: b.brick_metadata.structure,
          func: b.brick_metadata.function,
          selectedGrammarPoints:
            b.brick_metadata.grammar_points?.map((gp) => gp.grammar_point) ||
            [],
        });

        setCollections(c);
      } finally {
        setLoading(false);
      }
    })();
  }, [brickId]);

  const handleSave = async () => {
    try {
      await request(`/bricks/${brickId}`, {
        method: "PATCH",
        body: {
          native_text: nativeText,
          target_text: targetText,
          is_public: isPublic,
          collection_id: collectionId,
          brick_metadata: {
            unit_type: metadata.unitType,
            structure: metadata.structure,
            function: metadata.func,
            grammar_points: metadata.selectedGrammarPoints.map((p) => ({
              grammar_point: p,
            })),
          },
        },
      });
      Alert.alert("Thành công", "Đã lưu chỉnh sửa");
    } catch {
      Alert.alert("Error", "Failed to save");
    }
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.secondary2} />;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chỉnh sửa Brick</Text>
          <Text style={styles.idBadge}>#{brick?.id}</Text>
        </View>

        {collections.length > 0 ? (
          <FormField label="Bộ sưu tập">
            <View>
              <Picker
                selectedValue={collectionId}
                onValueChange={setCollectionId}
              >
                {collections.map((c) => (
                  <Picker.Item key={c.id} label={c.name} value={c.id} />
                ))}
              </Picker>
            </View>
          </FormField>
        ) : (
          <View></View>
        )}

        <View style={styles.audioRow}>
          <Text style={styles.audioLabel}>Audio:</Text>
          <Pressable onPress={() => alert("Change coming soon")}>
            <Text style={styles.audioFile}>
              {brick?.target_audio_uri?.split("/").pop()}
            </Text>
          </Pressable>
        </View>

        <FormField label="Tiếng Việt">
          <TextInput
            style={styles.input}
            value={nativeText}
            onChangeText={(t) => setNativeText(cleanText(t))}
            multiline
            placeholder="Nhập nghĩa tiếng Việt..."
          />
        </FormField>

        <FormField label="Tiếng Anh">
          <TextInput
            style={[styles.input, styles.targetText]}
            value={targetText}
            onChangeText={(t) => setTargetText(cleanText(t))}
            multiline
            placeholder="Enter English text..."
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
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ true: colors.secondary2 }}
          />
        </View>

        <BrickMetadataSelector
          state={metadata}
          onChange={(patch) => setMetadata((prev) => ({ ...prev, ...patch }))}
        />

        <View style={styles.actionRow}>
          <TextButton
            title="Thoát"
            variant="outline"
            onPress={() => router.back()}
            style={styles.flex1}
          />
          <TextButton
            title="Lưu thay đổi"
            onPress={handleSave}
            style={styles.flex1}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F4F7", // Soft grey background makes cards "pop"
  },
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1C1E",
  },
  idBadge: {
    backgroundColor: "#E0E4E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: "#666",
    overflow: "hidden",
  },
  input: {
    fontSize: 16,
    color: "#333",
    minHeight: 40,
    paddingTop: 8,
  },
  targetText: {
    fontWeight: "600",
    color: "#000",
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  audioLabel: { fontSize: 13, color: "#888" },
  audioFile: {
    fontSize: 13,
    color: colors.secondary2,
    textDecorationLine: "underline",
  },
  switchCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  switchLabel: { fontSize: 15, fontWeight: "600", color: "#333" },
  switchSubLabel: { fontSize: 12, color: "#888", marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingBottom: 40,
  },
  flex1: { flex: 1 },
});
