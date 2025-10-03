import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import AppointmentWidget from '../components/widget/AppointmentWidget';

/**
 * Standalone Widget Page for embedding
 * This page can be accessed via iframe or direct link
 */
const WidgetPage = () => {
  // Get configuration from URL parameters
  const params = new URLSearchParams(window.location.search);

  const widgetConfig = {
    apiUrl: params.get('apiUrl') || 'http://localhost:5000/api',
    theme: params.get('theme') || 'light',
    primaryColor: params.get('primaryColor') || '#0EA5E9',
    compact: params.get('compact') === 'true',
    defaultDoctorId: params.get('doctorId') || null,
    showHeader: params.get('showHeader') !== 'false',
  };

  // Callback when booking is complete
  const handleBookingComplete = (appointment) => {
    console.log('Booking completed:', appointment);

    // Send message to parent window if embedded in iframe
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'APPOINTMENT_BOOKED',
        data: appointment,
      }, '*');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppointmentWidget
        {...widgetConfig}
        onBookingComplete={handleBookingComplete}
      />
    </ThemeProvider>
  );
};

export default WidgetPage;
