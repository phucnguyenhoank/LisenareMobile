import colors from "@/theme/colors";
import { Text, View } from "react-native";
import Svg, { Polyline, Circle } from "react-native-svg";

export default function TestScreen() {
  // 1. Fake data: 3 points (x is horizontal index, y is the value)
  // Point 1: (50, 150), Point 2: (150, 50), Point 3: (250, 100)
  const points = "50,150 150,50 250,100";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Title: Test Chart</Text>

      <View
        style={{ backgroundColor: "#f9f9f9", borderRadius: 10, padding: 10 }}
      >
        <Svg width={300} height={200} viewBox="0 0 300 200">
          {/* The Line */}
          <Polyline
            points={points}
            fill="none"
            stroke={colors.secondary5}
            strokeWidth="3"
          />

          {/* The 3 Dots */}
          <Circle cx="50" cy="150" r="4" fill={colors.secondary5} />
          <Circle cx="150" cy="50" r="4" fill={colors.secondary5} />
          <Circle cx="250" cy="100" r="4" fill={colors.secondary5} />
        </Svg>
      </View>
    </View>
  );
}
