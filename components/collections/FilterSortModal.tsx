import { SORT_OPTIONS, STATUS_OPTIONS } from "@/constants/collections";
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

interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;
  stats: any[];
  selectedGroup: string;
  selectedStatus: string;
  selectedSort: string;
  onGroupChange: (groupName: string) => void;
  onStatusChange: (groupStatus: string) => void;
  onSortChange: (groupSort: string) => void;
}

export default function FilterSortModal({
  visible,
  onClose,
  stats,
  selectedGroup,
  selectedStatus,
  selectedSort,
  onGroupChange,
  onStatusChange,
  onSortChange,
}: FilterSortModalProps) {
  // Use technical values for state, NOT labels
  const [tempGroup, setTempGroup] = useState(selectedGroup);
  const [tempStatus, setTempStatus] = useState(selectedStatus);
  const [tempSort, setTempSort] = useState(selectedSort);

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      setTempGroup(selectedGroup);
      setTempStatus(selectedStatus);
      setTempSort(selectedSort);
    }
  }, [visible, selectedGroup, selectedStatus, selectedSort]);

  const handleApply = () => {
    onGroupChange(tempGroup);
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
              {/* PHẦN 1: NHÓM */}
              <Text style={styles.sectionTitle}>Nhóm</Text>
              <View style={styles.chipGrid}>
                {stats.map((item) => (
                  <TouchableOpacity
                    key={item.group_name}
                    onPress={() => setTempGroup(item.group_name)}
                    style={[
                      styles.chip,
                      tempGroup === item.group_name && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempGroup === item.group_name && styles.activeChipText,
                      ]}
                    >
                      {item.group_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* PHẦN 2: TRẠNG THÁI - Loop through STATUS_OPTIONS */}
              <Text style={styles.sectionTitle}>Trạng thái</Text>
              <View style={styles.chipGrid}>
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setTempStatus(opt.value)} // Set the value (all, not_started, etc.)
                    style={[
                      styles.chip,
                      tempStatus === opt.value && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempStatus === opt.value && styles.activeChipText,
                      ]}
                    >
                      {opt.label}{" "}
                      {/* Show the label (Tất cả, Chưa học, etc.) */}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* PHẦN 3: SẮP XẾP */}
              <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
              <View style={styles.chipGrid}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setTempSort(opt.value)}
                    style={[
                      styles.chip,
                      tempSort === opt.value && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempSort === opt.value && styles.activeChipText,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
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
    borderRadius: 20,
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
    backgroundColor: colors.secondary, // Thay bằng màu chính của bạn
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
