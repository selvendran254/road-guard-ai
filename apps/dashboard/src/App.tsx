import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import { HazardsPage, AmbulancesPage, HospitalsPage, BloodRequestsPage } from './pages/ListPages';
import SmsLogsPage from './pages/SmsLogsPage';
import BlackSpotsPage from './pages/BlackSpotsPage';
import ChatPage from './pages/ChatPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />
      <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetailPage /></ProtectedRoute>} />
      <Route path="/hazards" element={<ProtectedRoute><HazardsPage /></ProtectedRoute>} />
      <Route path="/ambulances" element={<ProtectedRoute><AmbulancesPage /></ProtectedRoute>} />
      <Route path="/hospitals" element={<ProtectedRoute><HospitalsPage /></ProtectedRoute>} />
      <Route path="/blood" element={<ProtectedRoute><BloodRequestsPage /></ProtectedRoute>} />
      <Route path="/black-spots" element={<ProtectedRoute><BlackSpotsPage /></ProtectedRoute>} />
      <Route path="/sms-logs" element={<ProtectedRoute><SmsLogsPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
