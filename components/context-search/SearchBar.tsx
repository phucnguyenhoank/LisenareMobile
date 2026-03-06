import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Props = {
  query: string;
  setQuery: (text: string) => void;
  onSearch: () => void;
  loading: boolean;
};

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  loading,
}: Props) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.input}
        placeholder="jump off..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={onSearch}
        disabled={loading || !query.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="search-sharp" size={24} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    padding: spacing.sm,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
  },

  button: {
    marginLeft: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
