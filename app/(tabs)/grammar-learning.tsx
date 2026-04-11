import FloatingActionMenu from "@/components/FloatingActionMenu";
import { StyleSheet, Text, View } from "react-native";

export default function GrammarLearningScreen() {
  return (
    <View style={styles.container}>
      <Text>Học ngữ pháp với RLM ở đây</Text>
      <FloatingActionMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
