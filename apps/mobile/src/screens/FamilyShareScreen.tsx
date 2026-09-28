import { useState } from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useThemedStyles } from '../hooks/useThemedStyles';

export default function FamilyShareScreen() {
  const { t } = useTranslation();
  const { theme, styles: ts } = useThemedStyles();
  const [link, setLink] = useState('');

  const share = async () => {
    const res = await api.getFamilyShareLink();
    const data = res as { shareLink: string; message: string };
    setLink(data.shareLink);
    await Share.share({ message: `${data.message}\n${data.shareLink}`, title: t('family_share') });
  };

  return (
    <View style={[ts.container, local.pad]}>
      <Text style={ts.title}>{t('family_share')}</Text>
      <Text style={ts.subtitle}>{t('family_share_hint')}</Text>
      <TouchableOpacity style={ts.btn} onPress={share}>
        <Text style={ts.btnText}>{t('share_location')}</Text>
      </TouchableOpacity>
      {link ? (
        <View style={ts.card}>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>{t('share_link')}</Text>
          <Text style={{ color: theme.primary, marginTop: 8 }} selectable>{link}</Text>
        </View>
      ) : null}
    </View>
  );
}

const local = StyleSheet.create({ pad: { padding: 16 } });
