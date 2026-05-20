import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Svg, { Polyline, Circle, Line, Text as SvgText } from "react-native-svg";

import colors from "@/theme/colors";
import { CardHeader } from "./CardHeader";
import { TimeRange, Metric, TimeSeriesPoint } from "@/types/learner-statistic";
import MetricSwitch from "./MetricSwitch";
import TimeRangeSelector from "./TimeRangeSelector";

const DESCRIPTION_MAP: Record<Metric, string> = {
  total_learning: "Tổng tích lũy số câu đã học mỗi ngày",
  reviews: "Số lượt ôn tập mỗi ngày",
};

interface ChartCardProps {
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  selectedMetric: Metric;
  setSelectedMetric: (metric: Metric) => void;
  title: string;
  data: TimeSeriesPoint[];
  loading?: boolean;
}

const getColors = (metric: Metric) => {
  if (metric === "total_learning") {
    return { lineColor: colors.secondary5, dotColor: colors.secondary5 };
  }
  return { lineColor: "#007AFF", dotColor: "#007AFF" }; // for reviews
};

export default function ChartCard({
  selectedRange,
  setSelectedRange,
  selectedMetric,
  setSelectedMetric,
  title,
  data,
  loading = false,
}: ChartCardProps) {
  const { lineColor, dotColor } = getColors(selectedMetric);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Reset tooltip when data changes
  useEffect(() => {
    setActiveIndex(null);
    setTooltipPos(null);
  }, [data]);

  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map((p) => p.value);
    const max = Math.max(...values);
    const min = Math.min(...values);

    const width = 300;
    const height = 180;
    const paddingX = 10;
    const paddingY = 10;

    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;

    const getX = (index: number): number => {
      // calculates the x coordinate of the index in the graph
      // spaces the dots evenly across the width.
      if (data.length === 1) return width / 2;
      return paddingX + (index / (data.length - 1)) * plotWidth;
    };

    const getY = (value: number): number => {
      // calculates the y coordinate of the value in the graph
      // max and min value are always at the top and bottom of the graph respectively
      if (max === min) return height / 2;
      const ratio = (value - min) / (max - min);
      return paddingY + (1 - ratio) * plotHeight;
    };

    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ");

    const circles = data.map((d, i) => {
      const x = getX(i); // better to calculate once
      const y = getY(d.value);

      return (
        <React.Fragment key={`${d.date}-${i}`}>
          {/* Invisible larger hit area - easier to tap */}
          <Circle
            cx={x}
            cy={y}
            r={20} // Large invisible touch area (20px radius)
            fill="transparent"
            onPress={() => {
              setActiveIndex(i);
              setTooltipPos({ x, y: y - 35 });
            }}
          />

          {/* Visible dot */}
          <Circle
            cx={x}
            cy={y}
            r={4}
            fill={dotColor}
            pointerEvents="none" // Important: don't block the invisible circle
          />
        </React.Fragment>
      );
    });

    const gridLines = [0, 1, 2, 3].map((i) => {
      const y = paddingY + (i / 3) * plotHeight;
      return (
        <Line
          key={i}
          x1={paddingX}
          x2={width - paddingX}
          y1={y}
          y2={y}
          stroke="#E5E5EA"
          strokeWidth="1"
        />
      );
    });

    return {
      points,
      circles,
      gridLines,
      width,
      height,
      getX,
      getY,
    };
  }, [data, selectedMetric, dotColor]);

  // Close tooltip when tapping outside
  const closeTooltip = () => {
    setActiveIndex(null);
    setTooltipPos(null);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <CardHeader
        title={title}
        scope={`Đơn vị: ${selectedMetric === "total_learning" ? "thẻ" : "lượt"}`}
      />

      {/* Metric Switch */}
      <MetricSwitch
        selectedMetric={selectedMetric}
        onChange={setSelectedMetric}
      />

      {/* Description */}
      <Text style={styles.chartHint}>{DESCRIPTION_MAP[selectedMetric]}</Text>

      {/* Chart Area + Tooltip */}
      <View style={styles.chartWrapper}>
        {/* Chart Box */}
        <View style={styles.chartBox}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.secondary} size="large" />
            </View>
          ) : !chart ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
            </View>
          ) : (
            <Svg
              width="100%"
              height={180}
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              onPress={closeTooltip}
            >
              {chart.gridLines}
              <Polyline
                points={chart.points}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {chart.circles}
            </Svg>
          )}
        </View>

        {/* Tooltip - Placed OUTSIDE the chartBox so it can go above it */}
        {tooltipPos && activeIndex !== null && data[activeIndex] && chart && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(
                  10,
                  Math.min(tooltipPos.x - 60, chart.width - 130),
                ), // prevent overflow
                top: tooltipPos.y - 12,
              },
            ]}
          >
            <Text style={styles.tooltipDate}>
              {data[activeIndex].date} {/* You can improve this */}
            </Text>
            <Text style={styles.tooltipValue}>
              {data[activeIndex].value}
              <Text style={styles.unit}>
                {selectedMetric === "total_learning" ? " thẻ" : " lượt"}
              </Text>
            </Text>
          </View>
        )}
      </View>

      {/* Time Range Buttons */}
      <TimeRangeSelector
        selectedRange={selectedRange}
        onChange={setSelectedRange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  // Chart
  chartHint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  chartBox: {
    borderRadius: 16,
    backgroundColor: "#FAFAFC",
    borderWidth: 1,
    borderColor: "#ECECF2",
    padding: 10,
    height: 200,
    overflow: "hidden",
  },
  chartWrapper: {
    position: "relative", // This is crucial
    marginBottom: 8,
  },

  // Center states
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 13,
  },

  // tooltip
  tooltip: {
    position: "absolute",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    alignItems: "center",
    zIndex: 100, // Make sure it's on top
    minWidth: 120,
  },

  tooltipDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 3,
  },

  tooltipValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  unit: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
});
