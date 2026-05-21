import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import colors from "@/theme/colors";
import { request } from "@/services/client";
import { Collection } from "@/types/collection";
import SystemLevelSelector from "@/features/collection-management/SystemLevelSelector";
import LearnerCollectionsList from "@/features/collection-management/LearnerCollectionsList";
import { SYSTEM_LEVELS } from "@/constants/collections";
import { Ionicons } from "@expo/vector-icons";

export default function CollectionManagementScreen() {
  const [initialSystemIds, setInitialSystemIds] = useState<number[]>([]);
  const [selectedSystemIds, setSelectedSystemIds] = useState<number[]>([]);
  const [learnerCollections, setLearnerCollections] = useState<Collection[]>(
    [],
  );
  const [allLearnerCollections, setAllLearnerCollections] = useState<
    Collection[]
  >([]);

  const hasUnsavedChanges =
    JSON.stringify([...selectedSystemIds].sort()) !==
    JSON.stringify([...initialSystemIds].sort());

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    async function loadCurrentCollections() {
      try {
        setIsLoadingData(true);
        const collections = await request<Collection[]>("/collections/pending");
        setAllLearnerCollections(collections);

        const initialActiveSystemIds = SYSTEM_LEVELS.filter((systemLevel) =>
          collections.some((col) => col.name === systemLevel.name),
        ).map((systemLevel) => systemLevel.id);

        const systemNames = SYSTEM_LEVELS.map((s) => s.name);
        const customLearnerCollections = collections.filter(
          (col) => !systemNames.includes(col.name),
        );

        setInitialSystemIds(initialActiveSystemIds);
        setSelectedSystemIds(initialActiveSystemIds);
        setLearnerCollections(customLearnerCollections);
      } catch (error) {
        Alert.alert("Error", "Failed to load collection settings.");
        console.error(error);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadCurrentCollections();
  }, []);

  const toggleSystemLevel = (id: number) => {
    setSelectedSystemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const addedIds = selectedSystemIds.filter(
        (id) => !initialSystemIds.includes(id),
      );
      const removedSystemIds = initialSystemIds.filter(
        (id) => !selectedSystemIds.includes(id),
      );

      if (addedIds.length > 0) {
        await request("/collections/overrides", {
          method: "POST",
          body: { collection_ids: addedIds },
        });
      }

      if (removedSystemIds.length > 0) {
        const learnerCollectionIdsToDelete = removedSystemIds
          .map((sysId) => {
            const sysConfig = SYSTEM_LEVELS.find((s) => s.id === sysId);
            const activeMatch = allLearnerCollections.find(
              (c) => c.name === sysConfig?.name,
            );
            return activeMatch ? activeMatch.id : null;
          })
          .filter((id): id is number => id !== null);

        if (learnerCollectionIdsToDelete.length > 0) {
          const queryParams = learnerCollectionIdsToDelete
            .map((id) => `collection_ids=${id}`)
            .join("&");
          await request(`/collections?${queryParams}`, {
            method: "DELETE",
          });
        }
      }

      setInitialSystemIds(selectedSystemIds);
      const refreshedCollections = await request<Collection[]>(
        "/collections/pending",
      );
      setAllLearnerCollections(refreshedCollections);

      Alert.alert(
        "Success",
        "Your practice collection updates have been saved.",
      );
    } catch (error) {
      Alert.alert("Error", "Could not synchronize choices with server.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLearnerCol = (collection_id: number) => {
    const targetCol = learnerCollections.find((c) => c.id === collection_id);
    const colName = targetCol ? targetCol.name : "this collection";

    Alert.alert("Delete", `Delete custom "${colName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await request(`/collections?collection_ids=${collection_id}`, {
              method: "DELETE",
            });
            setLearnerCollections((prev) =>
              prev.filter((item) => item.id !== collection_id),
            );
            setAllLearnerCollections((prev) =>
              prev.filter((item) => item.id !== collection_id),
            );
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const handleRename = async (id: number, name: string) => {
    try {
      setIsSaving(true);
      await request(`/collections/${id}/name`, {
        method: "PATCH",
        body: { name },
      });

      const updater = (prev: Collection[]) =>
        prev.map((c) => (c.id === id ? { ...c, name } : c));

      setLearnerCollections(updater);
      setAllLearnerCollections(updater);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <SystemLevelSelector
        systemLevels={SYSTEM_LEVELS}
        selectedSystemIds={selectedSystemIds}
        isSaving={isSaving}
        onToggleLevel={toggleSystemLevel}
      />

      {hasUnsavedChanges && (
        <View style={styles.systemSaveContainer}>
          <TouchableOpacity
            onPress={handleSaveAll}
            disabled={isSaving}
            style={styles.systemSaveButton}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.background}
                />

                <Text style={styles.systemSaveText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />

      <LearnerCollectionsList
        collections={learnerCollections}
        isSaving={isSaving}
        onDelete={handleDeleteLearnerCol}
        onRename={handleRename}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  content: { padding: 20, paddingBottom: 40 },
  systemSaveContainer: {
    marginTop: 14,
    alignItems: "flex-end",
  },

  systemSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    paddingHorizontal: 14,
    paddingVertical: 10,

    backgroundColor: colors.secondary,
    borderRadius: 999,
  },

  systemSaveText: {
    color: colors.background,
    fontWeight: "600",
    fontSize: 14,
  },
  divider: { height: 1.5, backgroundColor: colors.border, marginVertical: 24 },
});
