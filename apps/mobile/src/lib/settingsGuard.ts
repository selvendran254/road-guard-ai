import { api } from './api';

let cachedSettings: Record<string, boolean | number | string> = {};

export async function refreshSettings() {
  try {
    const session = await api.getSession();
    cachedSettings = (session as { settings?: Record<string, boolean | number | string> }).settings || {};
  } catch {
    cachedSettings = {};
  }
  return cachedSettings;
}

export function getSetting(key: string, defaultValue = true): boolean {
  const val = cachedSettings[key];
  if (val === undefined) return defaultValue;
  return !!val;
}

export async function shouldShowGeofenceAlerts() {
  await refreshSettings();
  return getSetting('geofenceAlerts', true);
}

export async function shouldShowWeatherAlerts() {
  await refreshSettings();
  return getSetting('weatherAlerts', true);
}

export async function shouldShareCamera() {
  await refreshSettings();
  return getSetting('shareCamera', false);
}

export async function areNotificationsEnabled() {
  await refreshSettings();
  return getSetting('notificationsEnabled', true);
}
