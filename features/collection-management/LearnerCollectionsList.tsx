import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import colors from "@/theme/colors";
import { Collection } from "@/types/collection";
import { request } from "@/services/client";

interface Props {
  collections: Collection[];
  isSaving: boolean;
  onDelete: (id: number) => void;
  onRename: (id: number, name: string) => void;
}

export default function LearnerCollectionsList({
  collections,
  isSaving,
  onDelete,
  onRename,
}: Props) {
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      request(`/collections/${id}/name`, {
        method: "PATCH",
        body: { name },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-collections"],
      });
    },
  });

  const startRename = (collection: Collection) => {
    setEditingId(collection.id);
    setDraft(collection.name);
  };

  const cancelRename = () => {
    setEditingId(null);
    setActiveId(null);
    setDraft("");
  };

  const saveRename = async () => {
    if (!editingId || !draft.trim()) return;

    try {
      await onRename(editingId, draft.trim());

      cancelRename();
      onRename(editingId, draft.trim());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MY COLLECTIONS</Text>

      <Text style={styles.subtitle}>Your personal learning collections.</Text>

      <View style={styles.list}>
        {collections.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="folder-open-outline"
              size={28}
              color={colors.secondary3}
            />

            <Text style={styles.emptyText}>No collections yet</Text>
          </View>
        ) : (
          collections.map((collection) => {
            const editing = editingId === collection.id;

            return (
              <View key={collection.id} style={styles.row}>
                <Ionicons
                  name="folder-open-outline"
                  size={20}
                  color={colors.secondary2}
                />

                <View style={styles.content}>
                  {editing ? (
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      autoFocus
                      style={styles.input}
                      editable={!isSaving}
                      returnKeyType="done"
                      onSubmitEditing={saveRename}
                    />
                  ) : (
                    <Text style={styles.name} numberOfLines={1}>
                      {collection.name}
                    </Text>
                  )}
                </View>

                {editing ? (
                  <View style={styles.actions}>
                    <Pressable onPress={saveRename} hitSlop={10}>
                      <Ionicons
                        name="checkmark"
                        size={22}
                        color={colors.secondary}
                      />
                    </Pressable>

                    <Pressable onPress={cancelRename} hitSlop={10}>
                      <Ionicons name="close" size={22} color={colors.text} />
                    </Pressable>
                  </View>
                ) : activeId === collection.id ? (
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => startRename(collection)}
                      hitSlop={10}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color={colors.secondary}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => onDelete(collection.id)}
                      hitSlop={10}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.important}
                      />
                    </Pressable>

                    <Pressable onPress={() => setActiveId(null)} hitSlop={10}>
                      <Ionicons name="close" size={18} color={colors.text} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setActiveId(collection.id)}
                    hitSlop={10}
                    style={styles.menuButton}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={18}
                      color={colors.text}
                    />
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.secondary2,
  },

  subtitle: {
    fontSize: 14,
    color: colors.text,
    marginTop: -8,
  },

  list: {
    gap: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 14,
    paddingHorizontal: 4,

    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },

  input: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary3,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginLeft: 12,
  },

  menuButton: {
    paddingLeft: 12,
    paddingVertical: 4,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 10,
  },

  emptyText: {
    fontSize: 14,
    color: colors.text,
  },
});
