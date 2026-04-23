import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Topic } from "../../types/grammar";

interface Props {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  onSelect: (t: Topic) => void;
  onRetry: () => void;
}

export function TopicListScreen({ topics, loading, error, onSelect, onRetry }: Props) {
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
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={S.softText}>{error}</Text>
        <TouchableOpacity style={S.btn} onPress={onRetry}>
          <Text style={S.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={S.fill}>
      <View style={[S.header, { paddingVertical: 16 }]}>
        <View>
          {/* <Text style={[S.headerTitle, { fontSize: 20 }]}>Ngữ pháp</Text> */}
          <Text style={S.headerSub}>{topics.length} chuyên đề</Text>
        </View>
      </View>
      <FlatList
        data={topics}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={S.topicCard}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
          >
            <View style={S.topicIndex}>
              <Text style={S.topicIndexText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.topicName}>{item.name}</Text>
              <Text style={S.topicSub}>
                {item.lessons.length} bài học •{" "}
                {item.lessons.reduce((s, l) => s + l.exercises.length, 0)} bài tập
              </Text>
            </View>
            <Text style={{ color: C.textLight, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}