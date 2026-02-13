import colors from "@/theme/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  style?: ViewStyle;
};

export default function PlaySoundButton({ onPress, style }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.circle,
          style,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}
      >
        <AntDesign name="sound" size={28} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 8,
  },

  circle: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary2,
    justifyContent: "center",
    alignItems: "center",
  },
});
