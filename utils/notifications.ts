import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function getPushToken() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (!Device.isDevice) {
    throw new Error("Must use physical device");
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) throw new Error("Project ID not found");

  const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId }))
    .data;

  return pushToken;
}
