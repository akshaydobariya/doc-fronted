import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AIIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Launch as LaunchIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Check as CheckIcon
} from '@mui/icons-material';
// Removed defaultDentalServices import - using only API data

const ServiceManager = ({ websiteId, onServiceSelected, onHeaderUpdateRequired }) => {
  // State management
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(new Set());
  const [servicePages, setServicePages] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Dialog states
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewService, setPreviewService] = useState(null);
  const [generationDialogOpen, setGenerationDialogOpen] = useState(false);

  // Generation settings
  const [generationSettings, setGenerationSettings] = useState({
    provider: 'auto',
    temperature: 0.7,
    generateSEO: true,
    generateFAQ: true,
    customKeywords: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchServices();
    fetchCategories();
    if (websiteId) {
      fetchServicePages();
    }
  }, [websiteId]);

  // Fetch all available services
  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?isActive=true', {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      const servicesList = data.data || [];

      // Only use API data - no fallback to default services
      setServices(servicesList);

      if (servicesList.length === 0) {
        console.log('No services found in database - showing empty state');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // On error, show empty state instead of fallback
      setServices([]);
      setError('Failed to load services. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch service categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/services/categories', {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      const categoriesList = data.data || [];

      // Only use API data - no fallback to default categories
      setCategories(categoriesList);

      if (categoriesList.length === 0) {
        console.log('No categories found in database - showing empty state');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // On error, show empty categories instead of fallback
      setCategories([]);
    }
  };

  // Fetch existing service pages for this website
  const fetchServicePages = async () => {
    try {
      const response = await fetch(`/api/services/pages?websiteId=${websiteId}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch service pages');

      const data = await response.json();
      setServicePages(data.data || []);

      // Mark services that already have pages as selected
      const existingServiceIds = new Set(
        data.data.map(page => page.serviceId._id || page.serviceId)
      );
      setSelectedServices(existingServiceIds);

    } catch (error) {
      console.error('Error fetching service pages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;

    const matchesSelection = !showOnlySelected || selectedServices.has(service._id);

    return matchesSearch && matchesCategory && matchesSelection;
  });

  // Toggle service selection
  const toggleServiceSelection = (serviceId) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
      // Notify parent component that a service was added to selection
      if (onServiceSelected) {
        const service = services.find(s => s._id === serviceId);
        onServiceSelected(service);
      }
    }
    setSelectedServices(newSelected);
  };

  // Generate service pages for selected services
  const generateServicePages = async () => {
    if (selectedServices.size === 0) {
      showSnackbar('Please select at least one service', 'warning');
      return;
    }

    setGenerating(true);
    setGenerationDialogOpen(false);

    try {
      const promises = Array.from(selectedServices).map(async (serviceId) => {
        // Check if page already exists
        const existingPage = servicePages.find(page =>
          (page.serviceId._id || page.serviceId) === serviceId
        );

        if (existingPage) {
          return { serviceId, status: 'exists', page: existingPage };
        }

        // Generate new service page
        const service = services.find(s => s._id === serviceId);
        if (!service) return { serviceId, status: 'error', error: 'Service not found' };

        // First generate content with LLM
        const contentResponse = await fetch(`/api/services/${serviceId}/generate-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            contentType: 'full-page',
            provider: generationSettings.provider,
            temperature: generationSettings.temperature,
            keywords: generationSettings.customKeywords.split(',').map(k => k.trim()).filter(Boolean)
          })
        });

        if (!contentResponse.ok) {
          throw new Error(`Failed to generate content for ${service.name}`);
        }

        const contentData = await contentResponse.json();

        // Then create the service page
        const pageResponse = await fetch('/api/services/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            websiteId,
            serviceId,
            content: contentData.data.content,
            autoGenerate: true
          })
        });

        if (!pageResponse.ok) {
          throw new Error(`Failed to create page for ${service.name}`);
        }

        const pageData = await pageResponse.json();
        return { serviceId, status: 'created', page: pageData.data };
      });

      const results = await Promise.allSettled(promises);

      let createdCount = 0;
      let errorCount = 0;
      let existingCount = 0;

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { status } = result.value;
          if (status === 'created') createdCount++;
          else if (status === 'exists') existingCount++;
          else errorCount++;
        } else {
          errorCount++;
        }
      });

      // Refresh service pages
      await fetchServicePages();

      // Notify parent component to update headers with new services
      if (createdCount > 0 && onHeaderUpdateRequired) {
        const newlyCreatedServices = results
          .filter(result => result.status === 'fulfilled' && result.value.status === 'created')
          .map(result => {
            const serviceId = result.value.serviceId;
            return services.find(s => s._id === serviceId);
          })
          .filter(Boolean);

        onHeaderUpdateRequired(newlyCreatedServices);
      }

      // Show summary
      let message = '';
      if (createdCount > 0) message += `${createdCount} pages generated. `;
      if (existingCount > 0) message += `${existingCount} already existed. `;
      if (errorCount > 0) message += `${errorCount} failed.`;

      showSnackbar(message || 'Operation completed', errorCount > 0 ? 'warning' : 'success');

    } catch (error) {
      console.error('Error generating service pages:', error);
      showSnackbar('Failed to generate service pages', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Get category display info
  const getCategoryInfo = (categoryKey) => {
    return categories.find(cat => cat.key === categoryKey) ||
           { name: categoryKey || 'General', icon: '🦷' };
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle service preview
  const handlePreviewService = (service) => {
    setPreviewService(service);
    setPreviewDialogOpen(true);
  };

  // Check if service has existing page
  const hasExistingPage = (serviceId) => {
    return servicePages.some(page =>
      (page.serviceId._id || page.serviceId) === serviceId
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Service Management
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Select dental services to include in your website. Generate AI-powered content for each service page.
        </Typography>

        {/* Controls */}
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mt={2}>
          <TextField
            size="small"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.key} value={category.key}>
                  {category.icon} {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showOnlySelected}
                onChange={(e) => setShowOnlySelected(e.target.checked)}
                size="small"
              />
            }
            label="Show selected only"
          />

          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={`${selectedServices.size} selected`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      {/* Services Grid */}
      <Grid container spacing={2}>
        {filteredServices.map(service => {
          const isSelected = selectedServices.has(service._id);
          const hasPage = hasExistingPage(service._id);
          const categoryInfo = getCategoryInfo(service.category);

          return (
            <Grid item xs={12} sm={6} md={4} key={service._id}>
              <Card
                sx={{
                  height: '100%',
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  position: 'relative'
                }}
              >
                {hasPage && (
                  <Chip
                    size="small"
                    label="Page Created"
                    color="success"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                  />
                )}

                <CardContent sx={{ pb: 1 }}>
                  <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1.1rem' }}>
                      {service.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={categoryInfo.name}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {service.shortDescription}
                  </Typography>

                  {service.benefits && service.benefits.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Key Benefits:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        • {service.benefits.slice(0, 2).join(' • ')}
                        {service.benefits.length > 2 && '...'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant={isSelected ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => toggleServiceSelection(service._id)}
                    startIcon={isSelected ? <CheckIcon /> : <AddIcon />}
                    sx={{ flexGrow: 1 }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>

                  <Tooltip title="Preview Service">
                    <IconButton
                      size="small"
                      onClick={() => handlePreviewService(service)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No services found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Paper>
      )}

      {/* Action Bar */}
      {selectedServices.size > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 2,
            zIndex: 1300,
            display: 'flex',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Typography variant="body2">
            {selectedServices.size} service{selectedServices.size !== 1 ? 's' : ''} selected
          </Typography>

          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} /> : <AIIcon />}
            onClick={() => setGenerationDialogOpen(true)}
            disabled={generating}
          >
            Generate Pages
          </Button>

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsDialogOpen(true)}
          >
            Settings
          </Button>
        </Paper>
      )}

      {/* Generation Settings Dialog */}
      <Dialog open={generationDialogOpen} onClose={() => setGenerationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Service Pages</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Generate AI-powered content for {selectedServices.size} selected service{selectedServices.size !== 1 ? 's' : ''}.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>AI Provider</InputLabel>
              <Select
                value={generationSettings.provider}
                onChange={(e) => setGenerationSettings(prev => ({
                  ...prev,
                  provider: e.target.value
                }))}
                label="AI Provider"
              >
                <MenuItem value="auto">Auto (Best Available)</MenuItem>
                <MenuItem value="google-ai">Google AI Studio</MenuItem>
                <MenuItem value="deepseek">DeepSeek</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Custom Keywords (comma-separated)"
              value={generationSettings.customKeywords}
              onChange={(e) => setGenerationSettings(prev => ({
                ...prev,
                customKeywords: e.target.value
              }))}
              placeholder="dental care, oral health, smile makeover..."
              sx={{ mb: 2 }}
            />

            <Box display="flex" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={generationSettings.generateSEO}
                    onChange={(e) => setGenerationSettings(prev => ({
                      ...prev,
                      generateSEO: e.target.checked
                    }))}
                  />
                }
                label="Generate SEO metadata"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={generationSettings.generateFAQ}
                    onChange={(e) => setGenerationSettings(prev => ({
                      ...prev,
                      generateFAQ: e.target.checked
                    }))}
                  />
                }
                label="Include FAQ section"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerationDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={generateServicePages} variant="contained">
            Generate Pages
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {previewService?.name}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setPreviewDialogOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewService && (
            <Box>
              <Chip
                label={getCategoryInfo(previewService.category).name}
                size="small"
                sx={{ mb: 2 }}
              />

              <Typography variant="body1" paragraph>
                {previewService.fullDescription || previewService.shortDescription}
              </Typography>

              {previewService.benefits && previewService.benefits.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Benefits</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {previewService.benefits.map((benefit, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}

              {previewService.faqs && previewService.faqs.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">FAQs</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {previewService.faqs.map((faq, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {faq.question}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {faq.answer}
                        </Typography>
                        {index < previewService.faqs.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              )}

              {previewService.seo && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">SEO Information</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="caption" color="textSecondary">Meta Title:</Typography>
                    <Typography variant="body2" gutterBottom>{previewService.seo.metaTitle}</Typography>

                    <Typography variant="caption" color="textSecondary">Meta Description:</Typography>
                    <Typography variant="body2" gutterBottom>{previewService.seo.metaDescription}</Typography>

                    {previewService.seo.keywords && previewService.seo.keywords.length > 0 && (
                      <>
                        <Typography variant="caption" color="textSecondary">Keywords:</Typography>
                        <Box sx={{ mt: 1 }}>
                          {previewService.seo.keywords.map((keyword, index) => (
                            <Chip key={index} label={keyword} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))}
                        </Box>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ServiceManager;