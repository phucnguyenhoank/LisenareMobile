import { Collection } from "@/types/collection";
import { Picker } from "@react-native-picker/picker";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface CollectionPickerProps {
  selectedCollectionId: number | null;
  pendingCollections: Collection[];
  onCollectionChange: (collectionId: number) => void;
}

export const CollectionPicker = ({
  selectedCollectionId,
  pendingCollections,
  onCollectionChange,
}: CollectionPickerProps) => {
  return (
    <View style={styles.wrapper}>
      <Picker
        selectedValue={selectedCollectionId}
        onValueChange={(itemValue) => onCollectionChange(Number(itemValue))}
      >
        {pendingCollections.map((collection) => {
          return (
            <Picker.Item
              key={collection.id}
              label={`${collection.name} ${collection.brick_count}`}
              value={collection.id}
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
