import {
  BrickSort,
  BrickStatusFilter,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "@/constants/bricks";
import colors from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { Collection } from "@/types/collection";

interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;

  collections: Collection[];

  selectedCollectionId: number;
  selectedStatus: BrickStatusFilter;
  selectedSort: BrickSort;

  onCollectionChange: (collectionId: number) => void;
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
}: FilterSortModalProps) {
  const [tempCollectionId, setTempCollectionId] =
    useState<number>(selectedCollectionId);

  const [tempStatus, setTempStatus] =
    useState<BrickStatusFilter>(selectedStatus);

  const [tempSort, setTempSort] = useState<BrickSort>(selectedSort);

  useEffect(() => {
    if (visible) {
      setTempCollectionId(selectedCollectionId);
      setTempStatus(selectedStatus);
      setTempSort(selectedSort);
    }
  }, [visible, selectedCollectionId, selectedStatus, selectedSort]);

  const handleApply = () => {
    onCollectionChange(tempCollectionId);
    onStatusChange(tempStatus);
    onSortChange(tempSort);

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <SafeAreaView>
            <View style={styles.header}>
              <Text style={styles.title}>Lọc và sắp xếp</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.content}
            >
              {/* COLLECTION */}
              <Text style={styles.sectionTitle}>Bộ sưu tập</Text>

              <View style={styles.chipGrid}>
                {collections.map((collection) => (
                  <TouchableOpacity
                    key={collection.id}
                    onPress={() => setTempCollectionId(collection.id)}
                    style={[
                      styles.chip,
                      tempCollectionId === collection.id && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempCollectionId === collection.id &&
                          styles.activeChipText,
                      ]}
                    >
                      {collection.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* STATUS */}
              <Text style={styles.sectionTitle}>Trạng thái</Text>

              <View style={styles.chipGrid}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => setTempStatus(option.value)}
                    style={[
                      styles.chip,
                      tempStatus === option.value && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempStatus === option.value && styles.activeChipText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* SORT */}
              <Text style={styles.sectionTitle}>Sắp xếp</Text>

              <View style={styles.chipGrid}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setTempSort(option.value)}
                    style={[
                      styles.chip,
                      tempSort === option.value && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempSort === option.value && styles.activeChipText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Button
              onPress={handleApply}
              title="Áp dụng"
              style={styles.applyButton}
            />
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
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
    borderColor: "#eee",
  },
  activeChip: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    color: "#444",
    fontSize: 14,
  },
  activeChipText: {
    color: "white",
    fontWeight: "500",
  },
  applyButton: {
    marginTop: 20,
    alignSelf: "auto",
  },
});
