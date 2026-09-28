import { createNavigationContainerRef } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

export function navigateToSos() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('SosCountdown');
  }
}
