import { useMemo, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function TestScreen() {
  console.log("🔄 RENDER");
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  function expensiveFunction(n: number) {
    console.log(`Execution START`);
    const start = Date.now();
    while (Date.now() - start < 2000) {}
    console.log(`Execution DONE`);
    return { num: n };
  }

  const calculationResult = useMemo(() => expensiveFunction(count1), [count1]);

  const handleCount1 = () => {
    setCount1(count1 + 1);
  };
  const handleCount2 = () => {
    setCount2(count2 + 1);
  };

  return (
    <View style={styles.container}>
      <Text>Count1: {count1}</Text>
      <Text>Count2: {count2}</Text>

      <Text>Function ran: {calculationResult.num} times</Text>
      <Button title="Add count1" onPress={handleCount1} />
      <Button title="Add count2" onPress={handleCount2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  fruitList: {
    backgroundColor: "red",
  },
});
