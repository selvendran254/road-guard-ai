import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import { useTheme } from '../context/ThemeContext';

const COMMANDS = ['sos', 'help', 'cancel', 'safe'];

export default function VoiceSosScreen({ navigation }: { navigation: { navigate: (s: string) => void } }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  const simulateListen = () => {
    setListening(true);
    Speech.speak(t('listening'), { language: i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US' });
    setTimeout(() => {
      setListening(false);
      const cmd = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
      setLastCommand(cmd);
      if (cmd === 'sos' || cmd === 'help') {
        Alert.alert(t('voice_detected'), `"${cmd}" — ${t('starting_sos')}`, [
          { text: t('cancel'), style: 'cancel' },
          { text: 'OK', onPress: () => navigation.navigate('SosCountdown') },
        ]);
      } else if (cmd === 'safe') {
        Speech.speak(t('im_safe'), { language: i18n.language === 'ta' ? 'ta-IN' : 'en-US' });
      }
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('voice_sos')}</Text>
      <Text style={styles.sub}>{t('voice_sos_hint')}</Text>
      <TouchableOpacity style={[styles.mic, listening && styles.micActive]} onPress={simulateListen}>
        <Text style={styles.micIcon}>{listening ? '🎙️' : '🎤'}</Text>
        <Text style={styles.micText}>{listening ? t('listening') : t('tap_to_speak')}</Text>
      </TouchableOpacity>
      {lastCommand ? <Text style={styles.last}>{t('last_command')}: "{lastCommand}"</Text> : null}
      <Text style={styles.commands}>{t('voice_commands')}: SOS, Help, Safe, Cancel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', alignSelf: 'flex-start', marginBottom: 8 },
  sub: { color: '#64748B', alignSelf: 'flex-start', marginBottom: 32 },
  mic: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' },
  micActive: { backgroundColor: '#991B1B' },
  micIcon: { fontSize: 48 },
  micText: { color: '#FFF', fontWeight: '700', marginTop: 8 },
  last: { marginTop: 24, fontWeight: '600', color: '#334155' },
  commands: { marginTop: 16, color: '#94A3B8', fontSize: 13, textAlign: 'center' },
});
