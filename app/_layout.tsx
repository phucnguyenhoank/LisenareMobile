import { RequestError } from "@/services/client";
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
import * as Notifications from "expo-notifications";
import Toast from "@/components/Toast";
import AlertDialog from "@/components/AlertDialog";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 401 error
        if (error instanceof RequestError && error.status === 401) {
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
      if (error instanceof RequestError && error.status === 401) {
        authActions.clearPersistedAuth();
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
                name="setting"
                options={{
                  title: "Cài đặt",
                  headerShown: true,
                }}
              />
            </Stack>
            <Toast />
            <AlertDialog />
          </KeyboardProvider>
        </AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
