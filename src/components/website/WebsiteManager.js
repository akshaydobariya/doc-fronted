import {
  Add as AddIcon,
  Archive as ArchiveIcon,
  Clear as ClearIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Visibility as PreviewIcon,
  Public as PublishIcon,
  Restore as RestoreIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  History as VersionIcon,
  Web as WebIcon,
  MedicalServices as ServiceIcon,
  EditNote as EditServiceIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import websiteService from '../../services/websiteService';
import { servicePageService } from '../../services/servicePageService';
import UnifiedContentService from '../../services/unifiedContentService';

const WebsiteManager = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [versions, setVersions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tab management
  const [activeTab, setActiveTab] = useState(0); // 0 = Websites, 1 = Service Pages

  // Service pages state
  const [servicePages, setServicePages] = useState([]);
  const [filteredServicePages, setFilteredServicePages] = useState([]);
  const [servicePageLoading, setServicePageLoading] = useState(false);
  const [selectedWebsiteForServices, setSelectedWebsiteForServices] = useState(null);
  const [unifiedContentStatuses, setUnifiedContentStatuses] = useState({});

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated'); // 'name', 'created', 'updated', 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Create website form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    subdomain: '',
    template: 'dental-modern',
    customDomain: ''
  });

  const [createFormErrors, setCreateFormErrors] = useState({});
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);

  useEffect(() => {
    loadWebsites();
  }, []);

  // Filter and sort websites whenever the filter criteria or websites change
  useEffect(() => {
    let filtered = [...websites];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(website =>
        website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(website => website.status === statusFilter);
    }

    // Apply template filter
    if (templateFilter !== 'all') {
      filtered = filtered.filter(website => website.template === templateFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'updated':
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredWebsites(filtered);
  }, [websites, searchTerm, statusFilter, templateFilter, sortBy, sortOrder]);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      console.log('Loading websites...');
      const response = await websiteService.getWebsites();
      console.log('Websites response:', response);
      const websites = response.websites || [];
      console.log(`Found ${websites.length} websites:`, websites);
      setWebsites(websites);
    } catch (error) {
      console.error('Error loading websites:', error);
      showSnackbar('Error loading websites: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadServicePages = async (websiteId) => {
    try {
      setServicePageLoading(true);
      const response = await servicePageService.getServicePages(websiteId, {
        includeAnalytics: true
      });

      if (response.success) {
        const pages = response.data || [];
        setServicePages(pages);
        setFilteredServicePages(pages);

        // Load unified content statuses for each service page
        await loadUnifiedContentStatuses(pages);
      }
    } catch (error) {
      console.error('Error loading service pages:', error);
      showSnackbar('Error loading service pages: ' + error.message, 'error');
    } finally {
      setServicePageLoading(false);
    }
  };

  const loadUnifiedContentStatuses = async (pages) => {
    const statuses = {};

    // Load unified content status for each page
    await Promise.allSettled(
      pages.map(async (page) => {
        try {
          const unifiedContent = await UnifiedContentService.getByServicePage(page._id);
          if (unifiedContent) {
            statuses[page._id] = {
              exists: true,
              syncStatus: unifiedContent.syncStatus,
              conflicts: unifiedContent.conflicts?.length || 0,
              aiSuggestions: unifiedContent.aiSuggestions?.filter(s => s.status === 'pending').length || 0,
              lastSync: unifiedContent.lastModified
            };
          } else {
            statuses[page._id] = { exists: false };
          }
        } catch (error) {
          console.warn(`No unified content found for page ${page._id}:`, error);
          statuses[page._id] = { exists: false };
        }
      })
    );

    setUnifiedContentStatuses(statuses);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    // Load service pages when switching to service pages tab
    if (newValue === 1) {
      // If no website is selected for services, select the first one
      if (!selectedWebsiteForServices && websites.length > 0) {
        const firstWebsite = websites[0];
        setSelectedWebsiteForServices(firstWebsite);
        loadServicePages(firstWebsite._id);
      } else if (selectedWebsiteForServices) {
        loadServicePages(selectedWebsiteForServices._id);
      }
    }
  };

  const handleWebsiteSelectionForServices = (website) => {
    setSelectedWebsiteForServices(website);
    loadServicePages(website._id);
  };

  const handleEditServicePage = (servicePageId) => {
    // Navigate to Destack editor with service page context and unified content support
    navigate(`/full-destack-editor?servicePageId=${servicePageId}&mode=service&websiteId=${selectedWebsiteForServices._id}`);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateWebsite = async () => {
    try {
      // Validate form
      const errors = {};
      if (!createForm.name.trim()) errors.name = 'Name is required';
      if (!createForm.subdomain.trim()) errors.subdomain = 'Subdomain is required';
      if (!createForm.template) errors.template = 'Template is required';

      if (Object.keys(errors).length > 0) {
        setCreateFormErrors(errors);
        return;
      }

      // Check subdomain availability
      const availabilityCheck = await websiteService.checkSubdomainAvailability(createForm.subdomain);
      if (!availabilityCheck.available) {
        setCreateFormErrors({ subdomain: 'Subdomain is already taken' });
        return;
      }

      // Create website
      const response = await websiteService.createWebsite(createForm);

      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        description: '',
        subdomain: '',
        template: 'dental-modern',
        customDomain: ''
      });
      setCreateFormErrors({});

      showSnackbar('Website created successfully!');
      loadWebsites();
    } catch (error) {
      showSnackbar('Error creating website: ' + error.message, 'error');
    }
  };

  const handleSubdomainChange = async (value) => {
    setCreateForm(prev => ({ ...prev, subdomain: value }));

    if (value && value.length >= 3) {
      setSubdomainChecking(true);
      try {
        const response = await websiteService.checkSubdomainAvailability(value);
        setSubdomainAvailable(response.available);
      } catch (error) {
        setSubdomainAvailable(null);
      } finally {
        setSubdomainChecking(false);
      }
    } else {
      setSubdomainAvailable(null);
    }
  };

  const handleEditWebsite = (website) => {
    // Navigate to full Destack editor
    navigate(`/full-destack-editor?websiteId=${website._id}`);
  };

  const handlePreviewWebsite = (website) => {
    const previewUrl = websiteService.getPreviewUrl(website);
    window.open(previewUrl, '_blank');
  };

  const handlePublishWebsite = async (website) => {
    try {
      await websiteService.publishWebsite(website._id);
      showSnackbar('Website published successfully!');
      loadWebsites();
    } catch (error) {
      showSnackbar('Error publishing website: ' + error.message, 'error');
    }
  };

  const handleUnpublishWebsite = async (website) => {
    try {
      await websiteService.unpublishWebsite(website._id);
      showSnackbar('Website unpublished successfully!');
      loadWebsites();
    } catch (error) {
      showSnackbar('Error unpublishing website: ' + error.message, 'error');
    }
  };

  const handleDeleteWebsite = async (website) => {
    if (window.confirm(`Are you sure you want to archive "${website.name}"?`)) {
      try {
        await websiteService.deleteWebsite(website._id);
        showSnackbar('Website archived successfully!');
        loadWebsites();
      } catch (error) {
        showSnackbar('Error archiving website: ' + error.message, 'error');
      }
    }
  };

  const handleViewVersions = async (website) => {
    try {
      setSelectedWebsite(website);
      const response = await websiteService.getWebsiteVersions(website._id);
      setVersions(response.versions || []);
      setVersionDialogOpen(true);
    } catch (error) {
      showSnackbar('Error loading versions: ' + error.message, 'error');
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    try {
      await websiteService.restoreWebsiteVersion(selectedWebsite._id, versionNumber);
      showSnackbar(`Website restored to version ${versionNumber}!`);
      setVersionDialogOpen(false);
      loadWebsites();
    } catch (error) {
      showSnackbar('Error restoring version: ' + error.message, 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar('URL copied to clipboard!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTemplateFilter('all');
    setSortBy('updated');
    setSortOrder('desc');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getStatusConfig = websiteService.getStatusConfig();
  const templates = websiteService.getAvailableTemplates();

  // Get unique templates from existing websites for filter
  const availableTemplates = [...new Set(websites.map(w => w.template))];
  const statusOptions = ['draft', 'preview', 'published', 'archived'];

  const WebsiteCard = ({ website }) => {
    const statusConfig = getStatusConfig[website.status] || getStatusConfig.draft;
    const websiteUrl = websiteService.getWebsiteUrl(website);
    const currentVersion = website.currentVersion || '1.0.0';

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2" noWrap>
              {website.name}
            </Typography>
            <Chip
              label={statusConfig.label}
              size="small"
              sx={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
                fontWeight: 600
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {website.description || 'No description provided'}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              URL:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                {websiteUrl}
              </Typography>
              <Tooltip title="Copy URL">
                <IconButton size="small" onClick={() => copyToClipboard(websiteUrl)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Template: {website.template}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Version: {currentVersion}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Updated: {new Date(website.updatedAt).toLocaleDateString()}
          </Typography>
        </CardContent>

        <CardActions sx={{ flexDirection: 'column', gap: 1, px: 2, pb: 2 }}>
          {/* Primary Edit Button */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => handleEditWebsite(website)}
            sx={{
              borderRadius: 2,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Edit with Destack
          </Button>

          {/* Secondary Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              <Tooltip title="Preview">
                <IconButton size="small" onClick={() => handlePreviewWebsite(website)}>
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Versions">
                <IconButton size="small" onClick={() => handleViewVersions(website)}>
                  <VersionIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box>
              {website.status === 'published' ? (
                <Tooltip title="Unpublish">
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleUnpublishWebsite(website)}
                  >
                    <ArchiveIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Publish">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handlePublishWebsite(website)}
                  >
                    <PublishIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Archive">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteWebsite(website)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {activeTab === 0 ? 'My Websites' : 'Service Pages'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {activeTab === 0
              ? 'Manage your professional websites and online presence'
              : 'Edit and customize your dental service pages'
            }
          </Typography>
        </Box>
        {activeTab === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Create Website
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={<WebIcon />}
            label="Websites"
            iconPosition="start"
          />
          <Tab
            icon={<ServiceIcon />}
            label="Service Pages"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Websites Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Filter and Search Section */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            Filter & Search
          </Typography>
          {(searchTerm || statusFilter !== 'all' || templateFilter !== 'all') && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{ color: 'text.secondary' }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search websites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={getStatusConfig[status]?.label || status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusConfig[status]?.bgColor,
                          color: getStatusConfig[status]?.color,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Template Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Template</InputLabel>
              <Select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                label="Template"
              >
                <MenuItem value="all">All Templates</MenuItem>
                {availableTemplates.map(template => (
                  <MenuItem key={template} value={template}>
                    {templates.find(t => t.id === template)?.name || template}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="updated">Last Updated</MenuItem>
                <MenuItem value="created">Date Created</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={toggleSortOrder}
              sx={{ height: '40px' }}
            >
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
          </Grid>
        </Grid>

        {/* Results Summary */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredWebsites.length} of {websites.length} websites
          </Typography>
          {filteredWebsites.length !== websites.length && (
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
              {websites.length - filteredWebsites.length} websites filtered out
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Websites Grid */}
      {websites.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WebIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            No websites yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first professional website to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="large"
          >
            Create Your First Website
          </Button>
        </Paper>
      ) : filteredWebsites.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            No websites match your filters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or clearing the filters
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </Paper>
      ) : (
        <Fade in={true}>
          <Grid container spacing={3}>
            {filteredWebsites.map((website) => (
              <Grid item xs={12} sm={6} md={4} key={website._id}>
                <WebsiteCard website={website} />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

        </>
      )}

      {/* Service Pages Tab Content */}
      {activeTab === 1 && (
        <>
          {/* Website Selector for Service Pages */}
          {websites.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Select Website
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Choose a website to manage service pages</InputLabel>
                  <Select
                    value={selectedWebsiteForServices?._id || ''}
                    onChange={(e) => {
                      const website = websites.find(w => w._id === e.target.value);
                      handleWebsiteSelectionForServices(website);
                    }}
                    label="Choose a website to manage service pages"
                  >
                    {websites.map((website) => (
                      <MenuItem key={website._id} value={website._id}>
                        {website.name} ({website.subdomain})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          )}

          {/* Service Pages List */}
          {selectedWebsiteForServices && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Service Pages for {selectedWebsiteForServices.name}
                </Typography>
              </Box>

              {servicePageLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredServicePages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <ServiceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No service pages found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create service pages using the service management section
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {filteredServicePages.map((servicePage) => (
                    <Grid item xs={12} sm={6} md={4} key={servicePage._id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" component="h2" noWrap>
                              {servicePage.title}
                            </Typography>
                            <Chip
                              label={servicePage.status}
                              size="small"
                              color={servicePage.status === 'published' ? 'success' : 'warning'}
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {servicePage.serviceId?.name || 'Unknown Service'}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Version: {servicePage.currentVersion}
                          </Typography>

                          {/* Unified Content Status Indicators */}
                          {(() => {
                            const unifiedStatus = unifiedContentStatuses[servicePage._id];
                            if (!unifiedStatus) {
                              return (
                                <Box sx={{ mb: 2 }}>
                                  <Chip
                                    size="small"
                                    label="Loading..."
                                    color="default"
                                    variant="outlined"
                                  />
                                </Box>
                              );
                            }

                            if (!unifiedStatus.exists) {
                              return (
                                <Box sx={{ mb: 2 }}>
                                  <Chip
                                    size="small"
                                    label="Static Content"
                                    color="default"
                                    variant="outlined"
                                  />
                                </Box>
                              );
                            }

                            const isSynced = unifiedStatus.syncStatus?.contentToVisual?.status === 'synced' &&
                                           unifiedStatus.syncStatus?.visualToContent?.status === 'synced';

                            return (
                              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                <Chip
                                  size="small"
                                  label="Unified Content"
                                  color="primary"
                                  variant="filled"
                                />
                                <Chip
                                  size="small"
                                  label={isSynced ? 'Synced' : 'Needs Sync'}
                                  color={isSynced ? 'success' : 'warning'}
                                  variant="outlined"
                                />
                                {unifiedStatus.conflicts > 0 && (
                                  <Chip
                                    size="small"
                                    label={`${unifiedStatus.conflicts} Conflicts`}
                                    color="error"
                                    variant="filled"
                                  />
                                )}
                                {unifiedStatus.aiSuggestions > 0 && (
                                  <Chip
                                    size="small"
                                    label={`${unifiedStatus.aiSuggestions} AI Suggestions`}
                                    color="info"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            );
                          })()}

                          <Typography variant="caption" color="text.secondary">
                            Last modified: {new Date(servicePage.lastModified).toLocaleDateString()}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            size="small"
                            startIcon={<EditServiceIcon />}
                            onClick={() => handleEditServicePage(servicePage._id)}
                            variant="contained"
                            fullWidth
                          >
                            Edit Service Page
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          )}

          {!selectedWebsiteForServices && websites.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <WebIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No websites found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a website first to manage service pages
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setActiveTab(0);
                  setCreateDialogOpen(true);
                }}
              >
                Create Website
              </Button>
            </Paper>
          )}
        </>
      )}

      {/* Create Website Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Website</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website Name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                error={!!createFormErrors.name}
                helperText={createFormErrors.name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subdomain"
                value={createForm.subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                error={!!createFormErrors.subdomain}
                helperText={
                  createFormErrors.subdomain ||
                  `Your website will be available at: ${createForm.subdomain || 'your-subdomain'}.docwebsite.app`
                }
                InputProps={{
                  endAdornment: subdomainChecking ? (
                    <CircularProgress size={20} />
                  ) : subdomainAvailable === true ? (
                    <Typography variant="caption" color="success.main">Available ✓</Typography>
                  ) : subdomainAvailable === false ? (
                    <Typography variant="caption" color="error.main">Taken ✗</Typography>
                  ) : null
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={createForm.template}
                  label="Template"
                  onChange={(e) => setCreateForm(prev => ({ ...prev, template: e.target.value }))}
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Domain (Optional)"
                value={createForm.customDomain}
                onChange={(e) => setCreateForm(prev => ({ ...prev, customDomain: e.target.value }))}
                helperText="e.g., drsmith.com (configure DNS after creation)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateWebsite} variant="contained">
            Create Website
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog
        open={versionDialogOpen}
        onClose={() => setVersionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version History - {selectedWebsite?.name}</DialogTitle>
        <DialogContent>
          <List>
            {versions.map((version) => (
              <ListItem key={version.versionNumber} divider>
                <ListItemIcon>
                  <VersionIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Version ${version.versionNumber}`}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        {version.changeLog || 'No change log'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(version.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <Button
                  size="small"
                  startIcon={<RestoreIcon />}
                  onClick={() => handleRestoreVersion(version.versionNumber)}
                  disabled={version.versionNumber === selectedWebsite?.currentVersion}
                >
                  {version.versionNumber === selectedWebsite?.currentVersion ? 'Current' : 'Restore'}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WebsiteManager;