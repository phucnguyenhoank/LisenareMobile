import colors from "@/theme/colors";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onCreateCollection: () => void;
};

export default function FloatingActionMenu({ onCreateCollection }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.fabContainer}>
      {isOpen && (
        <View style={styles.menuItems}>
          <Pressable
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/add-brick");
            }}
          >
            <MaterialCommunityIcons
              name="toy-brick-plus-outline"
              size={24}
              color="white"
            />
            <Text style={styles.miniFabText}>Thêm câu</Text>
          </Pressable>

          <Pressable
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              onCreateCollection();
            }}
          >
            <MaterialCommunityIcons
              name="folder-plus-outline"
              size={24}
              color="white"
            />
            <Text style={styles.miniFabText}>Thêm bộ sưu tập</Text>
          </Pressable>

          <Pressable
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/chat-topics");
            }}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="white" />
            <Text style={styles.miniFabText}>Trò chuyện</Text>
          </Pressable>

          <Pressable
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/search");
            }}
          >
            <Ionicons name="search-sharp" size={24} color="white" />
            <Text style={styles.miniFabText}>Tìm kiếm</Text>
          </Pressable>

          <Pressable
            style={styles.miniFabWithLabel}
            onPress={() => {
              setIsOpen(false);
              router.push("/practice");
            }}
          >
            <MaterialIcons name="fitness-center" size={24} color="white" />
            <Text style={styles.miniFabText}>Luyện nói</Text>
          </Pressable>
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
    //
    position: "absolute",
    right: 30,
    bottom: 30,
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
