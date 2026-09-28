import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SosButton from '../components/SosButton';
import OfflineBanner from '../components/OfflineBanner';
import GeofenceBanner from '../components/GeofenceBanner';
import { api } from '../lib/api';
import * as Location from 'expo-location';
import { MainStackParamList, TabParamList } from '../navigation/types';
import { ensureTripTracking, updateTripFromLocation } from '../lib/tripTracker';
import { pushLocal } from '../lib/notifications';
import { ALL_FEATURES } from '../data/featuresRegistry';
import { shouldShowGeofenceAlerts } from '../lib/settingsGuard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const theme = useTheme();
  const [location, setLocation] = useState(t('fetching_location'));
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hazardCount, setHazardCount] = useState(0);
  const [ambulanceCount, setAmbulanceCount] = useState(0);

  const userName = (session?.profile as { name?: string })?.name || session?.phone || 'User';
  const safetyScore = (session as { safetyScore?: number })?.safetyScore ?? 85;
  const isSafe = safetyScore >= 70;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setCoords({ lat: latitude, lng: longitude });

      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo) {
          const parts = [geo.name, geo.street, geo.city, geo.region].filter(Boolean);
          setLocation(parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch {
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }

      await api.updateLocation(latitude, longitude);
      await ensureTripTracking();
      await updateTripFromLocation(latitude, longitude, loc.coords.speed || undefined);

      if (await shouldShowGeofenceAlerts()) {
        const geo = await api.checkGeofence(latitude, longitude);
        const g = geo as { hasAlerts?: boolean; alerts?: { alertMessage: string }[] };
        if (g.hasAlerts && g.alerts?.[0]) {
          pushLocal('Road Alert', g.alerts[0].alertMessage);
        }
      }

      try {
        const [hazards, ambulances] = await Promise.all([
          api.getNearbyHazards(latitude, longitude),
          api.getNearbyAmbulances(latitude, longitude),
        ]);
        setHazardCount(((hazards as { hazards?: unknown[] }).hazards || []).length);
        setAmbulanceCount(((ambulances as { ambulances?: unknown[] }).ambulances || []).length);
      } catch {
        // Nearby counts are optional — home still works without them
      }
    })();
  }, [t]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.text, fontSize: theme.fontSize + 4 }]}>
            👋 {t('hello_user', { name: userName })}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel={t('notifications')}
            >
              <Text style={styles.iconBtnText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('Settings')}
              accessibilityLabel={t('settings')}
            >
              <Text style={styles.iconBtnText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {coords && <GeofenceBanner lat={coords.lat} lng={coords.lng} />}

        {/* Road Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>{isSafe ? '🟢' : '🟡'}</Text>
            <Text style={[styles.statusLabel, { color: theme.text }]}>
              {t('road_status')}:{' '}
              <Text style={[styles.statusValue, { color: isSafe ? '#059669' : '#D97706' }]}>
                {isSafe ? t('safe') : t('caution')}
              </Text>
            </Text>
          </View>
          <Text style={[styles.location, { color: theme.textMuted }]}>
            📍 {t('current_location')}
          </Text>
          <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={2}>
            {location}
          </Text>
        </View>

        {/* SOS */}
        <View style={styles.sosSection}>
          <SosButton onPress={() => navigation.navigate('SosCountdown')} size={theme.sosSize} />
          <Text style={[styles.sosLabel, { color: theme.text }]}>🚨 {t('sos')}</Text>
          <Text style={[styles.sosSub, { color: theme.textMuted }]}>{t('emergency_assistance')}</Text>
        </View>

        {/* Nearby Summary */}
        <View style={[styles.nearbyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity
            style={styles.nearbyRow}
            onPress={() => navigation.navigate('HazardVerify')}
          >
            <Text style={styles.nearbyIcon}>⚠️</Text>
            <Text style={[styles.nearbyText, { color: theme.text }]}>
              {t('hazards_nearby', { count: hazardCount })}
            </Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            style={styles.nearbyRow}
            onPress={() => navigation.navigate('AmbulanceTracking')}
          >
            <Text style={styles.nearbyIcon}>🚑</Text>
            <Text style={[styles.nearbyText, { color: theme.text }]}>
              {t('ambulance_nearby', { count: ambulanceCount })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* All Features Banner */}
        <TouchableOpacity
          style={[styles.featuresBanner, { backgroundColor: '#DC2626' }]}
          onPress={() => navigation.navigate('Features')}
        >
          <Text style={styles.featuresBannerIcon}>⚡</Text>
          <View style={styles.featuresBannerBody}>
            <Text style={styles.featuresBannerTitle}>{ALL_FEATURES.length} Features Ready</Text>
            <Text style={styles.featuresBannerSub}>Emergency • Navigation • AI • Medical • More</Text>
          </View>
          <Text style={styles.featuresBannerArrow}>›</Text>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.grid}>
          {[
            { icon: '🗺️', label: t('map'), screen: 'SmartMap' as const },
            { icon: '📷', label: t('report'), screen: 'ReportHazard' as const },
            { icon: '🚑', label: 'Ambulance', screen: 'AmbulanceTracking' as const },
            { icon: '🏥', label: 'Hospital', screen: 'HospitalPreAlert' as const },
            { icon: '🛣️', label: 'Safe Route', screen: 'SafeRoute' as const },
            { icon: '💥', label: 'Accident', screen: 'AccidentDetection' as const },
            { icon: '🏆', label: 'Points', screen: 'FeatureRunner' as const, params: { featureId: 'f41' } },
            { icon: '📞', label: 'Call 112', screen: 'FeatureRunner' as const, params: { featureId: 'f01' } },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => {
                if ('params' in item && item.params) {
                  navigation.navigate(item.screen, item.params);
                } else {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={[styles.gridLabel, { color: theme.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontWeight: '800', flex: 1, marginRight: 12 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBtnText: { fontSize: 18 },
  statusCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { fontSize: 14 },
  statusLabel: { fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  statusValue: { fontWeight: '900', fontSize: 16 },
  location: { marginTop: 14, fontSize: 13, fontWeight: '600' },
  locationText: { marginTop: 4, fontSize: 14, lineHeight: 20 },
  sosSection: { alignItems: 'center', marginBottom: 28 },
  sosLabel: { marginTop: 12, fontWeight: '800', fontSize: 18 },
  sosSub: { marginTop: 4, fontSize: 14, fontWeight: '500' },
  nearbyCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  nearbyIcon: { fontSize: 20 },
  nearbyText: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 18 },
  featuresBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 20 },
  featuresBannerIcon: { fontSize: 32, marginRight: 12 },
  featuresBannerBody: { flex: 1 },
  featuresBannerTitle: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  featuresBannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  featuresBannerArrow: { color: '#FFF', fontSize: 28, fontWeight: '300' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '47%', borderRadius: 14, borderWidth: 1, paddingVertical: 18, alignItems: 'center' },
  gridIcon: { fontSize: 28, marginBottom: 6 },
  gridLabel: { fontSize: 13, fontWeight: '700' },
});
