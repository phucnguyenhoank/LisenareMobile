import colors from "@/theme/colors";
import { Metric } from "@/types/learner-statistic";
import { Pressable, Text, View, StyleSheet } from "react-native";

const METRICS: { key: Metric; label: string }[] = [
  { key: "total_learning", label: "Tiến độ" },
  { key: "reviews", label: "Ôn tập" },
];

export default function MetricSwitch({
  selectedMetric,
  onChange,
}: {
  selectedMetric: Metric;
  onChange: (metric: Metric) => void;
}) {
  return (
    <View style={styles.metricSwitch}>
      {METRICS.map((metric) => {
        const isActive = selectedMetric === metric.key;

        return (
          <Pressable
            key={metric.key}
            onPress={() => onChange(metric.key)}
            style={[styles.metricBtn, isActive && styles.metricBtnActive]}
          >
            <Text
              style={[styles.metricText, isActive && styles.metricTextActive]}
            >
              {metric.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  metricSwitch: {
    flexDirection: "row",
    marginBottom: 12,
  },
  metricBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    marginRight: 8,
  },
  metricBtnActive: {
    backgroundColor: colors.secondary,
  },
  metricText: {
    fontSize: 13,
    color: "#444",
  },
  metricTextActive: {
    color: "white",
  },
});
