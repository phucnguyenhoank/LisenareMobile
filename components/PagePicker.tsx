import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PagePickerProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PagePicker = ({
  currentPage,
  totalPages,
  onPageChange,
}: PagePickerProps) => {
  const pages = Array.from(
    { length: Math.max(1, totalPages) },
    (_, i) => i + 1,
  );

  return (
    <View style={styles.wrapper}>
      <Picker
        selectedValue={currentPage}
        onValueChange={onPageChange}
        enabled={totalPages > 1}
      >
        {pages.map((p) => (
          <Picker.Item key={p} label={`Page ${p}`} value={p} />
        ))}
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
