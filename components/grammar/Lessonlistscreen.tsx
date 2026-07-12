import Feather from "@expo/vector-icons/Feather";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../theme/grammar_constants";
import { Lesson, Topic } from "../../types/grammar";

interface Props {
  topic: Topic;
  onSelect: (l: Lesson) => void;
  onBack: () => void;
}

export function LessonListScreen({ topic, onSelect, onBack }: Props) {
  return (
    <View style={ls.fill}>
      <View style={ls.header}>
        <Text style={ls.headerTitle}>{topic.name}</Text>
        <Text style={ls.headerSub}>Chọn dạng bài tập</Text>
      </View>

      <FlatList
        data={topic.lessons}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable
            style={ls.card}
            onPress={() => onSelect(item)}
            android_ripple={{ color: C.primaryLight }}
          >
            <View style={ls.cardIcon}>
              <Feather name="edit-3" size={22} color={C.primary} />
            </View>
            <View style={ls.cardContent}>
              <Text style={ls.cardTitle} numberOfLines={2}>{item.name}</Text>
              <View style={ls.progressRow}>
                <View style={ls.progressTrack}>
                  <View
                    style={[ls.progressFill, { width: `${item.progress_percent ?? 0}%` }]}
                  />
                </View>
                <Text style={ls.progressText}>{item.progress_percent ?? 0}%</Text>
              </View>
              <Text style={ls.cardSub}>{item.exercises.length} bài tập</Text>
            </View>
            <View style={ls.cardArrow}>
              <Feather name="arrow-right" size={16} color={C.white} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const ls = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#F7FAF4" },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#F7FAF4",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 6,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    lineHeight: 30,
  },
  headerSub: {
    fontSize: 14,
    color: C.textSoft,
    marginTop: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    lineHeight: 20,
  },
  cardSub: {
    fontSize: 12,
    color: C.textSoft,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: C.progressBg,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSoft,
    minWidth: 32,
    textAlign: "right",
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
