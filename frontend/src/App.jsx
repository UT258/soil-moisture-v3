import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { loadUser } from './store/slices/authSlice';
import socketService from './services/socketService';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import SensorsPage from './pages/Sensors/SensorsPage';
import SensorDetails from './pages/Sensors/SensorDetails';
import AlertsPage from './pages/Alerts/AlertsPage';
import MapPage from './pages/Map/MapPage';
import RiskZonesPage from './pages/RiskZones/RiskZonesPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Load user on app start
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    // Connect socket when authenticated
    if (isAuthenticated) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <Box>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="sensors" element={<SensorsPage />} />
          <Route path="sensors/:id" element={<SensorDetails />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="risk-zones" element={<RiskZonesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App;
