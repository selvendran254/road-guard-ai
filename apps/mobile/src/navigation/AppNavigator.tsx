import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { navigationRef } from '../lib/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList, MainStackParamList, TabParamList } from './types';
import { useTheme } from '../context/ThemeContext';

import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SmartMapScreen from '../screens/SmartMapScreen';
import SosCountdownScreen from '../screens/SosCountdownScreen';
import EmergencyActiveScreen from '../screens/EmergencyActiveScreen';
import VehicleScreen from '../screens/VehicleScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import MedicalProfileScreen from '../screens/MedicalProfileScreen';
import ReportHazardScreen from '../screens/ReportHazardScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import AccidentDetectionScreen from '../screens/AccidentDetectionScreen';
import RoadSafetyCameraScreen from '../screens/RoadSafetyCameraScreen';
import AmbulanceScreen from '../screens/AmbulanceScreen';
import GreenCorridorScreen from '../screens/GreenCorridorScreen';
import HospitalScreen from '../screens/HospitalScreen';
import BloodBankScreen from '../screens/BloodBankScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpGuideScreen from '../screens/HelpGuideScreen';
import SafeRouteScreen from '../screens/SafeRouteScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import WearableScreen from '../screens/WearableScreen';
import QRMedicalScreen from '../screens/QRMedicalScreen';
import EmergencyChatScreen from '../screens/EmergencyChatScreen';
import VoiceSosScreen from '../screens/VoiceSosScreen';
import HazardVerifyScreen from '../screens/HazardVerifyScreen';
import BlackSpotsScreen from '../screens/BlackSpotsScreen';
import WeatherScreen from '../screens/WeatherScreen';
import CommunityRespondersScreen from '../screens/CommunityRespondersScreen';
import FamilyShareScreen from '../screens/FamilyShareScreen';
import FirstAidGuideScreen from '../screens/FirstAidGuideScreen';
import SpeedometerScreen from '../screens/SpeedometerScreen';
import FeaturesHubScreen from '../screens/FeaturesHubScreen';
import FeatureRunnerScreen from '../screens/FeatureRunnerScreen';
import { Text, View } from 'react-native';
import SosButton from '../components/SosButton';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function SosTabScreen({ navigation }: { navigation: { navigate: (s: string) => void } }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <SosButton onPress={() => navigation.navigate('SosCountdown')} size={120} />
      <Text style={{ marginTop: 16, color: theme.textMuted }}>Tap to start SOS countdown</Text>
    </View>
  );
}

function MainTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, height: 60, paddingBottom: 8, paddingTop: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: theme.bg },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="Features"
        component={FeaturesHubScreen}
        options={{ tabBarLabel: 'Features', tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚡</Text> }}
      />
      <Tab.Screen
        name="SOS"
        component={SosTabScreen}
        options={{ tabBarLabel: 'SOS', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🚨</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const theme = useTheme();
  const stackOptions = {
    headerStyle: { backgroundColor: theme.card },
    headerTintColor: theme.text,
    headerTitleStyle: { fontWeight: '700' as const },
    contentStyle: { backgroundColor: theme.bg },
  };

  return (
    <MainStack.Navigator screenOptions={stackOptions}>
      <MainStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <MainStack.Screen name="SosCountdown" component={SosCountdownScreen} options={{ title: 'SOS', headerStyle: { backgroundColor: '#DC2626' }, headerTintColor: '#FFF' }} />
      <MainStack.Screen name="EmergencyActive" component={EmergencyActiveScreen} options={{ title: 'Emergency Active' }} />
      <MainStack.Screen name="VehicleDetails" component={VehicleScreen} options={{ title: 'Vehicle' }} />
      <MainStack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Contacts' }} />
      <MainStack.Screen name="MedicalProfile" component={MedicalProfileScreen} options={{ title: 'Medical Profile' }} />
      <MainStack.Screen name="SmartMap" component={SmartMapScreen} options={{ title: 'Smart Map' }} />
      <MainStack.Screen name="RoadSafetyCamera" component={RoadSafetyCameraScreen} options={{ title: 'Safety Camera' }} />
      <MainStack.Screen name="ReportHazard" component={ReportHazardScreen} options={{ title: 'Report Hazard' }} />
      <MainStack.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'My Reports' }} />
      <MainStack.Screen name="AccidentDetection" component={AccidentDetectionScreen} options={{ title: 'Accident Detection' }} />
      <MainStack.Screen name="AmbulanceTracking" component={AmbulanceScreen} options={{ title: 'Ambulance' }} />
      <MainStack.Screen name="GreenCorridor" component={GreenCorridorScreen} options={{ title: 'Green Corridor' }} />
      <MainStack.Screen name="HospitalPreAlert" component={HospitalScreen} options={{ title: 'Hospitals' }} />
      <MainStack.Screen name="BloodBank" component={BloodBankScreen} options={{ title: 'Blood Bank' }} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <MainStack.Screen name="HelpGuide" component={HelpGuideScreen} options={{ title: 'Help Guide' }} />
      <MainStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <MainStack.Screen name="SafeRoute" component={SafeRouteScreen} options={{ title: 'Safe Route' }} />
      <MainStack.Screen name="TripHistory" component={TripHistoryScreen} options={{ title: 'Trip History' }} />
      <MainStack.Screen name="Wearable" component={WearableScreen} options={{ title: 'Wearable' }} />
      <MainStack.Screen name="QRMedical" component={QRMedicalScreen} options={{ title: 'Medical QR' }} />
      <MainStack.Screen name="EmergencyChat" component={EmergencyChatScreen} options={{ title: 'Operator Chat' }} />
      <MainStack.Screen name="VoiceSos" component={VoiceSosScreen} options={{ title: 'Voice SOS' }} />
      <MainStack.Screen name="HazardVerify" component={HazardVerifyScreen} options={{ title: 'Verify Hazards' }} />
      <MainStack.Screen name="BlackSpots" component={BlackSpotsScreen} options={{ title: 'Black Spots' }} />
      <MainStack.Screen name="Weather" component={WeatherScreen} options={{ title: 'Weather' }} />
      <MainStack.Screen name="CommunityResponders" component={CommunityRespondersScreen} options={{ title: 'Community Help' }} />
      <MainStack.Screen name="FamilyShare" component={FamilyShareScreen} options={{ title: 'Family Share' }} />
      <MainStack.Screen name="FirstAidGuide" component={FirstAidGuideScreen} options={{ title: 'First Aid' }} />
      <MainStack.Screen name="Speedometer" component={SpeedometerScreen} options={{ title: 'Speedometer' }} />
      <MainStack.Screen name="FeaturesHub" component={FeaturesHubScreen} options={{ title: 'All Features' }} />
      <MainStack.Screen name="FeatureRunner" component={FeatureRunnerScreen} options={{ title: 'Feature' }} />
    </MainStack.Navigator>
  );
}

function AuthNavigator() {
  const theme = useTheme();
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="OtpVerification" component={OtpScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, session, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DC2626' }}>
        <Text style={{ fontSize: 48 }}>🛡️</Text>
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18, marginTop: 12 }}>RoadGuard AI</Text>
        <Text style={{ color: '#FEE2E2', marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  const isAuthenticated = !!(token && session?.sessionId && session.otpVerified);

  const navTheme = {
    ...(theme.darkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.darkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: '#DC2626',
      background: theme.bg,
      card: theme.card,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <StatusBar style={theme.darkMode ? 'light' : 'dark'} />
      {isAuthenticated && session ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
