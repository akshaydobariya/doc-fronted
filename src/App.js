import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import DoctorDashboard from './components/doctor/DoctorDashboardModern';
import AppointmentBooking from './components/client/AppointmentBooking';
import WidgetPage from './pages/WidgetPage';
import PrivateRoute from './components/PrivateRoute';
import SimpleDragDropBuilder from './components/website/SimpleDragDropBuilder';
import WebsiteManager from './components/website/WebsiteManager';
import SimpleLandingPage from './pages/SimpleLandingPage';
import ComponentTest from './components/website/ComponentTest';
import ServicePage from './components/website/ServicePage';
import ServicePageEditor from './components/website/ServicePageEditor';
import UnifiedServiceEditor from './components/website/UnifiedServiceEditor';
import ContentManager from './components/website/ContentManager';
import AIAssistant from './components/website/AIAssistant';
import PreviewPanel from './components/website/PreviewPanel';
import ConflictResolution from './components/website/ConflictResolution';
import BlogPage from './components/blog/BlogPage';

// Smart redirect component that redirects based on authentication status
const SmartRedirect = () => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    console.log('🔀 Auto-redirecting authenticated user:', user.email, 'to', user.role, 'dashboard');

    switch (user.role) {
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'client':
        return <Navigate to="/client/dashboard" replace />;
      default:
        console.warn('⚠️ Unknown user role:', user.role);
        return <Navigate to="/login" replace />;
    }
  }

  // If not authenticated, redirect to login
  console.log('🔀 No authentication found - redirecting to login');
  return <Navigate to="/login" replace />;
};

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
              element={<PrivateRoute component={AppointmentBooking} roles={['client']} />}
            />
            <Route
              path="/book-appointment"
              element={<PrivateRoute component={AppointmentBooking} roles={['client']} />}
            />
            {/* Public Widget Route - No Authentication Required */}
            <Route path="/widget" element={<WidgetPage />} />

            {/* Website Management Routes - Protected for doctors/admins */}
            <Route
              path="/websites"
              element={<PrivateRoute component={WebsiteManager} roles={['doctor']} />}
            />
            <Route
              path="/full-destack-editor"
              element={<PrivateRoute component={SimpleDragDropBuilder} roles={['doctor']} />}
            />

            {/* Service Page Editor - Protected for doctors */}
            <Route
              path="/edit-service-page/:servicePageId"
              element={<PrivateRoute component={ServicePageEditor} roles={['doctor']} />}
            />

            {/* Unified Content Management Routes - Protected for doctors */}
            <Route
              path="/unified-service-editor/:servicePageId"
              element={<PrivateRoute component={UnifiedServiceEditor} roles={['doctor']} />}
            />
            <Route
              path="/content-manager/:servicePageId"
              element={<PrivateRoute component={ContentManager} roles={['doctor']} />}
            />
            <Route
              path="/ai-assistant/:servicePageId"
              element={<PrivateRoute component={AIAssistant} roles={['doctor']} />}
            />
            <Route
              path="/preview-panel/:servicePageId"
              element={<PrivateRoute component={PreviewPanel} roles={['doctor']} />}
            />
            <Route
              path="/conflict-resolution/:servicePageId"
              element={<PrivateRoute component={ConflictResolution} roles={['doctor']} />}
            />

            {/* Public Landing Page - Built with Destack */}
            <Route path="/landing" element={<SimpleLandingPage />} />

            {/* Public Service Pages - Now using SimpleDragDropBuilder in display mode */}
            <Route path="/services/:serviceSlug" element={<SimpleDragDropBuilder />} />
            <Route path="/website/:websiteId/services/:serviceSlug" element={<SimpleDragDropBuilder />} />

            {/* Blog Routes - Public */}
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/blog/category/:category" element={<BlogPage />} />
            <Route path="/blog/tag/:tag" element={<BlogPage />} />

            {/* Test Component */}
            <Route path="/test-components" element={<ComponentTest />} />

            <Route path="/" element={<SmartRedirect />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
