import { request } from "@/api/client";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { GroupPicker } from "@/components/GroupPicker";
import { PagePicker } from "@/components/PagePicker";
import { CollectionRow } from "@/components/practice-bricks/CollectionRow";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import type { Collection, GroupStats } from "@/types/collection";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

const LIMIT = 20;

export default function PracticeScreen() {
  const { token, isTokenLoading } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data: stats = [] } = useQuery<GroupStats[]>({
    queryKey: ["groupStats"],
    queryFn: () => request<GroupStats[]>("/collections/stats"),
    enabled: !!token,
  });

  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!selectedGroupName && stats.length > 0) {
      setSelectedGroupName(stats[0].group_name);
    }
  }, [stats]);

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["collections", selectedGroupName, currentPage],
    queryFn: () =>
      request<Collection[]>(
        `/collections?page=${currentPage}&limit=${LIMIT}&group_name=${encodeURIComponent(selectedGroupName!)}`,
      ),
    enabled: !!selectedGroupName && !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const totalPages = useMemo(() => {
    const count =
      stats.find((g) => g.group_name === selectedGroupName)?.collection_count ||
      0;
    return Math.ceil(count / LIMIT) || 1;
  }, [stats, selectedGroupName]);

  const handleGroupNameChange = (groupName: string) => {
    setSelectedGroupName(groupName);
    setCurrentPage(1);
  };

  const handleCreateCollection = async (data: {
    name: string;
    group_name: string;
  }) => {
    try {
      await request<Collection>("/collections", {
        method: "POST",
        body: data,
      });

      setIsModalVisible(false);
    } catch (err) {
      console.error("Failed to create collections", err);
    }
  };

  // If stats are still loading or we haven't picked a group yet
  if (isTokenLoading || !stats.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>Đang tải bộ sưu tập của bạn...</Text>
      </View>
    );
  }

  // Not authenticated
  if (!token) {
    return (
      <View style={styles.centered}>
        <Link href="/setting" style={styles.signinLink}>
          Đăng nhập
        </Link>
        <Text>để xem bộ sưu tập</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <GroupPicker
          selectedGroup={selectedGroupName!}
          stats={stats}
          onGroupChange={handleGroupNameChange}
        />
        <PagePicker
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </View>

      <FlatList
        data={collections ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CollectionRow item={item} />}
      />

      <FloatingActionMenu onCreateCollection={() => setIsModalVisible(true)} />

      <CreateCollectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateCollection}
      />
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signinLink: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "blue",
  },
});
