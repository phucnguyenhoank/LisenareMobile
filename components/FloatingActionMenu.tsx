import colors from "@/theme/colors";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // 1. Container dynamically becomes full-screen only when isOpen is true
    <View
      style={[styles.fabContainer, isOpen && styles.fullScreenContainer]}
      pointerEvents="box-none"
    >
      {/* 2. Full-screen grey overlay button that triggers close on tap */}
      {isOpen && (
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <View style={styles.menuItems}>
          <TouchableOpacity
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/chat-tutor");
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
              router.push("/explain-word");
            }}
          >
            <MaterialCommunityIcons
              name="notebook-outline"
              size={28}
              color="white"
            />
            <Text style={styles.miniFabText}>Look Up</Text>
          </TouchableOpacity>

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
            <Text style={styles.miniFabText}>Add Brick</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/practice-listening");
            }}
          >
            <Feather name="headphones" size={28} color="white" />
            <Text style={styles.miniFabText}>Listening</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/practice-speaking");
            }}
          >
            <Ionicons name="barbell-outline" size={28} color="white" />
            <Text style={styles.miniFabText}>Speaking</Text>
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
    zIndex: 99,
  },
  // 3. Expands the main layout to full window space when opened
  fullScreenContainer: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    paddingRight: 32,
    paddingBottom: 32,
  },
  // 4. Styles the background overlay layer
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuItems: {
    marginBottom: 10,
    alignItems: "flex-end",
    zIndex: 100, // Keeps options floating on top of the overlay background
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100, // Keeps the main switch button accessible

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
