import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { Snippet } from "@/types/snippet";

export default function FeedHeader({
  creator,
  created_at,
}: {
  creator: Snippet["creator"];
  created_at?: string;
}) {
  return (
    <View style={styles.header}>
      <Image
        source={{
          uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${creator.full_name}`,
        }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.author}>{creator.full_name}</Text>
        <Text style={styles.timestamp}>
          {created_at
            ? formatDistanceToNow(
                new Date(created_at.replace(" ", "T") + "Z"),
                { addSuffix: true },
              )
            : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#ddd",
  },

  author: {
    fontWeight: "600",
    fontSize: 14,
  },

  timestamp: {
    fontSize: 12,
    color: "#888",
  },
});
