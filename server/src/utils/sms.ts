import { smsLogs } from '../store';
import { newId, now } from './helpers';
import type { EmergencyContact } from '../types';

export function sendEmergencySms(
  sessionId: string,
  emergencyId: string,
  contacts: EmergencyContact[],
  lat: number,
  lng: number,
  userName: string
) {
  const locationLink = `https://maps.google.com/?q=${lat},${lng}`;
  const logs = contacts.map((c) => {
    const log = {
      id: newId('sms'),
      emergencyId,
      sessionId,
      toPhone: c.phone,
      toName: c.name,
      message: `🚨 EMERGENCY: ${userName} triggered SOS. Location: ${locationLink}. Contact: ${c.relationship}. — RoadGuard AI (demo SMS)`,
      status: 'sent' as const,
      createdAt: now(),
    };
    smsLogs.push(log);
    return log;
  });
  return logs;
}
