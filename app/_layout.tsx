import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      {/* Wrap the Stack so all screens can use useAuth() */}
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
          <Stack.Screen
            name="profile"
            options={{
              title: "Thông tin cá nhân",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="add-brick"
            options={{
              title: "Thêm câu",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="search"
            options={{
              title: "Tìm câu",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="chat-topics"
            options={{
              title: "Chủ đề hội thoại",
              headerShown: true,
            }}
          />
        </Stack>
      </AuthProvider>
    </KeyboardProvider>
  );
}
