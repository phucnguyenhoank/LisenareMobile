import colors from "@/theme/colors";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FloatingActionMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.fabContainer}>
      {isOpen && (
        <View style={styles.menuItems}>
          <TouchableOpacity
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/add-brick");
            }}
          >
            <MaterialCommunityIcons
              name="toy-brick-plus-outline"
              size={28}
              color="white"
            />
            <Text style={styles.miniFabText}>Thêm câu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/chat-topics");
            }}
          >
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={28}
              color="white"
            />
            <Text style={styles.miniFabText}>Tutor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/listening-practice");
            }}
          >
            <Feather name="headphones" size={28} color="white" />
            <Text style={styles.miniFabText}>Luyện nghe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/practice");
            }}
          >
            <MaterialIcons name="fitness-center" size={28} color="white" />
            <Text style={styles.miniFabText}>Luyện nói câu</Text>
          </TouchableOpacity>
        </View>
      )}

      <Pressable style={styles.fab} onPress={() => setIsOpen((prev) => !prev)}>
        <AntDesign name={isOpen ? "close" : "plus"} size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 32,
    bottom: 32,
    alignItems: "flex-end",
  },
  menuItems: {
    marginBottom: 10,
    alignItems: "flex-end",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",

    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  miniFabWithLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginBottom: 12,
    gap: 8,
  },

  miniFabText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
