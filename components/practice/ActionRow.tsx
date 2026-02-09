import PlaySoundButton from "@/components/PlaySoundButton";
import NextButton from "@/components/practice/NextButton";
import { StyleSheet, View } from "react-native";

type Props = {
  playSound: () => void;
  next: () => void;
};

export function ActionRow({ playSound, next }: Props) {
  return (
    <View style={styles.actionRow}>
      <PlaySoundButton onPress={playSound} />
      <NextButton onPress={next} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
