import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme/theme';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import DoctorDashboard from './components/doctor/DoctorDashboardModern';
import PatientDashboard from './components/client/PatientDashboard';
import PatientBookingFlow from './components/client/PatientBookingFlow';
import AppointmentBooking from './components/client/AppointmentBooking';
import WidgetPage from './pages/WidgetPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/doctor/dashboard"
              element={<PrivateRoute component={DoctorDashboard} roles={['doctor']} />}
            />
            <Route
              path="/client/dashboard"
              element={<PrivateRoute component={PatientDashboard} roles={['client']} />}
            />
            <Route
              path="/client/old-dashboard"
              element={<PrivateRoute component={AppointmentBooking} roles={['client']} />}
            />
            <Route
              path="/book-appointment"
              element={<PrivateRoute component={AppointmentBooking} roles={['client']} />}
            />
            <Route
              path="/book-appointment-v2"
              element={<PrivateRoute component={PatientBookingFlow} roles={['client']} />}
            />
            {/* Public Widget Route - No Authentication Required */}
            <Route path="/widget" element={<WidgetPage />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
