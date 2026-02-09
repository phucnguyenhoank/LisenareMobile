import colors from "@/theme/colors";
import type { Brick } from "@/types/brick";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  brick: Brick;
  showTarget: boolean;
  setShowTarget: (v: boolean) => void;
  showNative: boolean;
  setShowNative: (v: boolean) => void;
};

export function BrickDisplay({
  brick,
  showTarget,
  setShowTarget,
  showNative,
  setShowNative,
}: Props) {
  return (
    <>
      <Pressable onPress={() => setShowTarget(!showTarget)}>
        <Text style={{ ...styles.text, color: colors.secondary2 }}>
          {showTarget ? (
            brick.target_text
          ) : (
            <FontAwesome name="eye" size={24} color={colors.secondary2} />
          )}
        </Text>
      </Pressable>

      <Pressable onPress={() => setShowNative(!showNative)}>
        <Text style={styles.text}>
          {showNative ? (
            brick.native_text
          ) : (
            <FontAwesome name="eye" size={24} color="black" />
          )}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    textAlign: "center",
  },
});
