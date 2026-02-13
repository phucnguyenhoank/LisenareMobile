import colors from "@/theme/colors";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  style?: ViewStyle;
};

export default function NextButton({ onPress, style }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          style,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}
      >
        <Feather name="check" size={28} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 8,
  },

  button: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
