import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Button,
  Tooltip,
  Chip,
  Alert,
  LinearProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Add as AddIcon
} from '@mui/icons-material';

import ServicePageCanvas from './ServicePageCanvas';
import ServiceComponentLibrary from './ServiceComponentLibrary';
import ContentManager from './ContentManager';
import AIAssistant from './AIAssistant';
import PreviewPanel from './PreviewPanel';
import ConflictResolution from './ConflictResolution';
import DestackUnifiedContentSidebar from './DestackUnifiedContentSidebar';
import { servicePageService } from '../../services/servicePageService';
import UnifiedContentService from '../../services/unifiedContentService';

// Dynamic content editing hook
const useLiveContentEditing = (servicePageId) => {
  const [content, setContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Auto-save function with debounce
  const autoSave = useCallback(async (newContent) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await UnifiedContentService.updateStructuredContent(servicePageId, newContent);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // 2-second debounce
  }, [servicePageId]);

  // Update content with auto-save
  const updateContent = useCallback((newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    autoSave(newContent);
  }, [autoSave]);

  // Generate new content with LLM
  const generateContent = useCallback(async (sections, options = {}) => {
    setIsGenerating(true);
    try {
      const result = await UnifiedContentService.generateAIContent(servicePageId, sections, options);
      if (result.success) {
        const mergedContent = { ...content, ...result.generatedContent };
        updateContent(mergedContent);
        return result;
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [servicePageId, content, updateContent]);

  return {
    content,
    setContent,
    updateContent,
    generateContent,
    isGenerating,
    lastSaved,
    hasUnsavedChanges,
    autoSave
  };
};

const EnhancedServicePageEditor = () => {
  const { servicePageId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [servicePage, setServicePage] = useState(null);
  const [activeTab, setActiveTab] = useState('design'); // Start with design tab to show drag & drop
  const [previewMode, setPreviewMode] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  // Drag and drop visual editor state
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editingMode, setEditingMode] = useState('visual'); // 'visual' or 'template'
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);

  // Live content editing
  const {
    content,
    updateContent,
    generateContent,
    isGenerating,
    lastSaved,
    hasUnsavedChanges
  } = useLiveContentEditing(servicePageId);

  // Load service page data
  useEffect(() => {
    const loadServicePage = async () => {
      try {
        setLoading(true);
        const response = await servicePageService.getServicePage(servicePageId);
        if (response.success) {
          setServicePage(response.data);
          setContent(response.data.content || {});

          // Load unified content for drag & drop components
          const unifiedResponse = await UnifiedContentService.getUnifiedContent(servicePageId);
          if (unifiedResponse.success) {
            setComponents(unifiedResponse.data.components || []);
            setConflicts(unifiedResponse.data.conflicts || []);
            setSyncStatus(unifiedResponse.data.syncStatus);
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error('Failed to load service page:', error);
        setNotification({
          open: true,
          message: `Failed to load service page: ${error.message}`,
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (servicePageId) {
      loadServicePage();
    }
  }, [servicePageId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle AI content generation
  const handleGenerateContent = async (sections, options) => {
    try {
      const result = await generateContent(sections, options);
      setNotification({
        open: true,
        message: `Generated ${sections.length} content sections successfully! Used ${result.tokensUsed} tokens.`,
        type: 'success'
      });
      setShowAIDialog(false);
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to generate content: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Handle publish
  const handlePublish = async () => {
    try {
      const response = await servicePageService.publishServicePage(servicePageId);
      if (response.success) {
        setServicePage(prev => ({ ...prev, status: 'published' }));
        setNotification({
          open: true,
          message: 'Service page published successfully!',
          type: 'success'
        });
        setPublishDialogOpen(false);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to publish: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Handle content field updates
  const handleContentUpdate = (section, field, value) => {
    const newContent = {
      ...content,
      [section]: {
        ...content[section],
        [field]: value
      }
    };
    updateContent(newContent);
  };

  // Handle content list updates (benefits, steps, etc.)
  const handleListUpdate = (section, listField, index, field, value) => {
    const newContent = { ...content };
    if (!newContent[section]) newContent[section] = {};
    if (!newContent[section][listField]) newContent[section][listField] = [];

    newContent[section][listField][index] = {
      ...newContent[section][listField][index],
      [field]: value
    };

    updateContent(newContent);
  };

  // Add new list item
  const handleAddListItem = (section, listField, template) => {
    const newContent = { ...content };
    if (!newContent[section]) newContent[section] = {};
    if (!newContent[section][listField]) newContent[section][listField] = [];

    newContent[section][listField].push({ ...template });
    updateContent(newContent);
  };

  // Remove list item
  const handleRemoveListItem = (section, listField, index) => {
    const newContent = { ...content };
    if (newContent[section] && newContent[section][listField]) {
      newContent[section][listField].splice(index, 1);
      updateContent(newContent);
    }
  };

  // Drag and drop component handlers
  const handleComponentUpdate = async (componentId, updates) => {
    const newComponents = components.map(comp =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);

    // Auto-save components
    try {
      await UnifiedContentService.updateComponents(servicePageId, newComponents, {
        source: 'enhanced_editor',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to save component updates:', error);
    }
  };

  const handleComponentAdd = async (componentData) => {
    const newComponent = {
      id: `comp_${Date.now()}`,
      type: componentData.type,
      props: { ...componentData.defaultProps },
      order: components.length,
      ...componentData
    };

    const newComponents = [...components, newComponent];
    setComponents(newComponents);

    try {
      await UnifiedContentService.updateComponents(servicePageId, newComponents, {
        source: 'enhanced_editor',
        timestamp: Date.now()
      });
      setNotification({
        open: true,
        message: `${componentData.name} component added successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to add component:', error);
      setNotification({
        open: true,
        message: 'Failed to add component',
        type: 'error'
      });
    }
  };

  const handleComponentDelete = async (componentId) => {
    const newComponents = components.filter(comp => comp.id !== componentId);
    setComponents(newComponents);

    try {
      await UnifiedContentService.updateComponents(servicePageId, newComponents, {
        source: 'enhanced_editor',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to delete component:', error);
    }
  };

  const handleComponentReorder = async (reorderedComponents) => {
    setComponents(reorderedComponents);

    try {
      await UnifiedContentService.updateComponents(servicePageId, reorderedComponents, {
        source: 'enhanced_editor',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to reorder components:', error);
    }
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading service page...</Typography>
      </Box>
    );
  }

  if (!servicePage) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">Service page not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" component="h1">
              {servicePage.title}
            </Typography>
            <Chip
              label={servicePage.status}
              color={servicePage.status === 'published' ? 'success' : 'default'}
              size="small"
            />
            {hasUnsavedChanges && (
              <Chip
                icon={<EditIcon />}
                label="Unsaved changes"
                color="warning"
                size="small"
              />
            )}
            {lastSaved && (
              <Typography variant="caption" color="text.secondary">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {activeTab === 'design' && (
              <>
                <Tooltip title="Component Library">
                  <IconButton
                    onClick={() => setShowComponentLibrary(true)}
                    color={showComponentLibrary ? 'primary' : 'default'}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={`Editing Mode: ${editingMode}`}>
                  <Button
                    size="small"
                    variant={editingMode === 'visual' ? 'contained' : 'outlined'}
                    onClick={() => setEditingMode(editingMode === 'visual' ? 'template' : 'visual')}
                  >
                    {editingMode === 'visual' ? 'Visual' : 'Template'}
                  </Button>
                </Tooltip>

                {conflicts.length > 0 && (
                  <Tooltip title={`${conflicts.length} conflicts`}>
                    <Chip
                      icon={<WarningIcon />}
                      label={`${conflicts.length} conflicts`}
                      color="warning"
                      size="small"
                      clickable
                    />
                  </Tooltip>
                )}
              </>
            )}

            <Tooltip title="Generate with AI">
              <IconButton
                onClick={() => setShowAIDialog(true)}
                disabled={isGenerating}
                color="primary"
              >
                {isGenerating ? <CircularProgress size={24} /> : <AIIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Preview">
              <IconButton onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? <HideIcon /> : <ViewIcon />}
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={() => setPublishDialogOpen(true)}
              disabled={servicePage.status === 'published' && !hasUnsavedChanges}
            >
              Publish
            </Button>

            <IconButton onClick={() => navigate(-1)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Content Editor */}
        <Box sx={{ width: previewMode ? '50%' : '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Content" value="content" />
            <Tab label="Design" value="design" />
            <Tab label="SEO" value="seo" />
            <Tab label="Settings" value="settings" />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {activeTab === 'content' && (
              <ContentEditingPanel
                content={content}
                onContentUpdate={handleContentUpdate}
                onListUpdate={handleListUpdate}
                onAddListItem={handleAddListItem}
                onRemoveListItem={handleRemoveListItem}
                isGenerating={isGenerating}
              />
            )}

            {activeTab === 'design' && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Visual Design</Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setShowComponentLibrary(true)}
                    >
                      Add Component
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => window.location.reload()}
                    >
                      Refresh Canvas
                    </Button>
                  </Box>
                </Box>

                <ServicePageCanvas
                  servicePageId={servicePageId}
                  components={components}
                  selectedComponent={selectedComponent}
                  editingMode={editingMode}
                  websiteSettings={{}}
                  onComponentUpdate={handleComponentUpdate}
                  onComponentDelete={handleComponentDelete}
                  onComponentSelect={handleComponentSelect}
                  onComponentReorder={handleComponentReorder}
                  content={content}
                  onContentUpdate={updateContent}
                />
              </Box>
            )}

            {activeTab === 'seo' && (
              <SEOEditingPanel
                seoData={content.seo || {}}
                onSEOUpdate={(field, value) => handleContentUpdate('seo', field, value)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel
                servicePage={servicePage}
                onSettingsUpdate={setServicePage}
              />
            )}
          </Box>
        </Box>

        {/* Right Panel - Preview */}
        {previewMode && (
          <Box sx={{ width: '50%', borderLeft: 1, borderColor: 'divider' }}>
            <PreviewPanel
              servicePageId={servicePageId}
              content={content}
              servicePage={servicePage}
            />
          </Box>
        )}
      </Box>

      {/* AI Generation Dialog */}
      <AIGenerationDialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onGenerate={handleGenerateContent}
        servicePage={servicePage}
        isGenerating={isGenerating}
      />

      {/* Component Library Dialog */}
      <Dialog
        open={showComponentLibrary}
        onClose={() => setShowComponentLibrary(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Component</DialogTitle>
        <DialogContent>
          <ServiceComponentLibrary onComponentSelect={handleComponentAdd} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComponentLibrary(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Resolution */}
      {conflicts.length > 0 && (
        <ConflictResolution
          conflicts={conflicts}
          onResolveConflict={async (conflictId, resolution) => {
            try {
              await UnifiedContentService.resolveConflicts(servicePageId, [{ id: conflictId, resolution }]);
              setConflicts(prev => prev.filter(c => c.id !== conflictId));
              setNotification({
                open: true,
                message: 'Conflict resolved successfully',
                type: 'success'
              });
            } catch (error) {
              setNotification({
                open: true,
                message: 'Failed to resolve conflict',
                type: 'error'
              });
            }
          }}
        />
      )}

      {/* Unified Content Sidebar */}
      <DestackUnifiedContentSidebar
        servicePageId={servicePageId}
        conflicts={conflicts}
        syncStatus={syncStatus}
        onSyncContent={async () => {
          try {
            await UnifiedContentService.syncWithAI(servicePageId);
            setNotification({
              open: true,
              message: 'Content synced successfully',
              type: 'success'
            });
          } catch (error) {
            setNotification({
              open: true,
              message: 'Failed to sync content',
              type: 'error'
            });
          }
        }}
      />

      {/* Publish Dialog */}
      <PublishDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onPublish={handlePublish}
        servicePage={servicePage}
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

// Content Editing Panel Component
const ContentEditingPanel = ({
  content,
  onContentUpdate,
  onListUpdate,
  onAddListItem,
  onRemoveListItem,
  isGenerating
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Content Sections</Typography>

      {/* Hero Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Hero Section</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={content.hero?.title || ''}
                onChange={(e) => onContentUpdate('hero', 'title', e.target.value)}
                placeholder="Professional Service Title"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={content.hero?.subtitle || ''}
                onChange={(e) => onContentUpdate('hero', 'subtitle', e.target.value)}
                placeholder="Expert Care You Can Trust"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={content.hero?.description || ''}
                onChange={(e) => onContentUpdate('hero', 'description', e.target.value)}
                placeholder="Brief description of the service..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CTA Button Text"
                value={content.hero?.ctaText || ''}
                onChange={(e) => onContentUpdate('hero', 'ctaText', e.target.value)}
                placeholder="Schedule Consultation"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Overview Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Overview</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Title"
                value={content.overview?.title || ''}
                onChange={(e) => onContentUpdate('overview', 'title', e.target.value)}
                placeholder="About This Service"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                value={content.overview?.content || ''}
                onChange={(e) => onContentUpdate('overview', 'content', e.target.value)}
                placeholder="Detailed description of the service..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <BenefitsEditor
        benefits={content.benefits?.list || []}
        onListUpdate={onListUpdate}
        onAddListItem={onAddListItem}
        onRemoveListItem={onRemoveListItem}
      />

      {/* Loading overlay when generating */}
      {isGenerating && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Generating content with AI...</Typography>
        </Box>
      )}
    </Box>
  );
};

// Benefits Editor Component
const BenefitsEditor = ({ benefits, onListUpdate, onAddListItem, onRemoveListItem }) => {
  const addBenefit = () => {
    onAddListItem('benefits', 'list', {
      title: 'New Benefit',
      description: 'Benefit description',
      icon: '✨'
    });
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Benefits</Typography>
          <Button startIcon={<AddIcon />} onClick={addBenefit}>
            Add Benefit
          </Button>
        </Box>

        {benefits.map((benefit, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={benefit.title || ''}
                    onChange={(e) => onListUpdate('benefits', 'list', index, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Icon"
                    value={benefit.icon || ''}
                    onChange={(e) => onListUpdate('benefits', 'list', index, 'icon', e.target.value)}
                    placeholder="✨"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => onRemoveListItem('benefits', 'list', index)}
                  >
                    Remove
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={benefit.description || ''}
                    onChange={(e) => onListUpdate('benefits', 'list', index, 'description', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

// SEO Editing Panel
const SEOEditingPanel = ({ seoData, onSEOUpdate }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>SEO Settings</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Meta Title"
            value={seoData.metaTitle || ''}
            onChange={(e) => onSEOUpdate('metaTitle', e.target.value)}
            placeholder="Professional Service | Your Practice Name"
            helperText={`${seoData.metaTitle?.length || 0}/60 characters`}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Meta Description"
            value={seoData.metaDescription || ''}
            onChange={(e) => onSEOUpdate('metaDescription', e.target.value)}
            placeholder="Brief description for search engines..."
            helperText={`${seoData.metaDescription?.length || 0}/160 characters`}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Keywords"
            value={seoData.keywords?.join(', ') || ''}
            onChange={(e) => onSEOUpdate('keywords', e.target.value.split(',').map(k => k.trim()))}
            placeholder="keyword1, keyword2, keyword3"
            helperText="Separate keywords with commas"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Settings Panel
const SettingsPanel = ({ servicePage, onSettingsUpdate }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Page Settings</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Service Name"
            value={servicePage.title || ''}
            onChange={(e) => onSettingsUpdate(prev => ({ ...prev, title: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={servicePage.category || ''}
              onChange={(e) => onSettingsUpdate(prev => ({ ...prev, category: e.target.value }))}
            >
              <MenuItem value="general-dentistry">General Dentistry</MenuItem>
              <MenuItem value="cosmetic-dentistry">Cosmetic Dentistry</MenuItem>
              <MenuItem value="orthodontics">Orthodontics</MenuItem>
              <MenuItem value="oral-surgery">Oral Surgery</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={servicePage.isActive || false}
                onChange={(e) => onSettingsUpdate(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            }
            label="Active on website"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// AI Generation Dialog
const AIGenerationDialog = ({ open, onClose, onGenerate, servicePage, isGenerating }) => {
  const [selectedSections, setSelectedSections] = useState(['hero', 'overview', 'benefits']);
  const [provider, setProvider] = useState('auto');
  const [temperature, setTemperature] = useState(0.7);

  const handleGenerate = () => {
    onGenerate(selectedSections, { provider, temperature });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Content with AI</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select which sections to regenerate using AI for "{servicePage?.title}"
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={selectedSections.includes('hero')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSections(prev => [...prev, 'hero']);
                } else {
                  setSelectedSections(prev => prev.filter(s => s !== 'hero'));
                }
              }}
            />
          }
          label="Hero Section"
        />

        <FormControlLabel
          control={
            <Switch
              checked={selectedSections.includes('overview')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSections(prev => [...prev, 'overview']);
                } else {
                  setSelectedSections(prev => prev.filter(s => s !== 'overview'));
                }
              }}
            />
          }
          label="Overview"
        />

        <FormControlLabel
          control={
            <Switch
              checked={selectedSections.includes('benefits')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSections(prev => [...prev, 'benefits']);
                } else {
                  setSelectedSections(prev => prev.filter(s => s !== 'benefits'));
                }
              }}
            />
          }
          label="Benefits"
        />

        <Box mt={3}>
          <FormControl fullWidth margin="normal">
            <InputLabel>AI Provider</InputLabel>
            <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <MenuItem value="auto">Auto (Best Available)</MenuItem>
              <MenuItem value="google-ai">Google AI (Gemini)</MenuItem>
              <MenuItem value="deepseek">DeepSeek</MenuItem>
              <MenuItem value="mock">Mock (Testing)</MenuItem>
            </Select>
          </FormControl>

          <Typography gutterBottom>Creativity Level: {temperature}</Typography>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={isGenerating || selectedSections.length === 0}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <AIIcon />}
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Publish Dialog
const PublishDialog = ({ open, onClose, onPublish, servicePage }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Publish Service Page</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you ready to publish "{servicePage?.title}"?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This will make the service page visible to visitors on your website.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onPublish} variant="contained" color="primary">
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedServicePageEditor;