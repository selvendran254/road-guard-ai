export type FeatureCategory =
  | 'Emergency'
  | 'Navigation'
  | 'AI & Safety'
  | 'Community'
  | 'Medical'
  | 'Vehicle'
  | 'Security'
  | 'Integrations'
  | 'Alerts'
  | 'Roadside'
  | 'Existing';

export type FeatureType =
  | 'screen'
  | 'call'
  | 'api-action'
  | 'api-list'
  | 'api-form'
  | 'device'
  | 'share';

export type FeatureDef = {
  id: string;
  title: string;
  titleTa: string;
  category: FeatureCategory;
  icon: string;
  type: FeatureType;
  screen?: string;
  phone?: string;
  endpoint?: string;
  method?: 'GET' | 'POST';
  formFields?: { key: string; label: string; placeholder?: string }[];
  deviceAction?: string;
  description: string;
};

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  'Emergency', 'Navigation', 'AI & Safety', 'Community', 'Medical',
  'Vehicle', 'Security', 'Integrations', 'Alerts', 'Roadside', 'Existing',
];

export const ALL_FEATURES: FeatureDef[] = [
  // Emergency (1-10)
  { id: 'f01', title: 'Call 112 Emergency', titleTa: '112 அழை', category: 'Emergency', icon: '📞', type: 'call', phone: '112', description: 'National emergency number India ERSS' },
  { id: 'f02', title: 'SMS & Voice Alert', titleTa: 'SMS/Voice Alert', category: 'Emergency', icon: '📱', type: 'screen', screen: 'EmergencyContacts', description: 'Alert emergency contacts via SMS' },
  { id: 'f03', title: 'Silent SOS', titleTa: 'Silent SOS', category: 'Emergency', icon: '🤫', type: 'api-action', endpoint: '/features/emergency/silent-sos', method: 'POST', description: 'Trigger SOS without alarm sound' },
  { id: 'f04', title: 'Background Crash Detect', titleTa: 'Background Crash', category: 'Emergency', icon: '💥', type: 'device', deviceAction: 'background-crash', description: 'Detect accidents when app is minimized' },
  { id: 'f05', title: 'Push Notifications', titleTa: 'Push Alerts', category: 'Emergency', icon: '🔔', type: 'device', deviceAction: 'test-push', description: 'Local push notification alerts' },
  { id: 'f06', title: 'Video Call Operator', titleTa: 'Video Call', category: 'Emergency', icon: '📹', type: 'api-action', endpoint: '/features/emergency/video-call/demo', method: 'GET', description: 'Video call with control room' },
  { id: 'f07', title: 'Auto-Dial Ambulance', titleTa: 'Auto Ambulance', category: 'Emergency', icon: '🚑', type: 'call', phone: '108', description: 'Automatically dial ambulance 108' },
  { id: 'f08', title: 'SOS with Photo/Video', titleTa: 'SOS Media', category: 'Emergency', icon: '📸', type: 'device', deviceAction: 'sos-media', description: 'Attach photo/video to SOS' },
  { id: 'f09', title: 'Shake to SOS', titleTa: 'Shake SOS', category: 'Emergency', icon: '📳', type: 'device', deviceAction: 'shake-sos', description: 'Shake phone 3 times for SOS' },
  { id: 'f10', title: 'Panic Mode', titleTa: 'Panic Mode', category: 'Emergency', icon: '🆘', type: 'api-action', endpoint: '/features/emergency/panic-mode', method: 'POST', description: 'Hide screen and share location secretly' },
  { id: 'f11', title: 'Manual SOS', titleTa: 'Manual SOS', category: 'Emergency', icon: '🚨', type: 'screen', screen: 'SosCountdown', description: 'Standard SOS countdown' },
  { id: 'f12', title: 'Voice SOS', titleTa: 'Voice SOS', category: 'Emergency', icon: '🎤', type: 'screen', screen: 'VoiceSos', description: 'Voice command SOS' },
  { id: 'f13', title: 'Emergency Chat', titleTa: 'Emergency Chat', category: 'Emergency', icon: '💬', type: 'screen', screen: 'EmergencyChat', description: 'Chat with operator during emergency' },
  { id: 'f14', title: 'Accident Detection', titleTa: 'Accident Detect', category: 'Emergency', icon: '⚠️', type: 'screen', screen: 'AccidentDetection', description: 'Sensor-based crash detection' },
  { id: 'f15', title: 'First Aid Guide', titleTa: 'First Aid', category: 'Emergency', icon: '🩹', type: 'screen', screen: 'FirstAidGuide', description: 'Interactive first aid steps' },

  // Navigation (16-25)
  { id: 'f16', title: 'Turn-by-Turn Navigation', titleTa: 'Navigation', category: 'Navigation', icon: '🧭', type: 'api-list', endpoint: '/features/navigation/turn-by-turn?from=current&to=hospital', method: 'GET', description: 'Step-by-step route guidance' },
  { id: 'f17', title: 'Live Family Tracking', titleTa: 'Live Tracking', category: 'Navigation', icon: '👨‍👩‍👧', type: 'device', deviceAction: 'live-share', description: 'Share live location with family' },
  { id: 'f18', title: 'Background GPS', titleTa: 'Background GPS', category: 'Navigation', icon: '📍', type: 'device', deviceAction: 'background-gps', description: 'Track location in background' },
  { id: 'f19', title: 'Offline Maps', titleTa: 'Offline Maps', category: 'Navigation', icon: '🗺️', type: 'api-action', endpoint: '/features/navigation/offline-map/download', method: 'POST', description: 'Download maps for offline use' },
  { id: 'f20', title: 'Traffic-Aware Route', titleTa: 'Traffic Route', category: 'Navigation', icon: '🚦', type: 'api-list', endpoint: '/features/navigation/traffic-route?from=here&to=there', method: 'GET', description: 'Route avoiding traffic jams' },
  { id: 'f21', title: 'Speed Limit Alerts', titleTa: 'Speed Limit', category: 'Navigation', icon: '⏱️', type: 'device', deviceAction: 'speed-limit', description: 'Alert when exceeding speed limit' },
  { id: 'f22', title: 'Safe Route Map', titleTa: 'Safe Route', category: 'Navigation', icon: '🛣️', type: 'screen', screen: 'SafeRoute', description: 'Safest route with polyline' },
  { id: 'f23', title: 'Route Heatmap', titleTa: 'Route Heatmap', category: 'Navigation', icon: '🔥', type: 'api-list', endpoint: '/features/navigation/route-heatmap/me', method: 'GET', description: 'Visualize your travel patterns' },
  { id: 'f24', title: 'Save Parking Spot', titleTa: 'Parking Save', category: 'Navigation', icon: '🅿️', type: 'device', deviceAction: 'save-parking', description: 'Save where you parked' },
  { id: 'f25', title: 'EV Charging Stations', titleTa: 'EV Charging', category: 'Navigation', icon: '⚡', type: 'api-list', endpoint: '/features/navigation/ev-stations', method: 'GET', description: 'Find nearby EV chargers' },
  { id: 'f26', title: 'Smart Map', titleTa: 'Smart Map', category: 'Navigation', icon: '🗺️', type: 'screen', screen: 'SmartMap', description: 'Hazards, hospitals on map' },
  { id: 'f27', title: 'Green Corridor', titleTa: 'Green Corridor', category: 'Navigation', icon: '🟢', type: 'screen', screen: 'GreenCorridor', description: 'Emergency priority route' },
  { id: 'f28', title: 'Black Spots Map', titleTa: 'Black Spots', category: 'Navigation', icon: '💀', type: 'screen', screen: 'BlackSpots', description: 'Accident hotspot areas' },
  { id: 'f29', title: 'Family Share Link', titleTa: 'Family Share', category: 'Navigation', icon: '🔗', type: 'screen', screen: 'FamilyShare', description: 'Share location link' },
  { id: 'f30', title: 'Trip History', titleTa: 'Trip History', category: 'Navigation', icon: '📊', type: 'screen', screen: 'TripHistory', description: 'Past trips and safety scores' },

  // AI & Safety (31-40)
  { id: 'f31', title: 'Road Safety Camera', titleTa: 'Safety Camera', category: 'AI & Safety', icon: '📷', type: 'screen', screen: 'RoadSafetyCamera', description: 'AI helmet, drowsiness detection' },
  { id: 'f32', title: 'Dashcam Mode', titleTa: 'Dashcam', category: 'AI & Safety', icon: '🎥', type: 'api-action', endpoint: '/features/ai/dashcam/start', method: 'POST', description: 'Continuous road recording' },
  { id: 'f33', title: 'Audio Crash Detection', titleTa: 'Audio Crash', category: 'AI & Safety', icon: '🔊', type: 'api-action', endpoint: '/features/ai/audio-crash-detect', method: 'POST', description: 'Detect crash sounds' },
  { id: 'f34', title: 'ADAS Warnings', titleTa: 'ADAS', category: 'AI & Safety', icon: '🚗', type: 'api-list', endpoint: '/features/ai/advisory', method: 'GET', description: 'Lane departure, collision warnings' },
  { id: 'f35', title: 'OBD-II Connect', titleTa: 'OBD Connect', category: 'AI & Safety', icon: '🔌', type: 'api-action', endpoint: '/features/ai/obd/connect', method: 'POST', description: 'Connect car diagnostics' },
  { id: 'f36', title: 'OBD Live Data', titleTa: 'OBD Data', category: 'AI & Safety', icon: '📈', type: 'api-list', endpoint: '/features/ai/obd/data', method: 'GET', description: 'Live speed, RPM, fuel from car' },
  { id: 'f37', title: 'Speedometer', titleTa: 'Speedometer', category: 'AI & Safety', icon: '🏎️', type: 'screen', screen: 'Speedometer', description: 'Real-time speed display' },
  { id: 'f38', title: 'Wearable Connect', titleTa: 'Wearable', category: 'AI & Safety', icon: '⌚', type: 'screen', screen: 'Wearable', description: 'Smartwatch fall detection' },
  { id: 'f39', title: 'Report Hazard', titleTa: 'Report Hazard', category: 'AI & Safety', icon: '🕳️', type: 'screen', screen: 'ReportHazard', description: 'Report road hazards with photo' },
  { id: 'f40', title: 'Verify Hazards', titleTa: 'Verify Hazard', category: 'AI & Safety', icon: '✅', type: 'screen', screen: 'HazardVerify', description: 'Community hazard verification' },

  // Community (41-50)
  { id: 'f41', title: 'Safety Points & Badges', titleTa: 'Points & Badges', category: 'Community', icon: '🏆', type: 'api-list', endpoint: '/features/community/gamification', method: 'GET', description: 'Your safety score and badges' },
  { id: 'f42', title: 'Leaderboard', titleTa: 'Leaderboard', category: 'Community', icon: '🥇', type: 'api-list', endpoint: '/features/community/leaderboard', method: 'GET', description: 'City safety rankings' },
  { id: 'f43', title: 'Certified Responders', titleTa: 'Responders', category: 'Community', icon: '🦸', type: 'api-list', endpoint: '/features/community/certified-responders', method: 'GET', description: 'Trained nearby helpers' },
  { id: 'f44', title: 'Blood Donor Network', titleTa: 'Blood Donors', category: 'Community', icon: '🩸', type: 'api-list', endpoint: '/features/community/blood-donors', method: 'GET', description: 'Find blood donors nearby' },
  { id: 'f45', title: 'Witness Report', titleTa: 'Witness Report', category: 'Community', icon: '👁️', type: 'api-form', endpoint: '/features/community/witness-report', method: 'POST', formFields: [{ key: 'description', label: 'What did you see?' }], description: 'Report accident as witness' },
  { id: 'f46', title: 'Community Feed', titleTa: 'Community Feed', category: 'Community', icon: '📰', type: 'api-list', endpoint: '/features/community/feed', method: 'GET', description: 'Local safety alerts feed' },
  { id: 'f47', title: 'Refer & Earn', titleTa: 'Refer & Earn', category: 'Community', icon: '🎁', type: 'api-action', endpoint: '/features/community/referral', method: 'POST', description: 'Invite friends, earn rewards' },
  { id: 'f48', title: 'Community Help', titleTa: 'Community Help', category: 'Community', icon: '🤝', type: 'screen', screen: 'CommunityResponders', description: 'Nearby community responders' },
  { id: 'f49', title: 'My Hazard Reports', titleTa: 'My Reports', category: 'Community', icon: '📋', type: 'screen', screen: 'MyReports', description: 'Your reported hazards' },
  { id: 'f50', title: 'Weather Alerts', titleTa: 'Weather', category: 'Community', icon: '🌧️', type: 'screen', screen: 'Weather', description: 'Weather and road conditions' },

  // Medical (51-60)
  { id: 'f51', title: 'Insurance Claim', titleTa: 'Insurance Claim', category: 'Medical', icon: '📄', type: 'api-form', endpoint: '/features/medical/insurance-claim', method: 'POST', formFields: [{ key: 'incidentDate', label: 'Incident Date' }, { key: 'description', label: 'Description' }], description: 'File insurance claim after accident' },
  { id: 'f52', title: 'My Insurance Claims', titleTa: 'My Claims', category: 'Medical', icon: '📑', type: 'api-list', endpoint: '/features/medical/insurance-claims', method: 'GET', description: 'View claim status' },
  { id: 'f53', title: 'File FIR Report', titleTa: 'FIR Report', category: 'Medical', icon: '👮', type: 'api-form', endpoint: '/features/medical/fir-report', method: 'POST', formFields: [{ key: 'location', label: 'Location' }, { key: 'description', label: 'Incident Details' }], description: 'Generate police FIR report' },
  { id: 'f54', title: 'My FIR Reports', titleTa: 'My FIR', category: 'Medical', icon: '📝', type: 'api-list', endpoint: '/features/medical/fir-reports', method: 'GET', description: 'View filed FIR reports' },
  { id: 'f55', title: 'Doctor Teleconsult', titleTa: 'Teleconsult', category: 'Medical', icon: '👨‍⚕️', type: 'api-action', endpoint: '/features/medical/teleconsult/request', method: 'POST', description: 'Video call with doctor' },
  { id: 'f56', title: 'Medicine Reminder', titleTa: 'Medicine Reminder', category: 'Medical', icon: '💊', type: 'api-form', endpoint: '/features/medical/medicine-reminder', method: 'POST', formFields: [{ key: 'medicine', label: 'Medicine Name' }, { key: 'time', label: 'Time (e.g. 8:00 AM)' }], description: 'Daily medicine alerts' },
  { id: 'f57', title: 'My Medicine Reminders', titleTa: 'My Medicines', category: 'Medical', icon: '⏰', type: 'api-list', endpoint: '/features/medical/medicine-reminders', method: 'GET', description: 'View medicine schedule' },
  { id: 'f58', title: 'Organ Donor Register', titleTa: 'Organ Donor', category: 'Medical', icon: '❤️', type: 'api-action', endpoint: '/features/medical/organ-donor', method: 'POST', description: 'Register as organ donor' },
  { id: 'f59', title: 'Medical History Export', titleTa: 'Medical Export', category: 'Medical', icon: '📤', type: 'api-list', endpoint: '/features/medical/history-export', method: 'GET', description: 'Export medical profile PDF' },
  { id: 'f60', title: 'Medical QR ID', titleTa: 'Medical QR', category: 'Medical', icon: '🔲', type: 'screen', screen: 'QRMedical', description: 'QR code for paramedics' },
  { id: 'f61', title: 'Medical Profile', titleTa: 'Medical Profile', category: 'Medical', icon: '🏥', type: 'screen', screen: 'MedicalProfile', description: 'Blood group, allergies, conditions' },
  { id: 'f62', title: 'Hospital Pre-Alert', titleTa: 'Hospital Alert', category: 'Medical', icon: '🏨', type: 'screen', screen: 'HospitalPreAlert', description: 'Alert hospital before arrival' },
  { id: 'f63', title: 'Blood Bank Request', titleTa: 'Blood Bank', category: 'Medical', icon: '🩸', type: 'screen', screen: 'BloodBank', description: 'Emergency blood request' },
  { id: 'f64', title: 'Ambulance Payment UPI', titleTa: 'Ambulance Pay', category: 'Medical', icon: '💳', type: 'api-form', endpoint: '/features/medical/ambulance-payment', method: 'POST', formFields: [{ key: 'amount', label: 'Amount (₹)' }], description: 'Pay ambulance via UPI' },

  // Vehicle (65-72)
  { id: 'f65', title: 'Add Driver Profile', titleTa: 'Add Driver', category: 'Vehicle', icon: '👤', type: 'api-form', endpoint: '/features/vehicle/driver/add', method: 'POST', formFields: [{ key: 'name', label: 'Driver Name' }, { key: 'licenseNo', label: 'License No' }], description: 'Multi-driver family car' },
  { id: 'f66', title: 'My Drivers', titleTa: 'My Drivers', category: 'Vehicle', icon: '👥', type: 'api-list', endpoint: '/features/vehicle/drivers', method: 'GET', description: 'View driver profiles' },
  { id: 'f67', title: 'Maintenance Reminder', titleTa: 'Maintenance', category: 'Vehicle', icon: '🔧', type: 'api-form', endpoint: '/features/vehicle/maintenance', method: 'POST', formFields: [{ key: 'type', label: 'Service Type' }, { key: 'dueDate', label: 'Due Date' }, { key: 'vehicleReg', label: 'Vehicle Reg' }], description: 'Service due reminders' },
  { id: 'f68', title: 'Fuel Stations Nearby', titleTa: 'Fuel Stations', category: 'Vehicle', icon: '⛽', type: 'api-list', endpoint: '/features/vehicle/fuel-stations', method: 'GET', description: 'Fuel prices nearby' },
  { id: 'f69', title: 'Toll Plaza Alerts', titleTa: 'Toll Alerts', category: 'Vehicle', icon: '🛣️', type: 'api-list', endpoint: '/features/vehicle/toll-plazas', method: 'GET', description: 'Upcoming toll plazas' },
  { id: 'f70', title: 'RC & Insurance Expiry', titleTa: 'RC/Insurance', category: 'Vehicle', icon: '📋', type: 'api-list', endpoint: '/features/vehicle/rc-insurance-expiry', method: 'GET', description: 'Document expiry alerts' },
  { id: 'f71', title: 'Driver Behavior Score', titleTa: 'Behavior Score', category: 'Vehicle', icon: '📊', type: 'api-list', endpoint: '/features/vehicle/behavior-score', method: 'GET', description: 'Harsh brake, overspeed tracking' },
  { id: 'f72', title: 'Fleet Manager', titleTa: 'Fleet Manager', category: 'Vehicle', icon: '🚛', type: 'api-list', endpoint: '/features/vehicle/fleet-status', method: 'GET', description: 'Manage company vehicles' },
  { id: 'f73', title: 'Vehicle Details', titleTa: 'Vehicle', category: 'Vehicle', icon: '🚗', type: 'screen', screen: 'VehicleDetails', description: 'Manage your vehicles' },

  // Security (74-80)
  { id: 'f74', title: 'Biometric Lock', titleTa: 'Biometric Lock', category: 'Security', icon: '🔐', type: 'device', deviceAction: 'biometric', description: 'Fingerprint lock for medical data' },
  { id: 'f75', title: 'Two-Factor Auth', titleTa: '2FA', category: 'Security', icon: '🔑', type: 'api-action', endpoint: '/features/security/2fa/enable', method: 'POST', description: 'Enable SMS two-factor auth' },
  { id: 'f76', title: 'Export My Data', titleTa: 'Export Data', category: 'Security', icon: '📦', type: 'api-action', endpoint: '/features/security/data-export', method: 'POST', description: 'Download all your data' },
  { id: 'f77', title: 'Delete Account', titleTa: 'Delete Account', category: 'Security', icon: '🗑️', type: 'api-action', endpoint: '/features/security/delete-account', method: 'POST', description: 'Request account deletion' },
  { id: 'f78', title: 'Logout All Devices', titleTa: 'Logout All', category: 'Security', icon: '📱', type: 'api-action', endpoint: '/features/security/logout-all', method: 'POST', description: 'Sign out everywhere' },
  { id: 'f79', title: 'Audit Log', titleTa: 'Audit Log', category: 'Security', icon: '📜', type: 'api-list', endpoint: '/features/security/audit-log', method: 'GET', description: 'Security activity log' },
  { id: 'f80', title: 'Active Sessions', titleTa: 'Sessions', category: 'Security', icon: '💻', type: 'api-list', endpoint: '/features/security/sessions', method: 'GET', description: 'Devices logged in' },

  // Integrations (81-87)
  { id: 'f81', title: 'WhatsApp Family Alert', titleTa: 'WhatsApp Alert', category: 'Integrations', icon: '💬', type: 'device', deviceAction: 'whatsapp', description: 'Send SOS via WhatsApp' },
  { id: 'f82', title: 'Telegram SOS Bot', titleTa: 'Telegram SOS', category: 'Integrations', icon: '✈️', type: 'api-action', endpoint: '/features/integrations/telegram-sos', method: 'POST', description: 'Alert via Telegram bot' },
  { id: 'f83', title: 'Google Sign-In', titleTa: 'Google Login', category: 'Integrations', icon: '🔵', type: 'api-action', endpoint: '/features/integrations/google-signin', method: 'POST', description: 'Link Google account' },
  { id: 'f84', title: 'Apple Sign-In', titleTa: 'Apple Login', category: 'Integrations', icon: '🍎', type: 'api-action', endpoint: '/features/integrations/apple-signin', method: 'POST', description: 'Link Apple account' },
  { id: 'f85', title: 'Aadhaar Verify', titleTa: 'Aadhaar', category: 'Integrations', icon: '🪪', type: 'api-form', endpoint: '/features/integrations/aadhaar-verify', method: 'POST', formFields: [{ key: 'aadhaar', label: 'Aadhaar Number (last 4 shown)' }], description: 'Verify identity via Aadhaar' },
  { id: 'f86', title: 'DigiLocker Link', titleTa: 'DigiLocker', category: 'Integrations', icon: '📁', type: 'api-action', endpoint: '/features/integrations/digilocker', method: 'POST', description: 'Link medical documents' },
  { id: 'f87', title: 'Alexa SOS Skill', titleTa: 'Alexa SOS', category: 'Integrations', icon: '🔊', type: 'api-action', endpoint: '/features/integrations/alexa-skill', method: 'POST', description: 'Voice SOS via Alexa' },

  // Alerts (bonus)
  { id: 'f88', title: 'Speed Camera Alerts', titleTa: 'Speed Camera', category: 'Alerts', icon: '📸', type: 'api-list', endpoint: '/features/alerts/speed-cameras', method: 'GET', description: 'Speed camera locations' },
  { id: 'f89', title: 'Red Light Camera', titleTa: 'Red Light', category: 'Alerts', icon: '🔴', type: 'api-list', endpoint: '/features/alerts/red-light', method: 'GET', description: 'Red light camera alerts' },
  { id: 'f90', title: 'School Bus Zone', titleTa: 'School Bus', category: 'Alerts', icon: '🚌', type: 'api-list', endpoint: '/features/alerts/school-bus', method: 'GET', description: 'School bus stop alerts' },
  { id: 'f91', title: 'Railway Crossing', titleTa: 'Railway', category: 'Alerts', icon: '🚂', type: 'api-list', endpoint: '/features/alerts/railway-crossing', method: 'GET', description: 'Railway gate status' },
  { id: 'f92', title: 'Geofence Alerts', titleTa: 'Geofence', category: 'Alerts', icon: '📍', type: 'screen', screen: 'SmartMap', description: 'School/construction zone alerts' },

  // Roadside
  { id: 'f93', title: 'Roadside Assistance', titleTa: 'Roadside Help', category: 'Roadside', icon: '🛟', type: 'api-form', endpoint: '/features/roadside/assistance', method: 'POST', formFields: [{ key: 'type', label: 'Help Type (Tow/Fuel/Tire)' }], description: 'Request tow, fuel, tire help' },
  { id: 'f94', title: 'Assistance Types', titleTa: 'Help Types', category: 'Roadside', icon: '📋', type: 'api-list', endpoint: '/features/roadside/assistance/types', method: 'GET', description: 'Available roadside services' },

  // Existing linked
  { id: 'f95', title: 'Ambulance Tracking', titleTa: 'Ambulance', category: 'Existing', icon: '🚑', type: 'screen', screen: 'AmbulanceTracking', description: 'Track nearby ambulances' },
  { id: 'f96', title: 'Notifications', titleTa: 'Notifications', category: 'Existing', icon: '🔔', type: 'screen', screen: 'Notifications', description: 'All app notifications' },
  { id: 'f97', title: 'Settings', titleTa: 'Settings', category: 'Existing', icon: '⚙️', type: 'screen', screen: 'Settings', description: 'App settings and privacy' },
  { id: 'f98', title: 'Help Guide', titleTa: 'Help', category: 'Existing', icon: '❓', type: 'screen', screen: 'HelpGuide', description: 'How to use the app' },
];

export function getFeaturesByCategory(category: FeatureCategory) {
  return ALL_FEATURES.filter((f) => f.category === category);
}

export function getFeatureById(id: string) {
  return ALL_FEATURES.find((f) => f.id === id);
}
