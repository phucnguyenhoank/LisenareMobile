import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Exercise, Lesson } from "../../types/grammar";

interface Props {
  lesson: Lesson;
  onSelect: (e: Exercise) => void;
  onBack: () => void;
}

export function ExerciseListScreen({ lesson, onSelect, onBack }: Props) {
  return (
    <View style={S.fill}>

      <View style={S.header}>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle} numberOfLines={2}>
            {lesson.name}
          </Text>
        </View>
      </View>
      <FlatList
        data={lesson.exercises}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={S.listCard}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
          >
            <View style={S.listIcon}>
              <Text style={{ fontSize: 18 }}>📝</Text>
            </View>
            <Text style={S.listCardText}>{item.name}</Text>
            <Text style={{ color: C.textLight, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}