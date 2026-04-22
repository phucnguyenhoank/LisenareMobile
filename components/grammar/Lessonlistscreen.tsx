import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Lesson, Topic } from "../../types/grammar";

interface Props {
  topic: Topic;
  onSelect: (l: Lesson) => void;
  onBack: () => void;
}

export function LessonListScreen({ topic, onSelect, onBack }: Props) {
  return (
    <View style={S.fill}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={onBack}>
          <Text style={S.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle} numberOfLines={2}>
            {topic.name}
          </Text>
        </View>
      </View>
      <FlatList
        data={topic.lessons}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={S.listCard}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
          >
            <View style={S.listIcon}>
              <Text style={{ fontSize: 18 }}>📖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.listCardText}>{item.name}</Text>
              <Text style={S.listCardSub}>{item.exercises.length} bài tập</Text>
            </View>
            <Text style={{ color: C.textLight, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}