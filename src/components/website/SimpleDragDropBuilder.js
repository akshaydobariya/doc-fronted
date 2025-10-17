import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  Stack,
  AppBar,
  Toolbar,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  ArrowBack as BackIcon,
  Publish as PublishIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TextFields as TextIcon
} from '@mui/icons-material';
import PageBuilderErrorBoundary from './PageBuilderErrorBoundary';
import websiteService from '../../services/websiteService';

/**
 * Simple Drag Drop Builder - Clean implementation without Destack complications
 */
const SimpleDragDropBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const websiteId = searchParams.get('websiteId');

  // Website state
  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Component filter state
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);

  // Canvas state
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [nextId, setNextId] = useState(1);

  // Text editing state
  const [textEditDialogOpen, setTextEditDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [extractedTexts, setExtractedTexts] = useState([]);

  // Available categories and tags for filtering
  const categories = [
    { value: 'all', label: 'All Components' },
    { value: 'layout', label: 'Layout' },
    { value: 'content', label: 'Content' },
    { value: 'forms', label: 'Forms' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'media', label: 'Media' },
    { value: 'social', label: 'Social' }
  ];

  const availableTags = [
    'responsive', 'modern', 'minimal', 'professional', 'colorful',
    'interactive', 'clean', 'bold', 'elegant', 'medical', 'healthcare'
  ];

  // Global settings
  const [globalSettings, setGlobalSettings] = useState({
    siteName: '',
    siteDescription: '',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter, sans-serif'
  });

  useEffect(() => {
    if (websiteId) {
      loadWebsite();
      loadComponents();
    } else {
      navigate('/websites');
    }
  }, [websiteId, navigate]);

  useEffect(() => {
    // Filter components based on search term, category, and tags
    let filtered = components;

    if (searchTerm) {
      filtered = filtered.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(comp =>
        selectedTags.some(tag => comp.tags?.includes(tag))
      );
    }

    setFilteredComponents(filtered);
  }, [components, searchTerm, selectedCategory, selectedTags]);

  const loadWebsite = async () => {
    try {
      setIsLoading(true);
      const response = await websiteService.getWebsiteById(websiteId);
      const websiteData = response.website;
      setWebsite(websiteData);

      // Get current version data
      const currentVersion = websiteData.versions.find(v => v.versionNumber === websiteData.currentVersion) || websiteData.versions[0];
      if (currentVersion) {
        setGlobalSettings(currentVersion.globalSettings || {});
        // Load existing canvas components if any
        if (currentVersion.pages?.[0]?.components) {
          setCanvasComponents(currentVersion.pages[0].components);
        }
      }

      showSnackbar('Website loaded successfully');
    } catch (error) {
      console.error('Load website error:', error);
      showSnackbar('Error loading website: ' + error.message, 'error');
      navigate('/websites');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComponents = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/builder/components/full`);

      if (response.ok) {
        const componentsData = await response.json();
        if (componentsData.components) {
          setComponents(componentsData.components);
          setFilteredComponents(componentsData.components);
          return;
        }
      }

      // Fallback components if API fails
      const fallbackComponents = [
        {
          id: 'hero-section',
          name: 'Hero Section',
          category: 'content',
          description: 'Eye-catching hero section with CTA',
          tags: ['hero', 'banner', 'modern', 'professional'],
          component: '<div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"><div class="container mx-auto px-4 text-center"><h1 class="text-5xl font-bold mb-6">Welcome to Our Practice</h1><p class="text-xl mb-8 opacity-90">Providing exceptional healthcare services with compassion and expertise</p><button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Book Appointment</button></div></div>'
        },
        {
          id: 'contact-form',
          name: 'Contact Form',
          category: 'forms',
          description: 'Professional contact form',
          tags: ['contact', 'form', 'professional'],
          component: '<div class="py-16 bg-white"><div class="container mx-auto px-4 max-w-2xl"><h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2><form class="space-y-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-sm font-medium mb-2">First Name</label><input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></div><div><label class="block text-sm font-medium mb-2">Last Name</label><input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></div></div><div><label class="block text-sm font-medium mb-2">Email</label><input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></div><div><label class="block text-sm font-medium mb-2">Message</label><textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea></div><button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Send Message</button></form></div></div>'
        },
        {
          id: 'services-grid',
          name: 'Services Grid',
          category: 'content',
          description: 'Grid layout for services',
          tags: ['services', 'grid', 'medical', 'professional'],
          component: '<div class="py-16 bg-gray-50"><div class="container mx-auto px-4"><h2 class="text-3xl font-bold text-center mb-12">Our Services</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div class="bg-white p-6 rounded-lg shadow-md text-center"><div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-blue-600 text-2xl">🏥</span></div><h3 class="text-xl font-semibold mb-3">General Medicine</h3><p class="text-gray-600">Comprehensive primary care services</p></div><div class="bg-white p-6 rounded-lg shadow-md text-center"><div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-green-600 text-2xl">💊</span></div><h3 class="text-xl font-semibold mb-3">Specialized Care</h3><p class="text-gray-600">Expert specialized treatments</p></div><div class="bg-white p-6 rounded-lg shadow-md text-center"><div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-purple-600 text-2xl">🔬</span></div><h3 class="text-xl font-semibold mb-3">Diagnostics</h3><p class="text-gray-600">Advanced diagnostic services</p></div></div></div></div>'
        },
        {
          id: 'navbar-modern',
          name: 'Modern Navbar',
          category: 'navigation',
          description: 'Clean modern navigation bar',
          tags: ['navigation', 'modern', 'responsive'],
          component: '<nav class="bg-white shadow-lg"><div class="container mx-auto px-4"><div class="flex justify-between items-center py-4"><div class="flex items-center"><h1 class="text-2xl font-bold text-blue-600">MediCare</h1></div><div class="hidden md:flex space-x-8"><a href="#" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#" class="text-gray-700 hover:text-blue-600 transition">About</a><a href="#" class="text-gray-700 hover:text-blue-600 transition">Services</a><a href="#" class="text-gray-700 hover:text-blue-600 transition">Contact</a></div><button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Book Now</button></div></div></nav>'
        },
        {
          id: 'footer-medical',
          name: 'Medical Footer',
          category: 'navigation',
          description: 'Professional medical practice footer',
          tags: ['footer', 'medical', 'professional'],
          component: '<footer class="bg-gray-900 text-white py-12"><div class="container mx-auto px-4"><div class="grid grid-cols-1 md:grid-cols-4 gap-8"><div><h3 class="text-xl font-bold mb-4">MediCare Practice</h3><p class="text-gray-400 mb-4">Providing quality healthcare services with compassion and expertise.</p></div><div><h4 class="text-lg font-semibold mb-4">Quick Links</h4><ul class="space-y-2"><li><a href="#" class="text-gray-400 hover:text-white transition">About Us</a></li><li><a href="#" class="text-gray-400 hover:text-white transition">Services</a></li></ul></div><div><h4 class="text-lg font-semibold mb-4">Contact Info</h4><div class="space-y-2 text-gray-400"><p>📍 123 Medical Center Dr.</p><p>📞 (555) 123-4567</p></div></div></div></div></footer>'
        }
      ];

      setComponents(fallbackComponents);
      setFilteredComponents(fallbackComponents);
    } catch (error) {
      console.error('Error loading components:', error);
      showSnackbar('Error loading components, using fallback', 'warning');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleManualSave = async () => {
    try {
      setSaving(true);

      // Prepare pages data
      const updatedPages = [{
        name: 'Home',
        slug: 'home',
        title: website.name || 'Home',
        description: globalSettings.siteDescription || '',
        components: canvasComponents,
        lastModified: new Date()
      }];

      // Save to backend
      await websiteService.saveWebsiteContent(websiteId, {
        pages: updatedPages,
        globalSettings,
        changeLog: 'Manual save from drag-drop editor'
      });

      showSnackbar('Website saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      showSnackbar('Error saving website: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handlePublish = async () => {
    try {
      await handleManualSave();
      await websiteService.publishWebsite(websiteId);
      showSnackbar('Website published successfully!');
    } catch (error) {
      showSnackbar('Error publishing website: ' + error.message, 'error');
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const componentData = JSON.parse(e.dataTransfer.getData('application/json'));
      const newComponent = {
        ...componentData,
        instanceId: nextId,
        position: { x: 0, y: canvasComponents.length * 120 }
      };
      setCanvasComponents(prev => [...prev, newComponent]);
      setNextId(prev => prev + 1);
      setSelectedComponent(newComponent);
      showSnackbar(`Added ${componentData.name} to canvas`);
    } catch (error) {
      console.error('Error dropping component:', error);
    }
  };

  const handleCanvasComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  const handleRemoveComponent = (instanceId) => {
    setCanvasComponents(prev => prev.filter(comp => comp.instanceId !== instanceId));
    if (selectedComponent && selectedComponent.instanceId === instanceId) {
      setSelectedComponent(null);
    }
    showSnackbar('Component removed');
  };

  // Text editing functions
  const extractTextFromHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const textElements = [];

    // Helper function to extract text from elements
    const extractText = (element, path = '') => {
      Array.from(element.children).forEach((child, index) => {
        const currentPath = path ? `${path} > ${child.tagName.toLowerCase()}[${index}]` : `${child.tagName.toLowerCase()}[${index}]`;

        // Check if element has direct text content (not just whitespace)
        const directText = Array.from(child.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0)
          .join(' ');

        if (directText) {
          textElements.push({
            path: currentPath,
            element: child.tagName.toLowerCase(),
            originalText: directText,
            newText: directText,
            id: `${currentPath}-${textElements.length}`
          });
        }

        // Recursively check children
        if (child.children.length > 0) {
          extractText(child, currentPath);
        }
      });
    };

    extractText(doc.body);
    return textElements;
  };

  const updateComponentText = (component, updatedTexts) => {
    let updatedHTML = component.component;

    // Sort by path length (deepest first) to avoid replacing parent text before children
    const sortedTexts = [...updatedTexts].sort((a, b) => b.path.length - a.path.length);

    sortedTexts.forEach(textItem => {
      if (textItem.newText !== textItem.originalText) {
        // Simple text replacement - in a production environment, you might want more sophisticated HTML parsing
        updatedHTML = updatedHTML.replace(textItem.originalText, textItem.newText);
      }
    });

    return {
      ...component,
      component: updatedHTML
    };
  };

  const handleTextEdit = (component) => {
    const texts = extractTextFromHTML(component.component);
    if (texts.length === 0) {
      showSnackbar('No editable text found in this component', 'warning');
      return;
    }

    setEditingComponent(component);
    setExtractedTexts(texts);
    setTextEditDialogOpen(true);
  };

  const handleTextSave = () => {
    if (!editingComponent) return;

    const updatedComponent = updateComponentText(editingComponent, extractedTexts);

    setCanvasComponents(prev =>
      prev.map(comp =>
        comp.instanceId === editingComponent.instanceId ? updatedComponent : comp
      )
    );

    // Update selected component if it's the one being edited
    if (selectedComponent && selectedComponent.instanceId === editingComponent.instanceId) {
      setSelectedComponent(updatedComponent);
    }

    setTextEditDialogOpen(false);
    setEditingComponent(null);
    setExtractedTexts([]);
    showSnackbar('Text updated successfully!');
  };

  const handleTextChange = (textId, newValue) => {
    setExtractedTexts(prev =>
      prev.map(text =>
        text.id === textId ? { ...text, newText: newValue } : text
      )
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Website Builder...</Typography>
      </Box>
    );
  }

  if (!website) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Website not found</Typography>
        <Button onClick={() => navigate('/websites')} sx={{ mt: 2 }}>
          Back to Websites
        </Button>
      </Box>
    );
  }

  return (
    <PageBuilderErrorBoundary>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <AppBar position="static" sx={{ bgcolor: globalSettings.primaryColor || '#2563eb' }}>
          <Toolbar>
            <IconButton color="inherit" onClick={() => navigate('/websites')} sx={{ mr: 2 }}>
              <BackIcon />
            </IconButton>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{website.name}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {website.subdomain}.docwebsite.app
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                onClick={handleManualSave}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                variant="contained"
                color="success"
                sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>

              <Button
                onClick={handlePreview}
                startIcon={<PreviewIcon />}
                variant="outlined"
                color="inherit"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>

              <Button
                onClick={handlePublish}
                startIcon={<PublishIcon />}
                variant="contained"
                sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
              >
                Publish
              </Button>

              <IconButton color="inherit" onClick={() => setSettingsDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1 }}>
          {/* Left Sidebar - Component Filter & Library */}
          {!isPreviewMode && (
            <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
              {/* Filter Section */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  Component Library
                </Typography>

                {/* Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'grey.500' }} />
                  }}
                  sx={{ mb: 2 }}
                />

                {/* Category Filter */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Tag Filter */}
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Filter by tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {availableTags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                      onClick={() => handleTagToggle(tag)}
                      sx={{
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: selectedTags.includes(tag) ? undefined : 'action.hover' }
                      }}
                    />
                  ))}
                </Box>

                {selectedTags.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setSelectedTags([])}
                    startIcon={<CloseIcon />}
                    sx={{ mb: 1 }}
                  >
                    Clear Tags
                  </Button>
                )}
              </Box>

              {/* Components List */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {filteredComponents.length} components available
                </Typography>

                <Grid container spacing={1}>
                  {filteredComponents.map((component) => (
                    <Grid item xs={12} key={component.id}>
                      <Card
                        sx={{
                          cursor: 'grab',
                          '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)' },
                          '&:active': { cursor: 'grabbing' },
                          transition: 'all 0.2s'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <DragIcon sx={{ mr: 1, color: 'grey.400' }} />
                            <Typography variant="body2" fontWeight="medium">
                              {component.name}
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {component.description}
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip
                              label={component.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {component.tags?.slice(0, 2).map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {filteredComponents.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No components match your filters
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedTags([]);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Main Canvas */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Canvas Area */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: isPreviewMode ? 0 : 3,
                bgcolor: isPreviewMode ? 'white' : 'grey.100'
              }}
            >
              <Paper
                sx={{
                  minHeight: '100%',
                  bgcolor: 'white',
                  borderRadius: isPreviewMode ? 0 : 2,
                  border: isPreviewMode ? 'none' : '2px dashed',
                  borderColor: 'grey.300',
                  p: isPreviewMode ? 0 : 3,
                  '&:hover': !isPreviewMode ? { borderColor: 'primary.main' } : {}
                }}
                onDrop={!isPreviewMode ? handleDrop : undefined}
                onDragOver={!isPreviewMode ? (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                } : undefined}
              >
                {canvasComponents.length === 0 ? (
                  !isPreviewMode && (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Start Building Your Website
                      </Typography>
                      <Typography variant="body2">
                        Drag components from the left sidebar to start building your website
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box>
                    {canvasComponents.map((component) => (
                      <Box
                        key={component.instanceId}
                        sx={{
                          mb: isPreviewMode ? 0 : 3,
                          position: 'relative',
                          border: isPreviewMode ? 'none' : selectedComponent?.instanceId === component.instanceId ? '2px solid' : '1px solid transparent',
                          borderColor: selectedComponent?.instanceId === component.instanceId ? 'primary.main' : 'transparent',
                          borderRadius: 1,
                          '&:hover': !isPreviewMode ? {
                            borderColor: 'primary.main',
                            '& .component-controls': { opacity: 1 }
                          } : {}
                        }}
                        onClick={!isPreviewMode ? () => handleCanvasComponentSelect(component) : undefined}
                      >
                        {/* Component Controls */}
                        {!isPreviewMode && (
                          <Box
                            className="component-controls"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              opacity: selectedComponent?.instanceId === component.instanceId ? 1 : 0,
                              transition: 'opacity 0.2s',
                              zIndex: 10,
                              display: 'flex',
                              gap: 1
                            }}
                          >
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCanvasComponentSelect(component);
                              }}
                              title="Select Component"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTextEdit(component);
                              }}
                              title="Edit Text"
                            >
                              <TextIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveComponent(component.instanceId);
                              }}
                              title="Remove Component"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}

                        {/* Component Content */}
                        <div dangerouslySetInnerHTML={{ __html: component.component }} />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Right Sidebar - Properties */}
          {!isPreviewMode && (
            <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider', p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                Properties
              </Typography>

              {selectedComponent ? (
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    {selectedComponent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    {selectedComponent.category}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Description:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedComponent.description}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {selectedComponent.tags?.map(tag => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => handleTextEdit(selectedComponent)}
                      startIcon={<TextIcon />}
                    >
                      Edit Text
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveComponent(selectedComponent.instanceId)}
                      startIcon={<DeleteIcon />}
                    >
                      Remove Component
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a component on the canvas to edit its properties
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Settings Dialog */}
        <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Website Settings</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Site Name"
                value={globalSettings.siteName}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Site Description"
                multiline
                rows={2}
                value={globalSettings.siteDescription}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={globalSettings.primaryColor}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Secondary Color"
                type="color"
                value={globalSettings.secondaryColor}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Font Family"
                value={globalSettings.fontFamily}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                helperText="CSS font family (e.g., 'Inter, sans-serif')"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setSettingsDialogOpen(false);
              showSnackbar('Settings updated! Save to apply changes.');
            }} variant="contained">Update Settings</Button>
          </DialogActions>
        </Dialog>

        {/* Text Edit Dialog */}
        <Dialog open={textEditDialogOpen} onClose={() => setTextEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <TextIcon sx={{ mr: 1 }} />
            Edit Text Content
            {editingComponent && (
              <Chip
                label={editingComponent.name}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Edit the text content found in this component. Changes will be applied to the HTML structure.
            </Typography>

            {extractedTexts.length > 0 ? (
              <Stack spacing={3}>
                {extractedTexts.map((textItem, index) => (
                  <Box key={textItem.id}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {textItem.element.toUpperCase()} element #{index + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={6}
                      value={textItem.newText}
                      onChange={(e) => handleTextChange(textItem.id, e.target.value)}
                      placeholder="Enter text content..."
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                      Original: "{textItem.originalText}"
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No editable text found in this component.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTextEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleTextSave}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={extractedTexts.length === 0}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageBuilderErrorBoundary>
  );
};

export default SimpleDragDropBuilder;