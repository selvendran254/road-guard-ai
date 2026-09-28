import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>🛡️</Text>
          <Text style={styles.title}>RoadGuard AI</Text>
          <Text style={styles.msg}>Something went wrong. Tap below to retry.</Text>
          <Text style={styles.detail} numberOfLines={4}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => this.setState({ error: null })}>
            <Text style={styles.btnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DC2626', padding: 24 },
  icon: { fontSize: 48 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 12 },
  msg: { color: '#FEE2E2', marginTop: 8, textAlign: 'center' },
  detail: { color: '#FECACA', fontSize: 11, marginTop: 12, textAlign: 'center' },
  btn: { marginTop: 24, backgroundColor: '#FFF', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#DC2626', fontWeight: '700' },
});
