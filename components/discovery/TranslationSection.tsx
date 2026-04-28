import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { request } from "@/api/client";
import { SentenceTranslateResponse } from "@/types/sentence";
import { Snippet } from "@/types/snippet";
import { useQuery } from "@tanstack/react-query";

export default function TranslationSection({ item }: { item: Snippet }) {
  const [show, setShow] = useState(false);

  const { data: fetchedTranslation, isLoading } = useQuery({
    queryKey: ["translation", item.content],
    queryFn: async () => {
      const res = await request<SentenceTranslateResponse>(
        "/text/translations",
        {
          method: "POST",
          body: { text: item.content },
        },
      );
      return res.text;
    },
    enabled: show && !item.translation,
    staleTime: 1000 * 60 * 60,
  });

  const displayTranslation = item.translation || fetchedTranslation;

  return (
    <>
      <TouchableOpacity
        onPress={() => setShow(!show)}
        style={styles.translationToggle}
      >
        <Text style={styles.translationToggleText}>
          {show ? "Hide translation" : "Show translation"}
        </Text>
      </TouchableOpacity>

      {show && (
        <View style={styles.translationBox}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.translationText}>{displayTranslation}</Text>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  translationToggle: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },

  translationToggleText: {
    fontSize: 13,
    color: "#888",
  },

  translationBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },

  translationText: {
    fontSize: 14,
    color: "#444",
  },
});
