import colors from "@/theme/colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  target_text: string;
  native_text: string;
  showTarget: boolean;
  setShowTarget: (v: boolean) => void;
  showNative: boolean;
  setShowNative: (v: boolean) => void;
};

export function BrickDisplay({
  target_text,
  native_text,
  showTarget,
  setShowTarget,
  showNative,
  setShowNative,
}: Props) {
  const isTargetVisible = showTarget;

  return (
    <>
      {/* TARGET TEXT */}
      <Pressable onPress={() => setShowTarget(!showTarget)}>
        <Text style={[styles.target_text, { color: colors.secondary2 }]}>
          {showTarget ? (
            target_text
          ) : (
            <FontAwesome name="eye" size={24} color={colors.secondary2} />
          )}
        </Text>
      </Pressable>

      {/* NATIVE TEXT */}
      <Pressable onPress={() => setShowNative(!showNative)}>
        <Text
          style={[
            styles.native_text,
            isTargetVisible
              ? styles.native_secondary // when target is visible
              : styles.native_primary, // when target is hidden
          ]}
        >
          {showNative ? (
            native_text
          ) : (
            <FontAwesome name="eye" size={24} color="black" />
          )}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  target_text: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },

  native_text: {
    textAlign: "center",
  },

  // When target is shown → native is secondary
  native_secondary: {
    fontSize: 16,
    fontWeight: "normal",
    opacity: 0.7,
  },

  // When target is hidden → native becomes primary
  native_primary: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
