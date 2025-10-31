import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  MedicalServices as ServiceIcon,
  Add as AddIcon,
  Settings as ConfigIcon
} from '@mui/icons-material';
import serviceService from '../../services/serviceService';

/**
 * Enhanced Service Selector
 * Allows doctors to:
 * 1. Select multiple services
 * 2. Generate LLM content for all selected services
 * 3. Configure services for header navigation
 * 4. Add services to main website (integrated pages, not published separately)
 */
const EnhancedServiceSelector = ({
  websiteId,
  onClose,
  onServicesGenerated,
  mode = 'selection' // 'selection' | 'generation' | 'configuration'
}) => {
  // State management
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generation state
  const [activeStep, setActiveStep] = useState(0);
  const [generationProgress, setGenerationProgress] = useState({});
  const [generationResults, setGenerationResults] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Configuration state
  const [headerConfig, setHeaderConfig] = useState({
    showInNavigation: true,
    groupByCategory: true,
    maxServicesInDropdown: 12
  });

  const steps = [
    'Select Services',
    'Generate Content',
    'Add to Website',
    'Configure Navigation'
  ];

  useEffect(() => {
    loadServicesData();
  }, []);

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
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load services. Please try again.');
      setServices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Service selection handlers
  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(service => service._id));
    }
  };

  const handleSelectByCategory = (categoryId) => {
    const categoryServices = services.filter(service => service.category === categoryId);
    const categoryServiceIds = categoryServices.map(service => service._id);

    const allCategorySelected = categoryServiceIds.every(id =>
      selectedServices.includes(id)
    );

    if (allCategorySelected) {
      // Deselect all in category
      setSelectedServices(prev =>
        prev.filter(id => !categoryServiceIds.includes(id))
      );
    } else {
      // Select all in category
      setSelectedServices(prev =>
        [...new Set([...prev, ...categoryServiceIds])]
      );
    }
  };

  // Content generation handlers
  const handleGenerateContent = async () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service to generate content.');
      return;
    }

    setIsGenerating(true);
    setActiveStep(1);
    setError(null);

    const selectedServiceData = services.filter(service =>
      selectedServices.includes(service._id)
    );

    // Initialize progress tracking
    const progress = {};
    selectedServiceData.forEach(service => {
      progress[service._id] = {
        status: 'pending',
        progress: 0,
        error: null,
        result: null
      };
    });
    setGenerationProgress(progress);

    try {
      // Generate content for all selected services in parallel
      const generationPromises = selectedServiceData.map(async (service) => {
        try {
          // Update progress - starting
          setGenerationProgress(prev => ({
            ...prev,
            [service._id]: { ...prev[service._id], status: 'generating', progress: 25 }
          }));

          // Call LLM service to generate content and create service page
          const response = await serviceService.generateContentFromServiceData({
            serviceName: service.name,
            category: service.category,
            description: service.shortDescription,
            websiteId: websiteId,
            generateSEO: true,
            generateFAQ: true,
            generateProcedure: true,
            generateBenefits: true
          });

          // Update progress - content generated and page created
          setGenerationProgress(prev => ({
            ...prev,
            [service._id]: { ...prev[service._id], progress: 100 }
          }));

          // Note: generateContentFromServiceData already creates the service page
          // No need to call createServicePage again

          // Update progress - completed
          setGenerationProgress(prev => ({
            ...prev,
            [service._id]: {
              ...prev[service._id],
              status: 'completed',
              progress: 100,
              result: {
                service: response.data.service, // Use service from response
                content: response.data.page.content, // Use page content from response
                seo: response.data.page.seo, // Use page SEO from response
                page: response.data.page // Use page from response
              }
            }
          }));

          return {
            serviceId: service._id,
            success: true,
            data: {
              service: response.data.service,
              content: response.data.page.content,
              seo: response.data.page.seo,
              page: response.data.page // Use page from response
            }
          };

        } catch (error) {
          console.error(`Error generating content for ${service.name}:`, error);

          // Update progress - error
          setGenerationProgress(prev => ({
            ...prev,
            [service._id]: {
              ...prev[service._id],
              status: 'error',
              error: error.message || 'Generation failed'
            }
          }));

          return {
            serviceId: service._id,
            success: false,
            error: error.message || 'Generation failed'
          };
        }
      });

      // Wait for all generations to complete
      const results = await Promise.allSettled(generationPromises);

      // Process results
      const generationResults = {};
      results.forEach((result, index) => {
        const serviceId = selectedServiceData[index]._id;
        if (result.status === 'fulfilled' && result.value.success) {
          generationResults[serviceId] = result.value.data;
        }
      });

      setGenerationResults(generationResults);

      // Check if any generation was successful
      const successfulGenerations = Object.keys(generationResults);
      if (successfulGenerations.length > 0) {
        setActiveStep(2); // Move to configuration step

        if (onServicesGenerated) {
          onServicesGenerated({
            generatedServices: generationResults,
            selectedServiceIds: selectedServices,
            totalSelected: selectedServices.length,
            successfulGenerations: successfulGenerations.length
          });
        }
      } else {
        setError('Failed to generate content for any selected services. Please try again.');
      }

    } catch (error) {
      console.error('Batch generation error:', error);
      setError('Failed to start content generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Configuration handlers
  const handleConfigureNavigation = async () => {
    const successfulServices = Object.keys(generationResults);

    if (headerConfig.showInNavigation && successfulServices.length > 0) {
      // Auto-configure header with generated services
      const headerConfiguration = {
        selectedServices: successfulServices,
        websiteId,
        showAllServices: false,
        groupByCategory: headerConfig.groupByCategory,
        maxServicesInDropdown: headerConfig.maxServicesInDropdown,
        siteName: "Dental Practice", // TODO: Get from website config
        primaryColor: "#007cba"
      };

      try {
        // Save header configuration (basic implementation)
        console.log('Header configuration:', headerConfiguration);

        // For now, save to localStorage as a temporary solution
        // TODO: Implement proper backend API for navigation configuration
        localStorage.setItem(`navigation_config_${websiteId}`, JSON.stringify(headerConfiguration));

        // Complete the workflow - this is the final step
        setActiveStep(4); // Step 4 = completion state
      } catch (error) {
        console.error('Error configuring navigation:', error);
        setError('Failed to configure navigation. Please try again.');
      }
    } else {
      // Complete the workflow even if not configuring navigation
      setActiveStep(4); // Step 4 = completion state
    }
  };

  // Add to Website handlers
  const handleAddToWebsite = async () => {
    const successfulServices = Object.keys(generationResults);

    try {
      // Mark service pages as integrated into the main website (keep as draft but make them available)
      const integrationPromises = successfulServices.map(async (serviceId) => {
        const result = generationResults[serviceId];

        // Debug logging to understand the structure
        console.log('Generation result for service', serviceId, ':', result);

        // Validate that we have the required data
        if (!result || !result.page || !result.page._id) {
          console.error(`Missing page data for service ${serviceId}. Result structure:`, result);

          // Try to create a service page if it doesn't exist
          // This is a fallback in case the generation didn't create a page properly
          const service = services.find(s => s._id === serviceId);
          if (service) {
            console.log('Attempting to create service page for', service.name);

            // Create a basic service page
            const createResponse = await serviceService.createServicePage({
              websiteId,
              serviceId: serviceId,
              content: result.content || {}, // Fix: use result.content instead of result.llmContent
              seo: result.seo || {},
              autoGenerate: false
            });

            if (createResponse.success && createResponse.data._id) {
              return await serviceService.updateServicePage(createResponse.data._id, {
                status: 'draft',
                isIntegrated: true,
                integratedAt: new Date(),
                websiteSection: 'services'
              });
            }
          }

          throw new Error(`Cannot create or update service page for service ${serviceId}`);
        }

        return await serviceService.updateServicePage(result.page._id, {
          status: 'draft', // Keep as draft but mark as integrated
          isIntegrated: true, // Custom flag to indicate it's part of main website
          integratedAt: new Date(),
          websiteSection: 'services' // Specify where in the website it should appear
        });
      });

      await Promise.all(integrationPromises);

      // Move to Configure Navigation step
      setActiveStep(3);

    } catch (error) {
      console.error('Error adding pages to website:', error);
      setError('Failed to add some pages to website. Please try again.');
    }
  };

  // Render service selection step
  const renderServiceSelection = () => {
    const servicesByCategory = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});

    const getCategoryDisplayName = (categoryId) => {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.name : categoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Select Services ({selectedServices.length} of {services.length} selected)
          </Typography>
          <Button variant="outlined" onClick={handleSelectAll}>
            {selectedServices.length === services.length ? 'Deselect All' : 'Select All'}
          </Button>
        </Box>

        {Object.entries(servicesByCategory).map(([categoryId, categoryServices]) => {
          const selectedInCategory = categoryServices.filter(service =>
            selectedServices.includes(service._id)
          ).length;

          return (
            <Card key={categoryId} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ServiceIcon color="primary" />
                    {getCategoryDisplayName(categoryId)}
                    <Chip
                      size="small"
                      label={`${selectedInCategory}/${categoryServices.length}`}
                      color={selectedInCategory > 0 ? 'primary' : 'default'}
                    />
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleSelectByCategory(categoryId)}
                  >
                    {selectedInCategory === categoryServices.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>

                <Grid container spacing={1}>
                  {categoryServices.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service._id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServices.includes(service._id)}
                            onChange={() => handleServiceToggle(service._id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {service.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              /services/{service.slug}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  // Render generation progress step
  const renderGenerationProgress = () => {
    const selectedServiceData = services.filter(service =>
      selectedServices.includes(service._id)
    );

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Generating Content with AI ({Object.keys(generationResults).length}/{selectedServices.length} completed)
        </Typography>

        <List>
          {selectedServiceData.map((service) => {
            const progress = generationProgress[service._id];
            const isCompleted = progress?.status === 'completed';
            const hasError = progress?.status === 'error';
            const isGenerating = progress?.status === 'generating';

            return (
              <ListItem key={service._id}>
                <ListItemIcon>
                  {isCompleted ? (
                    <CheckIcon color="success" />
                  ) : hasError ? (
                    <ErrorIcon color="error" />
                  ) : isGenerating ? (
                    <CircularProgress size={24} />
                  ) : (
                    <ServiceIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={service.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {hasError ? progress.error :
                         isCompleted ? 'Content generated successfully' :
                         isGenerating ? 'Generating content...' :
                         'Waiting to start'}
                      </Typography>
                      {isGenerating && (
                        <LinearProgress
                          variant="determinate"
                          value={progress.progress || 0}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>

        {!isGenerating && Object.keys(generationResults).length > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Successfully generated content for {Object.keys(generationResults).length} services!
          </Alert>
        )}
      </Box>
    );
  };

  // Render configuration step
  const renderConfiguration = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Configure Navigation
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <FormControlLabel
              control={
                <Checkbox
                  checked={headerConfig.showInNavigation}
                  onChange={(e) => setHeaderConfig(prev => ({
                    ...prev,
                    showInNavigation: e.target.checked
                  }))}
                />
              }
              label="Show services in website navigation header"
            />

            {headerConfig.showInNavigation && (
              <Box sx={{ mt: 2, ml: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={headerConfig.groupByCategory}
                      onChange={(e) => setHeaderConfig(prev => ({
                        ...prev,
                        groupByCategory: e.target.checked
                      }))}
                    />
                  }
                  label="Group services by category in dropdown"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary">
          Generated services will be available at their respective URLs (e.g., /services/teeth-cleaning)
          and {headerConfig.showInNavigation ? 'will appear' : 'will not appear'} in the navigation header.
        </Typography>
      </Box>
    );
  };

  // Render add to website step
  const renderAddToWebsiteStep = () => {
    const successfulServices = Object.keys(generationResults);

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Add Services to Your Website
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          {successfulServices.length} service pages are ready to be integrated into your main website.
          This will add them to your website navigation and make them accessible via internal links.
        </Alert>

        <List>
          {successfulServices.map((serviceId) => {
            const result = generationResults[serviceId];
            return (
              <ListItem key={serviceId}>
                <ListItemIcon>
                  <AddIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={result.service.name}
                  secondary={`Will be available at: /services/${result.service.slug}`}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  };

  if (loading) {
    return (
      <Dialog open={true} maxWidth="md" fullWidth>
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
    <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          AI Service Content Generator
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>Select Services</StepLabel>
            <StepContent>
              {renderServiceSelection()}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateContent}
                  disabled={selectedServices.length === 0 || isGenerating}
                  startIcon={<AIIcon />}
                >
                  Generate Content for {selectedServices.length} Services
                </Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Generate Content</StepLabel>
            <StepContent>
              {renderGenerationProgress()}
              {!isGenerating && Object.keys(generationResults).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                    startIcon={<AddIcon />}
                  >
                    Continue to Add Services
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Add to Website</StepLabel>
            <StepContent>
              {renderAddToWebsiteStep()}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAddToWebsite}
                  startIcon={<AddIcon />}
                  color="success"
                >
                  Add {Object.keys(generationResults).length} Services to Website
                </Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Configure Navigation</StepLabel>
            <StepContent>
              {renderConfiguration()}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleConfigureNavigation}
                  startIcon={<ConfigIcon />}
                >
                  Save Configuration
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" color="primary">
              🎉 All services have been generated and added to your website successfully!
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Your service pages are now integrated into your main website and will appear in the navigation header.
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {activeStep === steps.length ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedServiceSelector;