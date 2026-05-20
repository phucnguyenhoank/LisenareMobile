import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/theme/colors"; // Maps back to your forest theme colors

type FilterOption = { readonly value: string | null; readonly label: string };

type FilterBarProps = {
  selectedCollection: { name: string } | null;
  selectedStatus: string | null;
  selectedSort: string;
  STATUS_OPTIONS: readonly FilterOption[];
  SORT_OPTIONS: readonly FilterOption[];
  seIsFilterSortModelVisible: (visible: boolean) => void;
};

export default function BrickFilterBar({
  selectedCollection,
  selectedStatus,
  selectedSort,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  seIsFilterSortModelVisible,
}: FilterBarProps) {
  const activeStatus = STATUS_OPTIONS.find(
    (s) => s.value === selectedStatus,
  )?.label;
  const activeSort = SORT_OPTIONS.find((s) => s.value === selectedSort)?.label;

  return (
    <View style={styles.container}>
      {/* Main Action Trigger Button */}
      <TouchableOpacity
        style={styles.filterTriggerButton}
        onPress={() => seIsFilterSortModelVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="options-outline" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Side-Scrolling Selected Parameter Track */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollTrackContent}
        style={styles.horizontalScrollWrapper}
      >
        {selectedCollection?.name && (
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {selectedCollection.name}
            </Text>
          </View>
        )}

        {activeStatus && (
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {activeStatus}
            </Text>
          </View>
        )}

        {activeSort && (
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {activeSort}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginVertical: 10,
    gap: 12,
  },
  filterTriggerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 28,
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  horizontalScrollWrapper: {
    flex: 1,
  },
  scrollTrackContent: {
    alignItems: "center",
    gap: 6,
    paddingRight: 16,
  },
  chip: {
    backgroundColor: colors.buttonBackground,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
  },
});
