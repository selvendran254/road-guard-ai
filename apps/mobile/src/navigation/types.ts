export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  OtpVerification: { token: string; otp: string };
};

export type MainStackParamList = {
  MainTabs: undefined;
  SosCountdown: undefined;
  EmergencyActive: { emergencyId: string };
  VehicleDetails: undefined;
  EmergencyContacts: undefined;
  MedicalProfile: undefined;
  SmartMap: undefined;
  RoadSafetyCamera: undefined;
  ReportHazard: undefined;
  MyReports: undefined;
  AccidentDetection: undefined;
  AmbulanceTracking: undefined;
  GreenCorridor: undefined;
  HospitalPreAlert: undefined;
  BloodBank: undefined;
  Notifications: undefined;
  HelpGuide: undefined;
  Settings: undefined;
  SafeRoute: undefined;
  TripHistory: undefined;
  Wearable: undefined;
  QRMedical: undefined;
  EmergencyChat: { emergencyId: string };
  VoiceSos: undefined;
  HazardVerify: undefined;
  BlackSpots: undefined;
  Weather: undefined;
  CommunityResponders: undefined;
  FamilyShare: undefined;
  FirstAidGuide: undefined;
  Speedometer: undefined;
  FeaturesHub: undefined;
  FeatureRunner: { featureId: string };
};

export type TabParamList = {
  Home: undefined;
  Features: undefined;
  SOS: undefined;
  Profile: undefined;
};
