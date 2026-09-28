import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function GeofenceBanner({ lat, lng }: { lat?: number; lng?: number }) {
  const { session } = useAuth();
  const theme = useTheme();
  const enabled = (session?.settings as { geofenceAlerts?: boolean })?.geofenceAlerts !== false;
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !lat || !lng) return;
    api.checkGeofence(lat, lng).then((r) => {
      const data = r as { alerts: { alertMessage: string }[]; nearbyBlackSpots: { name: string }[] };
      if (data.alerts?.[0]) setAlert(data.alerts[0].alertMessage);
      else if (data.nearbyBlackSpots?.[0]) setAlert(`⚠️ Black spot: ${data.nearbyBlackSpots[0].name}`);
      else setAlert(null);
    }).catch(() => null);
  }, [lat, lng, enabled]);

  if (!alert) return null;

  return (
    <View style={[styles.banner, theme.darkMode && { backgroundColor: '#78350F', borderColor: '#F59E0B' }]}>
      <Text style={[styles.text, theme.darkMode && { color: '#FDE68A' }]}>{alert}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#FEF3C7', padding: 10, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#F59E0B' },
  text: { color: '#92400E', fontWeight: '600', fontSize: 13 },
});
