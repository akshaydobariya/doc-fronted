import React, { useState } from 'react';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import ModernMinimalistHeader from './ModernMinimalistHeader';
import GlassmorphismHeader from './GlassmorphismHeader';
import GradientModernHeader from './GradientModernHeader';
import CorporateProfessionalHeader from './CorporateProfessionalHeader';
import FuturisticTechHeader from './FuturisticTechHeader';

/**
 * Test Component for Modern Headers
 * This component allows you to test all 5 modern header variants
 */
const TestModernHeaders = () => {
  const [selectedHeader, setSelectedHeader] = useState('minimalist');

  // Mock props for testing
  const mockProps = {
    websiteId: 'test-website-123',
    selectedServiceIds: ['service1', 'service2', 'service3'],
    logoUrl: null,
    siteName: "Test Dental Practice",
    showAllServices: false,
    groupByCategory: true,
    maxServicesInDropdown: 12,
    customNavigation: [
      { name: 'Blog', url: '/blog' },
      { name: 'Reviews', url: '/reviews' }
    ]
  };

  const headers = {
    minimalist: {
      component: ModernMinimalistHeader,
      name: 'Modern Minimalist',
      props: {
        ...mockProps,
        primaryColor: '#2563eb',
        textColor: '#1f2937'
      }
    },
    glassmorphism: {
      component: GlassmorphismHeader,
      name: 'Glassmorphism',
      props: {
        ...mockProps,
        primaryColor: '#6366f1',
        textColor: '#1e293b'
      }
    },
    gradient: {
      component: GradientModernHeader,
      name: 'Gradient Modern',
      props: {
        ...mockProps,
        primaryColor: '#8b5cf6',
        secondaryColor: '#06b6d4',
        textColor: '#ffffff'
      }
    },
    corporate: {
      component: CorporateProfessionalHeader,
      name: 'Corporate Professional',
      props: {
        ...mockProps,
        primaryColor: '#1565c0',
        secondaryColor: '#0d47a1',
        textColor: '#263238'
      }
    },
    futuristic: {
      component: FuturisticTechHeader,
      name: 'Futuristic Tech',
      props: {
        ...mockProps,
        primaryColor: '#00ff88',
        secondaryColor: '#0099ff',
        accentColor: '#ff0066',
        textColor: '#ffffff'
      }
    }
  };

  const SelectedHeaderComponent = headers[selectedHeader].component;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Modern Headers Test Page
      </Typography>

      {/* Header Selection Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Header Style:
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
          {Object.entries(headers).map(([key, header]) => (
            <Button
              key={key}
              variant={selectedHeader === key ? 'contained' : 'outlined'}
              onClick={() => setSelectedHeader(key)}
              sx={{ minWidth: 150 }}
            >
              {header.name}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Currently Selected Header Info */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6">
          Now Showing: {headers[selectedHeader].name}
        </Typography>
        <Typography variant="body2">
          Testing modern header with service mapping and responsive design
        </Typography>
      </Paper>

      {/* Header Preview */}
      <Paper sx={{ overflow: 'hidden', border: '2px solid #e0e0e0' }}>
        <SelectedHeaderComponent {...headers[selectedHeader].props} />
      </Paper>

      {/* Header Properties */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Header Properties:
        </Typography>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(headers[selectedHeader].props, null, 2)}
        </pre>
      </Paper>

      {/* Test Instructions */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Test Instructions:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Click on different header style buttons to switch between variants</li>
            <li>Test the Services dropdown (Note: mock data will show "Failed to load services")</li>
            <li>Verify responsive behavior by resizing your browser window</li>
            <li>Check that all navigation links and buttons work</li>
            <li>Ensure each header has its unique styling and animations</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default TestModernHeaders;