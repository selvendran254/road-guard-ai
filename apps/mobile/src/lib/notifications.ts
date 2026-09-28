// Safe notifications — no expo-notifications native import (crashes standalone APK without FCM setup)
export async function initNotifications() {
  return true;
}

export async function pushLocal(title: string, body: string, data?: Record<string, unknown>) {
  console.log(`[RoadGuard Alert] ${title}: ${body}`, data);
}
