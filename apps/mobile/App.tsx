import { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initNotifications } from './src/lib/notifications';
import { startBackgroundSafety, stopBackgroundSafety, setSosTriggerHandler } from './src/lib/backgroundSafety';
import { navigateToSos } from './src/lib/navigationRef';
import './src/i18n';

function AppRoot() {
  useEffect(() => {
    initNotifications();
    setSosTriggerHandler(navigateToSos);
    startBackgroundSafety().catch(() => {});
    return () => stopBackgroundSafety();
  }, []);
  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoot />
      </ThemeProvider>
    </AuthProvider>
  );
}
