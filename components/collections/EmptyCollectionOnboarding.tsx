import { request } from "@/api/client";
import colors from "@/theme/colors";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TextButton from "../TextButton";

const GROUPS = [
  "Vỡ lòng (A1)",
  "Sơ cấp (A2)",
  "Trung cấp (B1)",
  "Cao trung cấp (B2)",
  "Cao cấp (C1)",
  "Thành thạo (C2)",
];

interface Props {
  onSuccess: () => void;
}

export default function EmptyCollectionOnboarding({ onSuccess }: Props) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  };

  const handleSave = async () => {
    if (selectedGroups.length === 0) {
      Alert.alert("Chọn ít nhất một nhóm bài học nha.");
      return;
    }

    try {
      setIsSubmitting(true);

      await request("/collections/overrides", {
        method: "POST",
        body: {
          group_names: selectedGroups,
        },
      });

      onSuccess(); // refetch stats
    } catch (err) {
      Alert.alert("Failed to save selection", "/collections/overrides");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn bài học theo trình độ của bạn</Text>
      <Text style={styles.subtitle}>Bạn chưa có bài học nào</Text>

      <View style={styles.groupContainer}>
        {GROUPS.map((group) => {
          const isSelected = selectedGroups.includes(group);
          return (
            <TouchableOpacity
              key={group}
              style={[styles.groupButton, isSelected && styles.groupSelected]}
              onPress={() => toggleGroup(group)}
            >
              <Text
                style={[
                  styles.groupText,
                  isSelected && styles.groupTextSelected,
                ]}
              >
                {group}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextButton
        title={isSubmitting ? "Saving..." : "Save"}
        onPress={handleSave}
        disabled={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  groupContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  groupButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  groupSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  groupText: {
    fontWeight: "600",
  },
  groupTextSelected: {
    color: "white",
  },
});
