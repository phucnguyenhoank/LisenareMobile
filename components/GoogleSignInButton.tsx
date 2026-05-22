import { showDialog } from "@/utils/dialogs";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GoogleSigninButton() {
  const handleGoogleSignIn = () => {
    showDialog({
      title: "Google Sign In",
      message: "Chức năng đang phát triển",
    });
  };
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleSignIn}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/google-color.png")}
          style={styles.icon}
        />
        <Text style={styles.text}>Đăng ký với Google</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  content: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
});
