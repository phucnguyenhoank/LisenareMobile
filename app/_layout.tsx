import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        {/* Wrap the Stack so all screens can use useAuth() */}
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
            <Stack.Screen
              name="setting"
              options={{
                title: "Cài đặt",
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
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
