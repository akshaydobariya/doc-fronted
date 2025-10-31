import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  Divider
} from '@mui/material';
import serviceService from '../../services/serviceService';
import { serviceHeaderMapper } from '../../utils/serviceHeaderMapping';

/**
 * Service Header Configurator
 * Allows doctors to select which services appear in their header navigation
 * Integrates with the drag-and-drop website builder
 */
const ServiceHeaderConfigurator = ({
  open,
  onClose,
  onSave,
  initialSettings = {},
  componentId = null
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);

  // Configuration state
  const [config, setConfig] = useState({
    selectedServices: [],
    logoUrl: '',
    siteName: 'Your Practice Name',
    primaryColor: '#007cba',
    textColor: '#333',
    showAllServices: false,
    groupByCategory: true,
    maxServicesInDropdown: 12,
    customNavigation: [],
    ...initialSettings
  });

  useEffect(() => {
    if (open) {
      loadServicesData();
    }
  }, [open]);

  const loadServicesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceService.getAllServices({ isActive: true }),
        serviceService.getCategories()
      ]);

      setServices(servicesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Failed to load services. Please try again.');
      setServices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setConfig(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleSelectAllInCategory = (categoryId) => {
    const categoryServices = services.filter(service => service.category === categoryId);
    const categoryServiceIds = categoryServices.map(service => service._id);

    const allSelected = categoryServiceIds.every(id => config.selectedServices.includes(id));

    if (allSelected) {
      // Deselect all in category
      setConfig(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.filter(id => !categoryServiceIds.includes(id))
      }));
    } else {
      // Select all in category
      setConfig(prev => ({
        ...prev,
        selectedServices: [...new Set([...prev.selectedServices, ...categoryServiceIds])]
      }));
    }
  };

  const handleSelectAll = () => {
    if (config.selectedServices.length === services.length) {
      setConfig(prev => ({ ...prev, selectedServices: [] }));
    } else {
      setConfig(prev => ({ ...prev, selectedServices: services.map(service => service._id) }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Generate the dynamic header component with current settings
      const headerComponent = await serviceHeaderMapper.generateDynamicHeaderComponent(config);

      // Call the onSave callback with the component data
      if (onSave) {
        await onSave({
          componentId,
          settings: config,
          component: headerComponent,
          selectedServicesCount: config.selectedServices.length,
          totalServicesCount: services.length
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving header configuration:', error);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const headerComponent = await serviceHeaderMapper.generateDynamicHeaderComponent(config);

      // Open preview in new window
      const previewWindow = window.open('', '_blank', 'width=1200,height=800');
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Header Preview</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">Header Preview</h3>
            <p style="margin: 0; color: #666;">Services selected: ${config.selectedServices.length} of ${services.length}</p>
          </div>
          ${headerComponent.component}
        </body>
        </html>
      `);
      previewWindow.document.close();
    } catch (error) {
      console.error('Error generating preview:', error);
      setError('Failed to generate preview.');
    }
  };

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  const getCategoryDisplayName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? String(category.name) : String(categoryId).replace('-', ' ');
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Loading services...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Configure Header Navigation Services
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Choose which services to display in your website header navigation
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Service Selection" />
          <Tab label="Appearance" />
          <Tab label="Advanced" />
        </Tabs>

        {/* Service Selection Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Select Services ({config.selectedServices.length} of {services.length} selected)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleSelectAll}>
                  {config.selectedServices.length === services.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button size="small" variant="outlined" onClick={handlePreview}>
                  Preview
                </Button>
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={config.showAllServices}
                  onChange={(e) => setConfig(prev => ({ ...prev, showAllServices: e.target.checked }))}
                />
              }
              label="Show all services automatically (ignores selection below)"
              sx={{ mb: 2 }}
            />

            {!config.showAllServices && (
              <Box>
                {Object.entries(servicesByCategory).map(([categoryId, categoryServices]) => {
                  const selectedInCategory = categoryServices.filter(service =>
                    config.selectedServices.includes(service._id)
                  ).length;
                  const allSelected = selectedInCategory === categoryServices.length;

                  return (
                    <Box key={categoryId} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            label={String(categories.find(cat => cat.id === categoryId)?.icon || '🦷')}
                          />
                          {getCategoryDisplayName(categoryId)}
                          <Chip
                            size="small"
                            label={`${Number(selectedInCategory) || 0}/${Number(categoryServices.length) || 0}`}
                            color={selectedInCategory > 0 ? 'primary' : 'default'}
                          />
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => handleSelectAllInCategory(categoryId)}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </Box>

                      <FormGroup row>
                        {categoryServices.map((service) => (
                          <FormControlLabel
                            key={service._id}
                            control={
                              <Checkbox
                                checked={config.selectedServices.includes(service._id)}
                                onChange={() => handleServiceToggle(service._id)}
                              />
                            }
                            label={
                              <div>
                                <div style={{ fontSize: '0.875rem', lineHeight: 1.43 }}>
                                  {String(service.name || 'Untitled Service')}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.5 }}>
                                  /services/{String(service.slug || 'untitled')}
                                </div>
                              </div>
                            }
                            sx={{ minWidth: 300, mb: 1 }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Practice Name"
              value={config.siteName}
              onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
              fullWidth
              helperText="This will appear as your logo text if no logo image is provided"
            />

            <TextField
              label="Logo URL"
              value={config.logoUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
              fullWidth
              helperText="Optional: URL to your practice logo image"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Primary Color"
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                sx={{ minWidth: 120 }}
                helperText="Main brand color"
              />

              <TextField
                label="Text Color"
                type="color"
                value={config.textColor}
                onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                sx={{ minWidth: 120 }}
                helperText="Navigation text color"
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Advanced Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.groupByCategory}
                  onChange={(e) => setConfig(prev => ({ ...prev, groupByCategory: e.target.checked }))}
                />
              }
              label="Group services by category in dropdown"
            />

            <TextField
              label="Max Services in Dropdown"
              type="number"
              value={config.maxServicesInDropdown}
              onChange={(e) => setConfig(prev => ({ ...prev, maxServicesInDropdown: parseInt(e.target.value) }))}
              inputProps={{ min: 1, max: 50 }}
              helperText="Maximum number of services to show in dropdown menu"
            />

            <Divider />

            <Typography variant="h6">Custom Navigation Links</Typography>
            <Typography variant="body2" color="text.secondary">
              Add additional menu items to your navigation
            </Typography>

            {config.customNavigation.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Link Name"
                  value={item.name || ''}
                  onChange={(e) => {
                    const newCustomNav = [...config.customNavigation];
                    newCustomNav[index] = { ...newCustomNav[index], name: e.target.value };
                    setConfig(prev => ({ ...prev, customNavigation: newCustomNav }));
                  }}
                  size="small"
                />
                <TextField
                  label="URL"
                  value={item.url || ''}
                  onChange={(e) => {
                    const newCustomNav = [...config.customNavigation];
                    newCustomNav[index] = { ...newCustomNav[index], url: e.target.value };
                    setConfig(prev => ({ ...prev, customNavigation: newCustomNav }));
                  }}
                  size="small"
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    const newCustomNav = config.customNavigation.filter((_, i) => i !== index);
                    setConfig(prev => ({ ...prev, customNavigation: newCustomNav }));
                  }}
                >
                  Remove
                </Button>
              </Box>
            ))}

            <Button
              variant="outlined"
              onClick={() => {
                setConfig(prev => ({
                  ...prev,
                  customNavigation: [...prev.customNavigation, { name: '', url: '' }]
                }));
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Custom Link
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handlePreview} variant="outlined" disabled={saving}>
          Preview
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceHeaderConfigurator;