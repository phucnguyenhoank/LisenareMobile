import type { GroupStats } from "@/types/collection";
import { Picker } from "@react-native-picker/picker";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface GroupPickerProps {
  selectedGroup: string;
  stats: GroupStats[];
  onGroupChange: (group: string) => void;
}

export const GroupPicker = ({
  selectedGroup,
  stats,
  onGroupChange,
}: GroupPickerProps) => {
  const allGroups = useMemo(() => {
    const statGroups = stats.map((s) => s.group_name);
    return Array.from(statGroups);
  }, [stats]);

  return (
    <View style={styles.wrapper}>
      <Picker selectedValue={selectedGroup} onValueChange={onGroupChange}>
        {allGroups.map((group) => {
          const count =
            stats.find((s) => s.group_name === group)?.collection_count || 0;
          return (
            <Picker.Item
              key={group}
              label={`${group} (${count})`}
              value={group}
            />
          );
        })}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginHorizontal: 4,
  },
});
