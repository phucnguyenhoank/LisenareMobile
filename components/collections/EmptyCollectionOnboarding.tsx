import { request } from "@/api/client";
import colors from "@/theme/colors";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GROUP_NAMES = [
  "Vỡ lòng",
  "Sơ cấp",
  "Trung cấp",
  "Cao trung cấp",
  "Cao cấp",
  "Thành thạo",
];

interface Props {
  onSuccess: () => void;
}

export default function EmptyCollectionOnboarding({ onSuccess }: Props) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logic chọn tất cả
  const selectRecommended = () => {
    // Nếu đã chọn đủ rồi thì bỏ chọn hết, còn không thì chọn tất cả
    if (selectedGroups.length === GROUP_NAMES.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups([...GROUP_NAMES]);
    }
  };

  const toggleGroup = (name: string) => {
    setSelectedGroups((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleSave = async () => {
    if (selectedGroups.length === 0)
      return Alert.alert("Chọn ít nhất một nhóm bài học nha.");

    setIsSubmitting(true);
    try {
      await request("/collections/overrides", {
        method: "POST",
        body: { group_names: selectedGroups }, // Sending the strings directly
      });
      onSuccess();
    } catch (err) {
      Alert.alert("Lỗi lưu dữ liệu", "Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trình độ của bạn?</Text>
        <Text style={styles.subtitle}>
          Chọn các nhóm bài học bạn muốn bắt đầu nhé
        </Text>
      </View>

      {/* Nút Đề xuất (Select All) */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.recommendedBtn,
          selectedGroups.length === GROUP_NAMES.length &&
            styles.recommendedBtnActive,
        ]}
        onPress={selectRecommended}
      >
        <Text
          style={[
            styles.recommendedText,
            selectedGroups.length === GROUP_NAMES.length &&
              styles.recommendedTextActive,
          ]}
        >
          ✨ Đề xuất
        </Text>
      </TouchableOpacity>

      <View style={styles.chipContainer}>
        {GROUP_NAMES.map((name) => {
          const isSelected = selectedGroups.includes(name);
          return (
            <TouchableOpacity
              key={name}
              activeOpacity={0.7}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleGroup(name)}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          (selectedGroups.length === 0 || isSubmitting) &&
            styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={isSubmitting || selectedGroups.length === 0}
      >
        <Text style={styles.saveButtonText}>
          {isSubmitting ? "Đang lưu..." : "Bắt đầu học ngay"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary, // Đen
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  recommendedBtn: {
    // Trạng thái chưa chọn: Nền xám nhạt/viền border giống Chip
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  recommendedBtnActive: {
    // Khi được chọn: Giống hệt chipSelected (Xanh lá đậm nhất)
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  recommendedText: {
    // Chữ màu ghi đậm khi chưa chọn
    color: "#4B4B4B",
    fontWeight: "700",
    fontSize: 15,
  },
  recommendedTextActive: {
    // Chữ trắng khi được chọn
    color: "#fff",
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 40,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B4B4B",
  },
  chipTextSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: colors.primary, // Nút Save màu Đen theo đúng primary của bạn
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#CCC",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
