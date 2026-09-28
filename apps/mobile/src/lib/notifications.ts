import Constants from 'expo-constants';

// Remote push is not supported in Expo Go (SDK 53+). Use local-only shim there.
export const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

type NotificationsModule = typeof import('expo-notifications');
let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;
  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
  }
  if (!handlerConfigured && notificationsModule) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    handlerConfigured = true;
  }
  return notificationsModule;
}

export async function initNotifications() {
  if (isExpoGo) return true;
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function pushLocal(title: string, body: string, data?: Record<string, unknown>) {
  if (isExpoGo) {
    // Local alerts work without remote push — skip native module in Expo Go
    console.log(`[RoadGuard Alert] ${title}: ${body}`, data);
    return;
  }
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  } catch {
    console.log(`[RoadGuard Alert] ${title}: ${body}`);
  }
}
