import CloseButton from "@/components/CloseButton";
import TextButton from "@/components/TextButton";
import colors from "@/theme/colors";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [showWhy, setShowWhy] = useState(false);

  return (
    <View style={[styles.mainContainer, { backgroundColor: "#fff" }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <CloseButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Làm sao để nói tiếng Anh lưu loát?</Text>

        <Text style={styles.paragraph}>Tất cả những gì bạn cần làm là:</Text>

        <Text style={styles.highlight}>
          Chuẩn bị những câu bạn cần nói, "nghe hiểu" chúng và "sử dụng" chúng
          hằng ngày.
        </Text>

        {/* Toggle WHY */}
        <Pressable onPress={() => setShowWhy(!showWhy)}>
          <Text style={styles.link}>
            Tại sao nó hiệu quả? {showWhy ? "▲" : "▼"}
          </Text>
        </Pressable>

        {showWhy && (
          <View style={styles.whyBox}>
            <Text style={styles.paragraph}>
              Não bạn chỉ có thể nhớ những thông tin có ý nghĩa với bạn.
            </Text>

            <Text style={styles.paragraph}>
              Bạn không thể bắt não ghi nhớ một điều gì đó lâu dài mà không thật
              sự liên quan đến bạn, nó sẽ quên mọi thứ nó xem là vô ích.
            </Text>

            <Text style={styles.paragraph}>
              Và nhiệm vụ của bạn là xây dựng một kho các câu bạn cần nói, có
              liên quan đến cuộc sống của bạn, và luyện tập nó hằng ngày.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.paragraph}>
              Bạn phải luyện tập hằng ngày bởi vì một giấc mơ rằng khi bạn học
              dồn 3000 từ, 1000 mẫu ngữ pháp trong vòng 10 ngày và sau đó{" "}
              <Text style={styles.bold}>đột nhiên</Text> nói chuyện lưu loát sẽ{" "}
              <Text style={styles.bold}>không bao giờ</Text> xảy ra.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.paragraph}>
              Khi một người không biết bơi, họ có thể xem video dạy cách bơi
              lội, hiểu hết mọi thứ, nhưng sẽ không xử lý được nếu rơi xuống
              nước mà chưa từng luyện tập.
            </Text>

            <Text style={styles.paragraph}>
              Và chỉ có cách là thật sự tập bơi hằng ngày, để khi rơi xuống
              nước, nó trở thành một phản xạ quen thuộc như những lần luyện tập
              trước đó.
            </Text>

            <Text style={styles.paragraph}>
              Không học tủ, không học dồn, tất cả là kỹ năng đến từ việc luyện
              tập thuần túy.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Video ví dụ thực hành</Text>

        <Text style={styles.note}>Note: Video ví dụ thực hành.</Text>

        <Text style={styles.softHighlight}>
          Giao tiếp lưu loát chỉ là một ngày luyện tập bình thường của thói quen
          luyện tập hằng ngày của bạn.
        </Text>

        <Text style={styles.paragraph}>
          Hỏi đáp về những khó khăn bạn gặp tại Đây
        </Text>

        <TextButton title="Luyện tập ngay" onPress={() => {}} />
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
    zIndex: 10,
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
  bold: {
    fontWeight: "bold",
  },
  link: {
    fontSize: 16,
    color: colors.secondary2,
    marginBottom: 8,
    fontWeight: "500",
  },
  whyBox: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  highlight: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF8E1",
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
    fontWeight: "500",
  },
  softHighlight: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: "italic",
    paddingLeft: 10,
    borderLeftWidth: 2,
  },
});
