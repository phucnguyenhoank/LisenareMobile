import { ApiError } from "@/api/client";
import { AuthProvider } from "@/context/AuthContext";
import { SessionProvider } from "@/context/SessionContext";
import { showAlert } from "@/utils/alerts";
import { authActions } from "@/utils/auth-events";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 401 error
        if (error instanceof ApiError && error.status === 401) {
          return false;
        }

        // For other errors, retry up to 3 times (default behavior)
        return failureCount < 3;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // This runs automatically whenever ANY useQuery fails
      if (error instanceof ApiError && error.status === 401) {
        authActions.signout();
        showAlert({
          title: "Phiên đăng nhập hết hạn",
          message: "Hãy đăng nhập lại",
          confirmText: "Đăng nhập",
          onConfirm: () => {
            router.push("/setting");
          },
          showCancel: false,
          cancelable: false,
        });
      }
    },
  }),
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AuthProvider>
          <KeyboardProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />

              <Stack.Screen
                name="add-brick"
                options={{
                  title: "Thêm câu",
                  headerShown: true,
                }}
              />

              <Stack.Screen
                name="setting"
                options={{
                  title: "Cài đặt",
                  headerShown: true,
                }}
              />
            </Stack>
          </KeyboardProvider>
        </AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
