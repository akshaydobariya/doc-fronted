import React, { useState } from 'react';
import { Button, Box, Typography, Chip } from '@mui/material';
import { Settings as SettingsIcon, Build as BuildIcon } from '@mui/icons-material';
import ServiceHeaderConfigurator from './ServiceHeaderConfigurator';

/**
 * Dynamic Header Handler
 * Handles interaction with dynamic header components in the drag-and-drop builder
 * Shows service configuration options when dynamic headers are selected
 */
const DynamicHeaderHandler = ({
  selectedComponent,
  onUpdateComponent,
  websiteId
}) => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Check if the selected component is a dynamic header
  const isDynamicHeader = selectedComponent && (
    selectedComponent.id === 'dynamic-dental-header-basic' ||
    selectedComponent.id === 'dynamic-dental-header-custom' ||
    selectedComponent.id === 'react-dynamic-navigation-header' ||
    selectedComponent.isDynamic ||
    selectedComponent.customizable ||
    selectedComponent.isReactComponent
  );

  if (!isDynamicHeader) {
    return null;
  }

  const handleConfigureServices = () => {
    setConfigDialogOpen(true);
  };

  const handleSaveConfiguration = async (configData) => {
    try {
      // Handle React components vs HTML components differently
      const updatedComponent = {
        ...selectedComponent,
        lastUpdated: new Date().toISOString()
      };

      if (selectedComponent.isReactComponent) {
        // For React components, save configuration in config property
        updatedComponent.config = {
          ...selectedComponent.config,
          ...configData.settings
        };
      } else {
        // For HTML components, update the component HTML and service data
        updatedComponent.component = configData.component.component;
        updatedComponent.serviceData = configData.component.serviceData;
        updatedComponent.settings = configData.settings;
      }

      // Call the parent's update function
      if (onUpdateComponent) {
        await onUpdateComponent(updatedComponent);
      }

      setConfigDialogOpen(false);
    } catch (error) {
      console.error('Error saving header configuration:', error);
    }
  };

  const getServiceConfigSummary = () => {
    const serviceData = selectedComponent.serviceData;
    const settings = selectedComponent.settings;

    if (!serviceData && !settings) {
      return 'Not configured';
    }

    if (settings?.showAllServices) {
      return `All services (${serviceData?.totalServices || 0} total)`;
    }

    const selectedCount = settings?.selectedServices?.length || 0;
    const totalCount = serviceData?.totalServices || 0;

    return `${selectedCount} of ${totalCount} services selected`;
  };

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BuildIcon fontSize="small" color="primary" />
        Dynamic Header Configuration
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        This header component loads services from your API automatically
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Current configuration:
        </Typography>
        <br />
        <Chip
          label={getServiceConfigSummary()}
          size="small"
          color={selectedComponent.serviceData ? 'success' : 'default'}
          sx={{ mt: 0.5 }}
        />
      </Box>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleConfigureServices}
        startIcon={<SettingsIcon />}
        sx={{ mb: 1 }}
      >
        Configure Services
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
        Select which services appear in your header navigation
      </Typography>

      <ServiceHeaderConfigurator
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSave={handleSaveConfiguration}
        initialSettings={selectedComponent.settings || {}}
        componentId={selectedComponent.instanceId}
      />
    </Box>
  );
};

export default DynamicHeaderHandler;