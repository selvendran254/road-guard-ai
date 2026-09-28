import { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { setSosTriggerHandler } from './src/lib/backgroundSafety';
import { navigateToSos } from './src/lib/navigationRef';
import './src/i18n';

function AppRoot() {
  useEffect(() => {
    setSosTriggerHandler(navigateToSos);
  }, []);
  return <AppNavigator />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppRoot />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
