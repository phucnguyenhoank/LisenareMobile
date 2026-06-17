import Feather from "@expo/vector-icons/Feather";
import { FlatList, Pressable, Text, View } from "react-native";
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
        <Pressable onPress={onBack} style={S.backBtn}>
          <Feather name="arrow-left" size={20} color={C.textMid} />
        </Pressable>
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
          <Pressable
            style={S.listCard}
            onPress={() => onSelect(item)}
            android_ripple={{ color: C.primaryLight }}
          >
            <View style={S.listIcon}>
              <Feather name="edit-3" size={18} color={C.primary} />
            </View>
            <Text style={S.listCardText}>{item.name}</Text>
            <Feather name="chevron-right" size={20} color={C.textLight} />
          </Pressable>
        )}
      />
    </View>
  );
}
