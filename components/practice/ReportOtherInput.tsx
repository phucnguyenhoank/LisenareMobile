import colors from "@/theme/colors";
import { Button, TextInput, View } from "react-native";

interface ReportOtherInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}

export const ReportOtherInput = ({
  value,
  onChangeText,
  onCancel,
  onSubmit,
}: ReportOtherInputProps) => {
  return (
    <View
      style={{
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
        marginTop: 10,
      }}
    >
      <TextInput
        placeholder="Describe the issue..."
        value={value}
        onChangeText={onChangeText}
        autoFocus
        style={{
          borderBottomWidth: 1,
          marginBottom: 10,
          padding: 5,
          color: "#000",
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button title="Hủy" onPress={onCancel} color="gray" />
        <Button
          title="Gửi"
          onPress={() => onSubmit(value)}
          color={colors.primary} // Đảm bảo component này có quyền truy cập vào biến colors
        />
      </View>
    </View>
  );
};
