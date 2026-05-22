import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { C } from "@/theme/grammar_constants";

interface Props {
  totalAnswered: number;
  correctCount: number;
  finalTheta: number;
  onRestart: () => void;
  onExit: () => void;
}

export function PracticeResult({
  totalAnswered,
  correctCount,
  finalTheta,
  onRestart,
  onExit,
}: Props) {
  const pct =
    totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const msg =
    pct >= 80
      ? "Xuất sắc! 🎉"
      : pct >= 50
        ? "Khá tốt 💪"
        : "Cần ôn thêm 📚";

  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>🎯</Text>
      <Text style={styles.title}>Hoàn thành luyện tập!</Text>
      <Text style={styles.msg}>{msg}</Text>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {correctCount}
            <Text style={styles.statDenom}>/{totalAnswered}</Text>
          </Text>
          <Text style={styles.statLabel}>Câu đúng</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{pct}%</Text>
          <Text style={styles.statLabel}>Chính xác</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{finalTheta.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Theta</Text>
        </View>
      </View>

      <View style={{ gap: 10, width: "100%", maxWidth: 320 }}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onRestart}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Luyện tiếp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={onExit}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>Quay lại Ngữ pháp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emoji: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: "800", color: C.text },
  msg: { fontSize: 16, color: C.textMid, marginBottom: 12 },
  statRow: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
    width: "100%",
    maxWidth: 320,
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "800", color: C.primary },
  statDenom: { fontSize: 14, fontWeight: "600", color: C.textLight },
  statLabel: { fontSize: 11, color: C.textSoft, marginTop: 4 },
  divider: { width: 1, backgroundColor: C.border, marginVertical: 4 },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  outlineBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  outlineBtnText: { color: C.textMid, fontSize: 14, fontWeight: "600" },
});
