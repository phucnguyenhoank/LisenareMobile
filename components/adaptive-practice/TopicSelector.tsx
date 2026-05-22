import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { C } from "@/theme/grammar_constants";
import { Topic } from "@/types/grammar";

interface Props {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  starting: boolean;
  onStart: (topicIds: number[]) => void;
  onRetry: () => void;
}

export function TopicSelector({
  topics,
  loading,
  error,
  starting,
  onStart,
  onRetry,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.softText}>Đang tải chủ đề...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={styles.softText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === topics.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(topics.map((t) => t.id)));
    }
  };

  const allSelected = selected.size === topics.length && topics.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.intro}>
        <Text style={styles.title}>Chọn chủ đề luyện tập</Text>
        <Text style={styles.sub}>
          Câu hỏi được chọn tự động theo trình độ (theta) của bạn dựa trên các
          chủ đề bên dưới.
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Text style={styles.count}>
          Đã chọn {selected.size}/{topics.length}
        </Text>
        <TouchableOpacity onPress={toggleAll} disabled={topics.length === 0}>
          <Text style={styles.linkText}>
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isOn = selected.has(item.id);
          const exerciseCount = item.lessons.reduce(
            (s, l) => s + l.exercises.length,
            0,
          );
          return (
            <TouchableOpacity
              onPress={() => toggle(item.id)}
              style={[styles.card, isOn && styles.cardOn]}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                {isOn && <Text style={styles.check}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subline}>
                  {item.lessons.length} bài học • {exerciseCount} bài tập
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.softText}>Chưa có chủ đề nào</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            (selected.size === 0 || starting) && { opacity: 0.5 },
          ]}
          disabled={selected.size === 0 || starting}
          onPress={() => onStart(Array.from(selected))}
          activeOpacity={0.8}
        >
          {starting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>Bắt đầu luyện tập</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 24,
  },
  softText: { color: C.textSoft, fontSize: 14 },
  intro: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  sub: { fontSize: 13, color: C.textSoft, lineHeight: 18 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  count: { fontSize: 13, color: C.textMid, fontWeight: "600" },
  linkText: { fontSize: 13, color: C.primary, fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardOn: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  check: { color: "#fff", fontSize: 14, fontWeight: "700" },
  name: { fontSize: 14, fontWeight: "600", color: C.text },
  subline: { fontSize: 12, color: C.textSoft, marginTop: 2 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.white,
  },
  startBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  startBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  retryBtn: {
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  retryBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
