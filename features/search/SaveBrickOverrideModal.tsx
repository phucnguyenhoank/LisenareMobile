import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { request } from "@/services/client";
import colors from "@/theme/colors";
import { Brick } from "@/types/brick";
import { Collection } from "@/types/collection";
import { showDialog } from "@/utils/dialogs";
import { handleRequestError } from "@/utils/handle-request-error";
import { toast } from "@/utils/toasts";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  brick: Brick;
};

export default function SaveBrickOverrideModal({
  visible,
  onClose,
  brick,
}: Props) {
  const [collectionName, setCollectionName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { token, isTokenLoading } = useAuth();

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["pendingCollections"],
    queryFn: () => request<Collection[]>("/collections/pending"),
    enabled: !!token && visible,
  });

  useEffect(() => {
    if (!visible) {
      setCollectionName("");
    }
  }, [visible]);

  const handleSave = async () => {
    Keyboard.dismiss();

    const trimmed = collectionName.trim();

    if (!trimmed || isSaving) return;

    try {
      setIsSaving(true);

      await request("/bricks/override", {
        method: "POST",
        body: {
          brick_id: brick.id,
          collection_name: trimmed,
        },
      });

      toast.success(`Added to your collection "${trimmed}"`);

      onClose();
    } catch (error: any) {
      handleRequestError(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isTokenLoading && !token && visible) {
      showDialog({
        title: "Authentication Required",
        message:
          "Please log in to access this feature and track your learning progress.",
        confirmText: "Log In",
        cancelText: "Maybe Later",
        showCancel: true,
        onCancel: () => onClose(),
        onConfirm: () => {
          onClose(); // Safe clean-up
          router.push({
            pathname: "/setting",
            params: { from: "auth_required" },
          });
        },
      });
    }
  }, [token, isTokenLoading, visible, onClose]);

  if (isTokenLoading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </Modal>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />

        <View style={styles.sheet}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Save to collection</Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* COLLECTIONS */}
          {isLoading ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {collections.map((collection) => {
                const selected = collection.name === collectionName;

                return (
                  <TouchableOpacity
                    key={collection.id}
                    onPress={() => setCollectionName(collection.name)}
                    style={[styles.chip, selected && styles.activeChip]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.activeChipText,
                      ]}
                    >
                      {collection.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* INPUT */}
          <TextInput
            placeholder="New collection..."
            value={collectionName}
            onChangeText={setCollectionName}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          {/* SAVE */}
          <Button
            title={isSaving ? "Saving..." : "Save"}
            onPress={handleSave}
            disabled={!collectionName.trim() || isSaving}
            style={{
              opacity: !collectionName.trim() || isSaving ? 0.5 : 1,
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    padding: 20,
    gap: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  chips: {
    gap: 10,
    paddingRight: 12,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 999,
    borderWidth: 1,

    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  activeChip: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },

  chipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },

  activeChipText: {
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 14,

    fontSize: 16,
    color: colors.text,
  },
});
