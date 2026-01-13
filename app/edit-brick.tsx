import { useEffect, useState } from "react";
import {
  View, Text, TextInput, Switch, Pressable, 
  StyleSheet, ScrollView, ActivityIndicator, Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { apiCall } from "@/api/client";
import type { Brick } from "@/types/brick";
import type { Collection } from "@/types/collection";
import CloseButton from "@/components/CloseButton";
import colors from "@/theme/colors";

export default function EditBrick() {
  const router = useRouter();
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
    async function loadData() {
      try {
        const [brickData, collectionsData] = await Promise.all([
          apiCall<Brick>(`/bricks/${brickId}`),
          apiCall<Collection[]>("/collections")
        ]);
        setBrick(brickData);
        setNativeText(brickData.native_text);
        setTargetText(brickData.target_text);
        setIsPublic(brickData.is_public);
        setCollections(collectionsData);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    }
    loadData();
  }, [brickId]);

  const handleSave = async () => {
    try {
      await apiCall(`/bricks/${brickId}`, {
        method: "PATCH",
        body: { 
          native_text: nativeText, 
          target_text: targetText, 
          is_public: isPublic, 
          collection_ids: [collectionId]
        }
      });
      Alert.alert("Message", "Save successfully");
    } catch (e) { Alert.alert("Error", "Failed to save"); }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.secondary2} />;

  return (
    <>
      <View style={styles.closeBtn}>
        <CloseButton />
      </View>
      <View style={styles.container}>
        
        <View style={{ height: 60 }} />

        {/* 1. SMALLER ID BADGE */}
        <Text style={styles.idLabel}>BRICK #{brick?.id}</Text>

        {/* 2. COLLECTION (Picker with minimal border) */}
        <Text style={styles.sectionLabel}>COLLECTION</Text>
        <View style={styles.inputUnderline}>
          <Picker
            selectedValue={collectionId}
            onValueChange={(v) => setCollectionId(v)}
            style={styles.picker}
          >
            {collections.map((col) => (
              <Picker.Item key={col.id} label={col.name} value={col.id} style={{ fontSize: 14 }} />
            ))}
          </Picker>
        </View>

        {/* 3. AUDIO (Inline style) */}
        <Text style={styles.sectionLabel}>AUDIO FILE</Text>
        <View style={styles.audioRow}>
          <Text style={styles.audioName} numberOfLines={1}>
            {brick?.target_audio_url?.split("/").pop()}
          </Text>
          <Pressable onPress={() => alert("Change coming soon")}>
            <Text style={styles.greenAction}>Change</Text>
          </Pressable>
        </View>

        {/* 4. TEXT INPUTS (Compact & Modern) */}
        <Text style={styles.sectionLabel}>NATIVE TEXT</Text>
        <TextInput
          style={styles.input}
          value={nativeText}
          onChangeText={setNativeText}
          placeholder="Enter text..."
        />

        <Text style={styles.sectionLabel}>TARGET TEXT</Text>
        <TextInput
          style={styles.input}
          value={targetText}
          onChangeText={setTargetText}
          placeholder="Enter translation..."
        />

        {/* 5. SWITCH (Tight alignment) */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>Public Visibility</Text>
          <Switch 
            value={isPublic} 
            onValueChange={setIsPublic} 
            trackColor={{ true: colors.secondary2, false: "#E0E0E0" }} 
          />
        </View>

        {/* 6. BUTTON (Standard Green/Black/White style) */}
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
        </Pressable>
      </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
  },
  idLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#AAA",
    marginTop: 20,
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
    marginTop: 24,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  inputUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
  },
  picker: {
    marginLeft: -12, // Align text with labels
    height: 60,
  },
  audioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 12,
  },
  audioName: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },
  greenAction: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  label: {
    fontSize: 14,
    color: "#000",
  },
  saveBtn: {
    backgroundColor: "#23412a",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 48,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  closeBtn: {
    position: 'absolute',
    right: 30,
    top: 30,
    zIndex: 4,
    elevation: 4,
  },
});
