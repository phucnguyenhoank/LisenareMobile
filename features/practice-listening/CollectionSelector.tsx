import colors from "@/theme/colors";
import { Collection } from "@/types/collection";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Define a unified structural type for the horizontal list items
type SelectorItem =
  | { type: "all"; name: "All"; id: -1 }
  | { type: "collection"; name: string; id: number };

type Props = {
  collections: Collection[];
  isLoadingCollections: boolean;
  selectedCollectionIds: number[];
  isAllSelected: boolean;
  onCollectionChange: (isAll: boolean, newSelectedIds: number[]) => void;
};

export default function CollectionSelector({
  collections,
  isLoadingCollections,
  selectedCollectionIds,
  isAllSelected,
  onCollectionChange,
}: Props) {
  // Transform data source to preserve underlying database IDs alongside display names
  const listData: SelectorItem[] = [
    { type: "all", name: "All", id: -1 },
    ...collections.map((c) => ({
      type: "collection" as const,
      name: c.name,
      id: c.id,
    })),
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Collections</Text>

      {isLoadingCollections ? (
        <ActivityIndicator color={colors.secondary} style={{ marginTop: 10 }} />
      ) : (
        <FlatList
          data={listData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) =>
            item.type === "all" ? "all" : item.id.toString()
          }
          contentContainerStyle={styles.groupContainer}
          renderItem={({ item }) => {
            const isAllItem = item.type === "all";

            // Calculate active state strictly based on props configuration
            const active = isAllSelected
              ? isAllItem
              : !isAllItem && selectedCollectionIds.includes(item.id);

            return (
              <Pressable
                style={[styles.groupChip, active && styles.groupChipActive]}
                onPress={() => {
                  if (isAllItem) {
                    // Clicking "All" resets specific selections
                    onCollectionChange(true, []);
                  } else {
                    // Update layout array utilizing tracking IDs rather than names
                    const isCurrentlySelected = selectedCollectionIds.includes(
                      item.id,
                    );
                    const newSelected = isCurrentlySelected
                      ? selectedCollectionIds.filter((id) => id !== item.id)
                      : [...selectedCollectionIds, item.id];

                    // If everything gets unselected manually, fallback automatically to 'All'
                    const nextIsAll = newSelected.length === 0;
                    onCollectionChange(nextIsAll, nextIsAll ? [] : newSelected);
                  }
                }}
              >
                <Text
                  style={[styles.groupText, active && styles.groupTextActive]}
                >
                  {item.name}
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
    color: colors.text,
    marginBottom: 10,
  },
  groupContainer: {
    gap: 10,
    paddingHorizontal: 4,
  },
  groupChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: "transparent",
  },
  groupChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary2,
  },
  groupText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
  },
  groupTextActive: {
    color: "white",
    fontWeight: "600",
  },
});
