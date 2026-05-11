import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/client";

type Props = {
  fullName: string;
};

export default function EditableName({ fullName }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(fullName);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newName: string) =>
      request("/learners/me", {
        method: "PATCH",
        body: { full_name: newName },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    if (!value.trim()) return;
    mutation.mutate(value.trim());
  };

  const handleCancel = () => {
    setValue(fullName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={styles.row}>
        <TextInput value={value} onChangeText={setValue} style={styles.input} />

        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark" size={22} color="green" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="close" size={22} color="red" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.name}>Hello, {fullName}</Text>

      <TouchableOpacity onPress={() => setIsEditing(true)}>
        <Feather name="edit-3" size={24} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 8,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
  },

  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    fontSize: 18,
    paddingVertical: 4,
    minWidth: 160,
  },

  icon: {
    color: "#666",
  },
});
