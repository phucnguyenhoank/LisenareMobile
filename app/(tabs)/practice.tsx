import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import TextButton from "@/components/TextButton";

import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, useRouter } from "expo-router";

import { apiCall } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import type { Collection } from "@/types/collection";

export default function PracticeScreen() {
  const { token, isLoading } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const router = useRouter();

  const fetchCollections = async () => {
    try {
      const data = await apiCall<Collection[]>("/collections");
      setCollections(data);
    } catch (err) {
      console.error("Failed to fetch collections", err);
    }
  };

  const handleCreate = async () => {
    try {
      const data = await apiCall<Collection>("/collections", {
        method: "POST",
        body: {
          name: newCollectionName,
        },
      });
      setIsModalVisible(false);
      fetchCollections();
    } catch (err) {
      console.error("Failed to create collections", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCollections();
    }
  }, [token]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Not authenticated
  if (!token) {
    return (
      <View style={styles.centered}>
        <Text>Please login to view collections</Text>
        <Link href="/profile" style={styles.loginLink}>
          Go to Login Screen
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={{
              pathname: "/learn",
              params: { collection_id: collection.id },
            }}
            asChild
          >
            <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
              <View style={styles.left}>
                <Text style={styles.listItemText} numberOfLines={1}>
                  {collection.brick_count} | {collection.name}
                </Text>
              </View>

              <Entypo name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {isFabOpen && (
          <View style={styles.menuItems}>
            <Pressable
              style={styles.miniFab}
              onPress={() => {
                setIsFabOpen(false);
                router.push("/add-brick");
              }}
            >
              <MaterialCommunityIcons
                name="toy-brick-plus-outline"
                size={24}
                color="white"
              />
            </Pressable>

            <Pressable
              style={styles.miniFab}
              onPress={() => {
                setNewCollectionName(""); // Reset input
                setIsModalVisible(true);
                setIsFabOpen(false);
              }}
            >
              <MaterialCommunityIcons
                name="folder-plus-outline"
                size={24}
                color="white"
              />
            </Pressable>

            <Pressable
              style={styles.miniFab}
              onPress={() => {
                setIsFabOpen(false);
                router.push("/search");
              }}
            >
              <Ionicons name="search-sharp" size={24} color="white" />
            </Pressable>

            <Pressable
              style={styles.miniFab}
              onPress={() => {
                setIsFabOpen(false);
                router.push("/chat-topics");
              }}
            >
              <Ionicons name="chatbubbles-outline" size={24} color="white" />
            </Pressable>
          </View>
        )}

        <Pressable
          style={styles.fab}
          onPress={() => setIsFabOpen((prev) => !prev)}
        >
          <AntDesign
            name={isFabOpen ? "close" : "plus"}
            size={24}
            color="white"
          />
        </Pressable>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bộ sưu tập mới</Text>

            <TextInput
              style={styles.input}
              placeholder="Nhập tên bộ sưu tập"
              placeholderTextColor="#999"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus={true} // Automatically opens keyboard
            />

            <View style={styles.buttonContainer}>
              <TextButton
                title="Thoát"
                variant="outline"
                onPress={() => setIsModalVisible(false)}
              />

              <TextButton
                title="Tạo"
                variant="primary"
                onPress={handleCreate}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    padding: 12,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  left: {
    flex: 1,
    paddingRight: 8, // space before chevron
  },

  listItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  loginLink: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "blue",
  },

  fabContainer: {
    position: "absolute",
    right: 30,
    bottom: 30,
    alignItems: "center",
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

  menuItems: {
    marginBottom: 10,
    alignItems: "center",
  },

  miniFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,

    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",

    elevation: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Dims the background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});
