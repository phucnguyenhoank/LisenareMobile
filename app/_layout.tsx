import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      {/* Wrap the Stack so all screens can use useAuth() */}
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false} }>
          <Stack.Screen name="(tabs)" options={{title: "Home"}}/>
        </Stack>
      </AuthProvider>
    </KeyboardProvider>
    
  );
}
