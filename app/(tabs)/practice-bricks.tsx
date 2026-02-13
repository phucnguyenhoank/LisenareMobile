import { apiCall } from "@/api/client";
import { CollectionRow } from "@/components/practice-bricks/CollectionRow";
import TextButton from "@/components/TextButton";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import type { Collection } from "@/types/collection";
import { MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PracticeScreen() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionGroupName, setNewCollectionGroupName] =
    useState("my group");
  const [selectedGroupName, setSelectedGroupName] = useState("my group");
  const groups = ["A1", "A2", "B1", "B2", "C1", "C2", "my group"];
  const [currentPage, setCurrentPage] = useState(1);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const handleGroupNameChange = (groupName: string) => {
    setSelectedGroupName(groupName);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchPage = async () => {
    setIsLoadingPage(true);
    try {
      const data = await apiCall<Collection[]>(
        `/collections?page=${currentPage}&limit=20&group_name=${encodeURIComponent(selectedGroupName)}`,
      );
      setCollections(data);
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleCreateNewGroup = async () => {
    try {
      const data = await apiCall<Collection>("/collections", {
        method: "POST",
        body: {
          name: newCollectionName,
          group_name: newCollectionGroupName,
        },
      });
      setIsModalVisible(false);
    } catch (err) {
      console.error("Failed to create collections", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPage();
  }, [token, selectedGroupName, currentPage]);

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
      <View style={styles.filterRow}>
        {/* Group picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedGroupName}
            onValueChange={handleGroupNameChange}
            mode="dropdown"
          >
            {groups.map((group) => (
              <Picker.Item key={group} label={group} value={group} />
            ))}
          </Picker>
        </View>

        {/* Page picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={currentPage}
            onValueChange={handlePageChange}
            mode="dropdown"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
              <Picker.Item key={page} label={`Page ${page}`} value={page} />
            ))}
          </Picker>
        </View>
      </View>

      <FlatList
        data={collections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CollectionRow item={item} />}
        ListEmptyComponent={
          isLoadingPage ? <ActivityIndicator /> : <Text>No data</Text>
        }
      />

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {isFabOpen && (
          <View style={styles.menuItems}>
            <Pressable
              style={styles.miniFabWithLabel}
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
              <Text style={styles.miniFabText}>Thêm câu</Text>
            </Pressable>

            <Pressable
              style={styles.miniFabWithLabel}
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
              <Text style={styles.miniFabText}>Thêm bộ sưu tập</Text>
            </Pressable>

            <Pressable
              style={styles.miniFabWithLabel}
              onPress={() => {
                setIsFabOpen(false);
                router.push("/chat-topics");
              }}
            >
              <Ionicons name="chatbubbles-outline" size={24} color="white" />
              <Text style={styles.miniFabText}>Chat</Text>
            </Pressable>

            <Pressable
              style={styles.miniFabWithLabel}
              onPress={() => {
                setIsFabOpen(false);
                router.push("/search");
              }}
            >
              <Ionicons name="search-sharp" size={24} color="white" />
              <Text style={styles.miniFabText}>Tìm kiếm</Text>
            </Pressable>

            <Pressable
              style={styles.miniFabWithLabel}
              onPress={() => {
                setIsFabOpen(false);
                router.push("/practice");
              }}
            >
              <MaterialIcons name="fitness-center" size={24} color="white" />
              <Text style={styles.miniFabText}>Luyện nói</Text>
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

            <TextInput
              style={styles.input}
              placeholder="Tùy chọn (my group)"
              placeholderTextColor="#999"
              value={newCollectionGroupName}
              onChangeText={setNewCollectionGroupName}
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
                onPress={handleCreateNewGroup}
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  pickerWrapper: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden", // IMPORTANT for Android
    backgroundColor: "#fafafa",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 12,
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
  menuItems: {
    marginBottom: 10,
    alignItems: "flex-end",
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
