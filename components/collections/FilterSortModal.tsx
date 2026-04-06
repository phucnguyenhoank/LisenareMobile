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
  selectedGroup: string | null;
  onGroupChange: (groupName: string) => void;
  // Bạn có thể thêm onStatusChange hoặc onSortChange ở đây nếu cần sync lên cha
}

export default function FilterSortModal({
  visible,
  onClose,
  stats,
  selectedGroup,
  onGroupChange,
}: FilterSortModalProps) {
  const statuses = ["Tất cả", "Chưa học", "Đang học", "Hoàn thành"];
  const sortOptions = ["Đề xuất", "Mới thêm"];

  // State tạm thời để người dùng chọn thoải mái trước khi nhấn "Áp dụng"
  const [tempGroup, setTempGroup] = useState(selectedGroup);
  const [tempStatus, setTempStatus] = useState("Tất cả");
  const [tempSort, setTempSort] = useState("Đề xuất");

  // Đồng bộ lại state tạm thời mỗi khi modal mở ra
  useEffect(() => {
    if (visible) {
      setTempGroup(selectedGroup);
    }
  }, [visible, selectedGroup]);

  const handleApply = () => {
    if (tempGroup) {
      onGroupChange(tempGroup);
      // Ghi chú: Nếu có API lọc theo status/sort, hãy gọi ở đây
    }
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
              {/* PHẦN 1: BỘ SƯU TẬP */}
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

              {/* PHẦN 2: TRẠNG THÁI */}
              <Text style={styles.sectionTitle}>Trạng thái</Text>
              <View style={styles.chipGrid}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setTempStatus(s)}
                    style={[styles.chip, tempStatus === s && styles.activeChip]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempStatus === s && styles.activeChipText,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* PHẦN 3: SẮP XẾP */}
              <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
              <View style={styles.chipGrid}>
                {sortOptions.map((o) => (
                  <TouchableOpacity
                    key={o}
                    onPress={() => setTempSort(o)}
                    style={[styles.chip, tempSort === o && styles.activeChip]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempSort === o && styles.activeChipText,
                      ]}
                    >
                      {o}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 40 }} />
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
