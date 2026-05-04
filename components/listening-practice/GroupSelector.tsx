import colors from "@/theme/colors";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  groups: string[];
  isLoadingGroups: boolean;
  selectedGroups: string[];
  isAllSelected: boolean;
  onGroupChange: (isAll: boolean, newSelected: string[]) => void;
};
export default function GroupSelector({
  groups,
  isLoadingGroups,
  selectedGroups,
  isAllSelected,
  onGroupChange,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Groups</Text>

      {isLoadingGroups ? (
        <ActivityIndicator style={{ marginTop: 10 }} />
      ) : (
        <FlatList
          data={["All", ...groups]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.groupContainer}
          renderItem={({ item }) => {
            const isAll = item === "All";
            const active = isAllSelected
              ? isAll
              : selectedGroups.includes(item);

            return (
              <Pressable
                style={[styles.groupChip, active && styles.groupChipActive]}
                onPress={() => {
                  if (isAll) {
                    onGroupChange(true, []);
                  } else {
                    const newSelected = selectedGroups.includes(item)
                      ? selectedGroups.filter((g) => g !== item) // remove clicked item
                      : [...selectedGroups, item]; // add clicked item
                    onGroupChange(false, newSelected);
                  }
                }}
              >
                <Text
                  style={[styles.groupText, active && styles.groupTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  groupContainer: {
    gap: 10,
    paddingRight: 6,
  },
  groupChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#f2f2f2",
  },
  groupChipActive: {
    backgroundColor: colors.secondary,
  },
  groupText: {
    fontSize: 13,
    color: "#333",
  },
  groupTextActive: {
    color: "white",
    fontWeight: "600",
  },
});
