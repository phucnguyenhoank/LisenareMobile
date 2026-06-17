import Feather from "@expo/vector-icons/Feather";
import { FlatList, Pressable, Text, View } from "react-native";
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
        <Pressable onPress={onBack} style={S.backBtn}>
          <Feather name="arrow-left" size={20} color={C.textMid} />
        </Pressable>
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
          <Pressable
            style={S.listCard}
            onPress={() => onSelect(item)}
            android_ripple={{ color: C.primaryLight }}
          >
            <View style={S.listIcon}>
              <Feather name="book-open" size={18} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.listCardText}>{item.name}</Text>
              <Text style={S.listCardSub}>{item.exercises.length} bài tập</Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.textLight} />
          </Pressable>
        )}
      />
    </View>
  );
}
