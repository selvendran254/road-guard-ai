import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function EmergencyChatScreen({ route }: { route: { params: { emergencyId: string } } }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [messages, setMessages] = useState<{ id: string; sender: string; senderName: string; message: string; createdAt: string }[]>([]);
  const [text, setText] = useState('');

  const load = () => api.getChatMessages(route.params.emergencyId).then((r) => setMessages((r as { messages: typeof messages }).messages || []));

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [route.params.emergencyId]);

  const send = async () => {
    if (!text.trim()) return;
    await api.sendChatMessage(route.params.emergencyId, text.trim());
    setText('');
    load();
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={[styles.title, { color: theme.text }]}>{t('operator_chat')}</Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.opBubble]}>
            <Text style={styles.sender}>{item.senderName}</Text>
            <Text style={styles.msg}>{item.message}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} value={text} onChangeText={setText} placeholder={t('type_message')} />
        <TouchableOpacity style={styles.sendBtn} onPress={send}><Text style={styles.sendText}>{t('send')}</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  list: { paddingBottom: 16 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '85%' },
  userBubble: { backgroundColor: '#DC2626', alignSelf: 'flex-end' },
  opBubble: { backgroundColor: '#E2E8F0', alignSelf: 'flex-start' },
  sender: { fontSize: 10, fontWeight: '700', marginBottom: 4, color: '#64748B' },
  msg: { color: '#1E293B' },
  inputRow: { flexDirection: 'row', gap: 8, paddingBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12 },
  sendBtn: { backgroundColor: '#DC2626', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10 },
  sendText: { color: '#FFF', fontWeight: '700' },
});
