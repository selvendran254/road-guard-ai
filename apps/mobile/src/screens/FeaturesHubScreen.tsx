import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { MainStackParamList, TabParamList } from '../navigation/types';
import { ALL_FEATURES, FEATURE_CATEGORIES, FeatureCategory } from '../data/featuresRegistry';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Features'>,
  NativeStackScreenProps<MainStackParamList>
>;

const CATEGORY_ICONS: Record<FeatureCategory, string> = {
  Emergency: '🚨', Navigation: '🗺️', 'AI & Safety': '🤖', Community: '👥',
  Medical: '🏥', Vehicle: '🚗', Security: '🔐', Integrations: '🔗',
  Alerts: '⚠️', Roadside: '🛟', Existing: '📱',
};

export default function FeaturesHubScreen({ navigation }: Props) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FeatureCategory | 'All'>('All');

  const filtered = useMemo(() => {
    let list = ALL_FEATURES;
    if (activeCategory !== 'All') list = list.filter((f) => f.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.title.toLowerCase().includes(q) || f.titleTa.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    return list;
  }, [search, activeCategory]);

  const openFeature = (featureId: string, screen?: string) => {
    if (screen === 'EmergencyChat') {
      navigation.navigate('EmergencyChat', { emergencyId: 'demo-emergency' });
      return;
    }
    if (screen) {
      navigation.navigate(screen as keyof MainStackParamList);
      return;
    }
    navigation.navigate('FeatureRunner', { featureId });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>🛡️ All Features</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{ALL_FEATURES.length} features — tap to use</Text>
        <TextInput
          style={[styles.search, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
          placeholder="Search features..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'All' && styles.catActive, { borderColor: theme.border, backgroundColor: activeCategory === 'All' ? '#DC2626' : theme.card }]}
          onPress={() => setActiveCategory('All')}
        >
          <Text style={[styles.catText, { color: activeCategory === 'All' ? '#FFF' : theme.text }]}>All ({ALL_FEATURES.length})</Text>
        </TouchableOpacity>
        {FEATURE_CATEGORIES.map((cat) => {
          const count = ALL_FEATURES.filter((f) => f.category === cat).length;
          const active = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, active && styles.catActive, { borderColor: theme.border, backgroundColor: active ? '#DC2626' : theme.card }]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, { color: active ? '#FFF' : theme.text }]}>{CATEGORY_ICONS[cat]} {cat} ({count})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openFeature(f.id, f.type === 'screen' ? f.screen : undefined)}
          >
            <Text style={styles.cardIcon}>{f.icon}</Text>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{f.title}</Text>
              <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>{f.description}</Text>
              <Text style={styles.cardBadge}>{f.category}</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={[styles.empty, { color: theme.textMuted }]}>No features found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 8, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  search: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  catScroll: { maxHeight: 52, marginVertical: 8 },
  catRow: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  catActive: { borderColor: '#DC2626' },
  catText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 12, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  cardIcon: { fontSize: 28, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  cardBadge: { fontSize: 10, color: '#DC2626', fontWeight: '700', marginTop: 4 },
  arrow: { fontSize: 24, fontWeight: '300' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
});
