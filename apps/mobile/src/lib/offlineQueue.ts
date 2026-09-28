import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = 'offline_sos_queue';

interface QueuedItem {
  type: 'sos';
  payload: Record<string, unknown>;
  timestamp: string;
}

export async function queueSos(payload: Record<string, unknown>) {
  const existing = await getQueue();
  existing.push({ type: 'sos', payload, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
}

async function getQueue(): Promise<QueuedItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function flushQueue(): Promise<number> {
  const queue = await getQueue();
  if (queue.length === 0) return 0;

  const remaining: QueuedItem[] = [];
  let sent = 0;

  for (const item of queue) {
    try {
      if (item.type === 'sos') {
        await api.triggerSos(item.payload);
        sent++;
      }
    } catch {
      remaining.push(item);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return sent;
}
