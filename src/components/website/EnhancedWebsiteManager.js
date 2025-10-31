import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  LinearProgress,
  Avatar,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import { serviceService } from '../../services/serviceService';
import { servicePageService } from '../../services/servicePageService';
import { websiteService } from '../../services/websiteService';
import UnifiedContentService from '../../services/unifiedContentService';
import DragDropDemoBuilder from './DragDropDemoBuilder';

// Service creation dialog with AI generation
const AIServiceCreationDialog = ({ open, onClose, onServiceCreated, websiteId }) => {
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('general-dentistry');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerate = async () => {
    if (!serviceName.trim()) {
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      // Step 1: Create service
      setGenerationProgress(30);
      const serviceResponse = await serviceService.generateContentFromServiceData({
        serviceName: serviceName.trim(),
        category,
        description: description.trim(),
        websiteId,
        generateSEO: true,
        generateFAQ: true,
        generateProcedure: true,
        generateBenefits: true,
        generateAftercare: true,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
      });

      if (!serviceResponse.success) {
        throw new Error(serviceResponse.message || 'Failed to generate service');
      }

      setGenerationProgress(80);

      // Step 2: Create service page
      const pageResponse = await servicePageService.createServicePage({
        title: serviceName,
        serviceName,
        category,
        websiteId,
        content: serviceResponse.data.page?.content || {},
        status: 'draft'
      });

      setGenerationProgress(100);

      if (pageResponse.success) {
        onServiceCreated(pageResponse.data);
        onClose();
        // Reset form
        setServiceName('');
        setCategory('general-dentistry');
        setDescription('');
        setKeywords('');
      } else {
        throw new Error(pageResponse.message || 'Failed to create service page');
      }

    } catch (error) {
      console.error('Service generation failed:', error);
      alert(`Failed to generate service: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AIIcon color="primary" />
          Create Service with AI
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., Teeth Whitening"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <MenuItem value="general-dentistry">General Dentistry</MenuItem>
                  <MenuItem value="cosmetic-dentistry">Cosmetic Dentistry</MenuItem>
                  <MenuItem value="orthodontics">Orthodontics</MenuItem>
                  <MenuItem value="oral-surgery">Oral Surgery</MenuItem>
                  <MenuItem value="pediatric-dentistry">Pediatric Dentistry</MenuItem>
                  <MenuItem value="periodontics">Periodontics</MenuItem>
                  <MenuItem value="endodontics">Endodontics</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the service to help AI generate better content..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Keywords (Optional)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="teeth whitening, cosmetic dentistry, smile improvement"
                helperText="Comma-separated keywords for SEO optimization"
              />
            </Grid>
          </Grid>

          {isGenerating && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Generating service content with AI...
              </Typography>
              <LinearProgress variant="determinate" value={generationProgress} />
              <Typography variant="caption" color="text.secondary">
                {generationProgress < 30 && 'Preparing AI generation...'}
                {generationProgress >= 30 && generationProgress < 80 && 'Generating content sections...'}
                {generationProgress >= 80 && 'Finalizing service page...'}
              </Typography>
            </Box>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            AI will generate comprehensive content including service overview, benefits, procedure steps,
            FAQ, aftercare instructions, and SEO metadata.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={!serviceName.trim() || isGenerating}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <AIIcon />}
        >
          {isGenerating ? 'Generating...' : 'Generate Service'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Service page card with real-time status
const ServicePageCard = ({
  servicePage,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate,
  onRegenerateContent
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRegenerateContent = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateContent(servicePage.id);
    } finally {
      setIsRegenerating(false);
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckIcon />;
      case 'draft': return <EditIcon />;
      case 'archived': return <ErrorIcon />;
      default: return <WarningIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {isRegenerating && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
          <LinearProgress />
        </Box>
      )}

      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" noWrap>
            {servicePage.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={getStatusIcon(servicePage.status)}
              label={servicePage.status}
              color={getStatusColor(servicePage.status)}
              size="small"
            />
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {servicePage.description || servicePage.content?.overview?.content?.substring(0, 120) + '...' || 'No description available'}
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Chip label={servicePage.category} size="small" variant="outlined" />
          {servicePage.isAIGenerated && (
            <Chip icon={<AIIcon />} label="AI Generated" size="small" color="primary" variant="outlined" />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(servicePage.updatedAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(servicePage.id)}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<PreviewIcon />}
          onClick={() => window.open(`/preview/service/${servicePage.id}`, '_blank')}
        >
          Preview
        </Button>
        {servicePage.status !== 'published' && (
          <Button
            size="small"
            startIcon={<PublishIcon />}
            onClick={() => onPublish(servicePage.id)}
            color="primary"
          >
            Publish
          </Button>
        )}
      </CardActions>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={() => { onEdit(servicePage.id); handleMenuClose(); }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent onClick={() => { onDuplicate(servicePage.id); handleMenuClose(); }}>
          <ListItemIcon><CopyIcon /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent onClick={handleRegenerateContent} disabled={isRegenerating}>
          <ListItemIcon>{isRegenerating ? <CircularProgress size={20} /> : <AIIcon />}</ListItemIcon>
          <ListItemText>Regenerate Content</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent onClick={() => { onDelete(servicePage.id); handleMenuClose(); }}>
          <ListItemIcon><DeleteIcon /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItemComponent>
      </Menu>
    </Card>
  );
};

// Main Enhanced Website Manager Component
const EnhancedWebsiteManager = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [servicePages, setServicePages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'demo'

  // Load websites
  const loadWebsites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await websiteService.getWebsites();
      if (response.success) {
        setWebsites(response.data);
        if (response.data.length > 0 && !selectedWebsite) {
          setSelectedWebsite(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load websites:', error);
      setNotification({
        open: true,
        message: `Failed to load websites: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite]);

  // Load service pages for selected website
  const loadServicePages = useCallback(async () => {
    if (!selectedWebsite) return;

    try {
      setPagesLoading(true);
      const response = await servicePageService.getServicePages(selectedWebsite.id);
      if (response.success) {
        setServicePages(response.data);
      }
    } catch (error) {
      console.error('Failed to load service pages:', error);
      setNotification({
        open: true,
        message: `Failed to load service pages: ${error.message}`,
        type: 'error'
      });
    } finally {
      setPagesLoading(false);
    }
  }, [selectedWebsite]);

  // Load data on mount and when selected website changes
  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  useEffect(() => {
    loadServicePages();
  }, [loadServicePages, selectedWebsite]);

  // Handle service creation
  const handleServiceCreated = (newServicePage) => {
    setServicePages(prev => [newServicePage, ...prev]);
    setNotification({
      open: true,
      message: `Service "${newServicePage.title}" created successfully!`,
      type: 'success'
    });
  };

  // Handle service page edit
  const handleEditServicePage = (servicePageId) => {
    navigate(`/doctor/websites/service-page/${servicePageId}/edit`);
  };

  // Handle service page publish
  const handlePublishServicePage = async (servicePageId) => {
    try {
      const response = await servicePageService.publishServicePage(servicePageId);
      if (response.success) {
        setServicePages(prev =>
          prev.map(page =>
            page.id === servicePageId
              ? { ...page, status: 'published' }
              : page
          )
        );
        setNotification({
          open: true,
          message: 'Service page published successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to publish: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Handle service page deletion
  const handleDeleteServicePage = async (servicePageId) => {
    if (!window.confirm('Are you sure you want to delete this service page?')) {
      return;
    }

    try {
      const response = await servicePageService.deleteServicePage(servicePageId);
      if (response.success) {
        setServicePages(prev => prev.filter(page => page.id !== servicePageId));
        setNotification({
          open: true,
          message: 'Service page deleted successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to delete: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Handle service page duplication
  const handleDuplicateServicePage = async (servicePageId) => {
    try {
      const response = await servicePageService.duplicateServicePage(servicePageId);
      if (response.success) {
        setServicePages(prev => [response.data, ...prev]);
        setNotification({
          open: true,
          message: 'Service page duplicated successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to duplicate: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Handle content regeneration
  const handleRegenerateContent = async (servicePageId) => {
    try {
      const servicePage = servicePages.find(p => p.id === servicePageId);
      if (!servicePage) return;

      const result = await UnifiedContentService.generateAIContent(servicePageId, [], {
        provider: 'auto',
        temperature: 0.7
      });

      if (result.success) {
        setNotification({
          open: true,
          message: `Content regenerated successfully! Used ${result.tokensUsed} tokens.`,
          type: 'success'
        });
        // Reload service pages to show updated content
        loadServicePages();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to regenerate content: ${error.message}`,
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading websites...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Website Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your dental practice websites and service pages
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          {activeTab === 'services' && (
            <>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadServicePages}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AIIcon />}
                onClick={() => setCreateDialogOpen(true)}
                disabled={!selectedWebsite}
              >
                Create Service with AI
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box mb={4}>
        <Paper sx={{ p: 1 }}>
          <Box display="flex" gap={1}>
            <Button
              variant={activeTab === 'services' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('services')}
              startIcon={<SettingsIcon />}
            >
              Service Management
            </Button>
            <Button
              variant={activeTab === 'demo' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('demo')}
              startIcon={<PreviewIcon />}
            >
              🎨 Drag & Drop Demo
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Website Selection */}
      {websites.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Select Website
          </Typography>
          <Grid container spacing={2}>
            {websites.map((website) => (
              <Grid item xs={12} sm={6} md={4} key={website.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedWebsite?.id === website.id ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => setSelectedWebsite(website)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {website.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{website.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {website.subdomain}.yoursite.com
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Content based on active tab */}
      {activeTab === 'services' && selectedWebsite && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Service Pages for {selectedWebsite.name}
            </Typography>
            <Badge badgeContent={servicePages.length} color="primary">
              <Typography variant="body2" color="text.secondary">
                Total Services
              </Typography>
            </Badge>
          </Box>

          {pagesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : servicePages.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No service pages yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first service page to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AIIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Service with AI
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {servicePages.map((servicePage) => (
                <Grid item xs={12} sm={6} md={4} key={servicePage.id}>
                  <ServicePageCard
                    servicePage={servicePage}
                    onEdit={handleEditServicePage}
                    onDelete={handleDeleteServicePage}
                    onPublish={handlePublishServicePage}
                    onDuplicate={handleDuplicateServicePage}
                    onRegenerateContent={handleRegenerateContent}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Drag & Drop Demo Tab */}
      {activeTab === 'demo' && (
        <Box>
          <DragDropDemoBuilder
            servicePageId={servicePages.length > 0 ? servicePages[0].id : null}
          />
        </Box>
      )}

      {/* Floating Action Button */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<AIIcon />}
          tooltipTitle="Create Service with AI"
          onClick={() => setCreateDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<RefreshIcon />}
          tooltipTitle="Refresh Data"
          onClick={loadServicePages}
        />
        <SpeedDialAction
          icon={<AnalyticsIcon />}
          tooltipTitle="View Analytics"
          onClick={() => navigate('/doctor/analytics')}
        />
      </SpeedDial>

      {/* AI Service Creation Dialog */}
      <AIServiceCreationDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onServiceCreated={handleServiceCreated}
        websiteId={selectedWebsite?.id}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedWebsiteManager;