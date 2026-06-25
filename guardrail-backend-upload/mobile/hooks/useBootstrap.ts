import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { ensureNotificationSetup } from '../lib/notifications';

export function useBootstrap() {
  useEffect(() => {
    ensureNotificationSetup();

    const response = Notifications.getLastNotificationResponse();
    const url = response?.notification.request.content.data?.url;
    if (typeof url === 'string') {
      router.push(url as any);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((resp) => {
      const nextUrl = resp.notification.request.content.data?.url;
      if (typeof nextUrl === 'string') {
        router.push(nextUrl as any);
      }
    });

    return () => subscription.remove();
  }, []);
}
