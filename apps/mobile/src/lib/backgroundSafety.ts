import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { api } from './api';
import { pushLocal } from './notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

let subscription: { remove: () => void } | null = null;
let lastShake = 0;
let shakeCount = 0;
let onSosTrigger: (() => void) | null = null;

const SHAKE_THRESHOLD = 2.5;
const SHAKE_WINDOW_MS = 2000;

export function setSosTriggerHandler(handler: () => void) {
  onSosTrigger = handler;
}

export async function getSettings() {
  try {
    const session = await api.getSession();
    return (session as { settings?: Record<string, boolean> }).settings || {};
  } catch {
    return {};
  }
}

export async function startBackgroundSafety() {
  const settings = await getSettings();
  if (settings.autoAccidentResponse === false) return;

  Accelerometer.setUpdateInterval(200);

  subscription?.remove();
  subscription = Accelerometer.addListener(async ({ x, y, z }) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const settings = await getSettings();

    // Shake to SOS
    if (settings.voiceCommands !== false) {
      if (magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShake < SHAKE_WINDOW_MS) {
          shakeCount++;
        } else {
          shakeCount = 1;
        }
        lastShake = now;
        if (shakeCount >= 3) {
          shakeCount = 0;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          await pushLocal('Shake SOS!', 'Emergency SOS triggered by shake');
          onSosTrigger?.();
        }
      }
    }

    // Background crash detection
    if (settings.autoAccidentResponse !== false && magnitude > 4.5) {
      const lastCrash = await AsyncStorage.getItem('last_crash_detect');
      if (!lastCrash || Date.now() - Number(lastCrash) > 30000) {
        await AsyncStorage.setItem('last_crash_detect', String(Date.now()));
        try {
          const result = await api.analyzeAccident({ acceleration: magnitude, gyro: 0, speed: 0 });
          const r = result as { possibleAccident?: boolean };
          if (r.possibleAccident) {
            await pushLocal('Crash Detected!', 'Possible accident detected — SOS in 10 seconds');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            onSosTrigger?.();
          }
        } catch {
          // offline — still alert locally
          await pushLocal('Impact Detected', 'Possible crash — check if you need help');
        }
      }
    }
  });
}

export function stopBackgroundSafety() {
  subscription?.remove();
  subscription = null;
}
