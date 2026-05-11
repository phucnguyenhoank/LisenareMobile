import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { getPushToken } from "@/utils/notifications";

export const usePushNotifications = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification>();

  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    async function setup() {
      try {
        const t = await getPushToken();
        if (t) setPushToken(t);
      } catch (err) {
        console.error(err);
      }
    }

    setup();

    notificationListener =
      Notifications.addNotificationReceivedListener(setNotification);

    responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Tapped:", response.notification.request.content.data);
      },
    );

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, []);

  return { pushToken, notification };
};
