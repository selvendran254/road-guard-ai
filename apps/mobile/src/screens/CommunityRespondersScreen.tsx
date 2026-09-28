import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';
import { useThemedStyles } from '../hooks/useThemedStyles';

export default function CommunityRespondersScreen() {
  const { t } = useTranslation();
  const { theme, styles: ts } = useThemedStyles();
  const [responders, setResponders] = useState<{ name: string; distanceKm: number; badge: string }[]>([]);

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      const res = await api.getNearbyResponders(loc.coords.latitude, loc.coords.longitude);
      setResponders((res as { responders: typeof responders }).responders || []);
    })();
  }, []);

  return (
    <View style={ts.container}>
      <Text style={ts.title}>{t('community_responders')}</Text>
      <Text style={ts.subtitle}>{t('community_responders_hint')}</Text>
      <FlatList
        data={responders}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={ts.card}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>{item.name}</Text>
            <Text style={{ color: theme.textMuted, marginTop: 4 }}>
              {item.distanceKm.toFixed(1)} km | {item.badge}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={ts.empty}>{t('no_responders')}</Text>}
      />
    </View>
  );
}
