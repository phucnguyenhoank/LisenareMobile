import {
  BrickSort,
  BrickStatusFilter,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "@/constants/bricks";
import colors from "@/theme/colors";
import { Collection } from "@/types/collection";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable, // 1. Imported Pressable
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;

  collections: Collection[];

  selectedCollectionId: number;
  selectedStatus: BrickStatusFilter;
  selectedSort: BrickSort;

  onCollectionChange: (id: number) => void;
  onStatusChange: (status: BrickStatusFilter) => void;
  onSortChange: (sort: BrickSort) => void;
}

export default function FilterSortModal({
  visible,
  onClose,

  collections,

  selectedCollectionId,
  selectedStatus,
  selectedSort,

  onCollectionChange,
  onStatusChange,
  onSortChange,
}: Props) {
  const [collectionId, setCollectionId] = useState(selectedCollectionId);
  const [status, setStatus] = useState<BrickStatusFilter>(selectedStatus);
  const [sort, setSort] = useState<BrickSort>(selectedSort);

  useEffect(() => {
    if (!visible) return;

    setCollectionId(selectedCollectionId);
    setStatus(selectedStatus);
    setSort(selectedSort);
  }, [visible, selectedCollectionId, selectedStatus, selectedSort]);

  const handleApply = () => {
    onCollectionChange(collectionId);
    onStatusChange(status);
    onSortChange(sort);
    onClose();
  };

  const renderSection = (
    title: string,
    options: readonly {
      label: string;
      value: any;
    }[],
    selected: any,
    onChange: (value: any) => void,
  ) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipGrid}>
        {options.map((option) => {
          const active = selected === option.value;

          return (
            <TouchableOpacity
              key={option.label}
              onPress={() => onChange(option.value)}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* 2. Made grey backdrop dismiss the modal on tap */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 3. Stop clicks inside the sheet content from bubbling up and triggering onClose */}
        <Pressable style={styles.sheet} pointerEvents="auto">
          <SafeAreaView style={styles.safeArea}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Sort & Filter</Text>

              <View style={styles.headerActions}>
                {/* 4. Kept Apply button and cleanly removed the old X button container */}
                <TouchableOpacity onPress={handleApply}>
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CONTENT */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {renderSection(
                "Collections",
                collections.map((c) => ({
                  label: c.name,
                  value: c.id,
                })),
                collectionId,
                setCollectionId,
              )}

              {renderSection("Status", STATUS_OPTIONS, status, setStatus)}

              {renderSection("Sort by", SORT_OPTIONS, sort, setSort)}
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    height: "68%",
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 14,
    color: "#444",
  },
  activeChipText: {
    color: "white",
    fontWeight: "500",
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
