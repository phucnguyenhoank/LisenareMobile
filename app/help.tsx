import CloseButton from "@/components/CloseButton";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpScreen() {
  // Access precise inset values (top, bottom, left, right)
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.mainContainer, { backgroundColor: "#fff" }]}>
      {/* Fixed Header with dynamic top padding based on the device notch/status bar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <CloseButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          Cách để giao tiếp tiếng Anh một cách lưu loát?
        </Text>

        <Text style={styles.paragraph}>Tất cả những gì bạn cần làm là:</Text>

        <Text style={styles.paragraph}>
          Chuẩn bị những câu bạn cần nói, "nghe hiểu" chúng và "sử dụng" chúng
          hằng ngày.
        </Text>

        <Text style={styles.sectionTitle}>Xem video sau để hiểu hơn</Text>

        <Text style={styles.note}>Note: Video ví dụ thực hành.</Text>

        <Text style={styles.paragraph}>
          Sự lưu loát không bao giờ đến một cách đột nhiên, nó là một sự tạm
          dừng của thói quen sử dụng tiếng Anh hằng ngày của bạn.
        </Text>
        <Text style={styles.paragraph}>Hỏi đáp về những khó khăn bạn gặp</Text>
        <Text style={styles.paragraph}>Luyện tập ngay</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    zIndex: 10, // Keeps the close button interactive and on top
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 10,
  },
});
