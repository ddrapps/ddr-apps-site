import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function ensureNotificationSetup() {
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }

  await Notifications.setNotificationChannelAsync('guardrails', {
    name: 'Guardrails',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200]
  });
}

export async function sendGuardrailNotification(title: string, body: string, data: Record<string, string> = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data
    },
    trigger: null
  });
}
