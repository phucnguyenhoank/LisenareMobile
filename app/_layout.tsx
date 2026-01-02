import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
  return (
    // Wrap the Stack so all screens can use useAuth()
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false} }>
        <Stack.Screen name="(tabs)" options={{title: "Home"}}/>
      </Stack>
    </AuthProvider>
  );
}
