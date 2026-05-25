import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import colors from "@/theme/colors";
import { BrickLessonRead } from "@/types/brick";

type Props = {
  lesson: BrickLessonRead;
  onPress: () => void;
};

export default function LessonRowItem({ lesson, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconWrapper}>
          <Ionicons name="library-outline" size={24} color={colors.primary} />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Bài học {lesson.lesson_id}</Text>

          <Text style={styles.subtitle}>{lesson.brick_count} bricks</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={22} color={colors.secondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 84,
    paddingHorizontal: 18,
    paddingVertical: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  pressed: {
    opacity: 0.7,
  },

  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: `${colors.primary}15`,
  },

  textSection: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.secondary,
  },
});
