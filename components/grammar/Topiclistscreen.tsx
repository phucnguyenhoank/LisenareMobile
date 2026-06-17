import Feather from "@expo/vector-icons/Feather";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Topic } from "../../types/grammar";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

interface Props {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  onSelect: (t: Topic) => void;
  onRetry: () => void;
  /** Khi true, render danh sách trong View thay vì FlatList (dùng khi đã nằm trong ScrollView) */
  inScrollView?: boolean;
}

const TOPIC_ICONS: FeatherIconName[] = [
  "clock",
  "zap",
  "edit",
  "search",
  "link",
  "message-square",
  "filter",
  "layers",
  "star",
  "book",
];

function getTopicIcon(index: number): FeatherIconName {
  return TOPIC_ICONS[index % TOPIC_ICONS.length];
}

function getTopicProgress(_topic: Topic, index: number): number {
  // Placeholder: trả về progress mẫu dựa theo index
  // TODO: thay bằng dữ liệu thực từ API khi có
  const samples = [80, 40, 30, 10, 0, 0, 0, 0, 0, 0];
  return samples[index] ?? 0;
}

interface TopicCardProps {
  topic: Topic;
  index: number;
  onPress: () => void;
}

function TopicCard({ topic, index, onPress }: TopicCardProps) {
  const progress = getTopicProgress(topic, index);
  const exerciseCount = topic.lessons.reduce((s, l) => s + l.exercises.length, 0);
  const isBookmarked = index === 0;

  return (
    <Pressable style={ls.card} onPress={onPress} android_ripple={{ color: C.primaryLight }}>
      {/* Bookmark badge */}
      {isBookmarked && (
        <View style={ls.bookmarkBadge}>
          <Feather name="bookmark" size={14} color="#fff" />
        </View>
      )}

      {/* Left: index number */}
      <View style={ls.indexBadge}>
        <Text style={ls.indexText}>{index + 1}</Text>
      </View>

      {/* Icon circle */}
      <View style={ls.iconCircle}>
        <Feather name={getTopicIcon(index)} size={22} color={C.primary} />
      </View>

      {/* Content */}
      <View style={ls.content}>
        <Text style={ls.topicName} numberOfLines={2}>{topic.name}</Text>

        {/* Progress bar */}
        <View style={ls.progressRow}>
          <View style={ls.progressTrack}>
            <View style={[ls.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={ls.progressText}>{progress}%</Text>
        </View>

        {/* Sub info */}
        <Text style={ls.subText}>
          {topic.lessons.length} bài học{"  •  "}{exerciseCount} bài tập
        </Text>
      </View>

      {/* Arrow */}
      <View style={ls.arrowBtn}>
        <Feather name="chevron-right" size={16} color={C.primary} />
      </View>
    </Pressable>
  );
}

export function TopicListScreen({ topics, loading, error, onSelect, onRetry, inScrollView }: Props) {
  if (loading) {
    return (
      <View style={[S.fill, S.center]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={[S.softText, { marginTop: 12 }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[S.fill, S.center]}>
        <Feather name="alert-triangle" size={36} color={C.error} />
        <Text style={S.softText}>{error}</Text>
        <Pressable style={S.btn} onPress={onRetry} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
          <Text style={S.btnText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  if (inScrollView) {
    return (
      <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}>
        {topics.map((item, index) => (
          <TopicCard
            key={String(item.id)}
            topic={item}
            index={index}
            onPress={() => onSelect(item)}
          />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={topics}
      keyExtractor={(t) => String(t.id)}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
      renderItem={({ item, index }) => (
        <TopicCard
          topic={item}
          index={index}
          onPress={() => onSelect(item)}
        />
      )}
    />
  );
}

const ls = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
    position: "relative",
    overflow: "hidden",
  },
  bookmarkBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#F59E0B",
    width: 28,
    height: 28,
    borderBottomLeftRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topicName: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    lineHeight: 20,
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
  subText: {
    fontSize: 12,
    color: C.textSoft,
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
