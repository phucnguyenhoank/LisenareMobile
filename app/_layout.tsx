import { RequestError } from "@/services/client";
import { AuthProvider } from "@/context/AuthContext";
import { SessionProvider } from "@/context/SessionContext";
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
import { showDialog } from "@/utils/dialogs";
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
        showDialog({
          title: "Session Expired",
          message:
            "Your session has timed out. Please log in again to continue learning.",
          confirmText: "Log In",
          showCancel: false, // Prevents them from closing the modal and staying on an unauthorized page
          onConfirm: () => {
            router.replace("/setting");
          },
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

              <Stack.Screen
                name="adaptive-practice"
                options={{ headerShown: false }}
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
