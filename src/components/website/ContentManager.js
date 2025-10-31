import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Visibility as PreviewIcon,
  AutoAwesome as AIIcon,
  History as HistoryIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import UnifiedContentService from '../../services/unifiedContentService';

/**
 * ContentManager Component
 *
 * Manages unified content for service pages with AI integration,
 * visual editing, and synchronization capabilities.
 */
function ContentManager({ websiteId, onContentChange }) {
  const [unifiedContents, setUnifiedContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [syncProgress, setSyncProgress] = useState({});

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    status: 'draft',
    aiContent: {},
    visualContent: []
  });

  useEffect(() => {
    if (websiteId) {
      loadUnifiedContents();
    }
  }, [websiteId]);

  const loadUnifiedContents = async () => {
    try {
      setLoading(true);
      const contents = await UnifiedContentService.getByWebsite(websiteId);
      setUnifiedContents(contents);
      setError(null);
    } catch (err) {
      console.error('Error loading unified contents:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditForm({
      title: '',
      status: 'draft',
      aiContent: {},
      visualContent: []
    });
    setSelectedContent(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (content) => {
    setEditForm({
      title: content.title || '',
      status: content.status || 'draft',
      aiContent: content.structuredContent || {},
      visualContent: content.components || []
    });
    setSelectedContent(content);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const contentData = {
        ...editForm,
        websiteId,
        servicePageId: selectedContent?.servicePageId
      };

      let result;
      if (selectedContent) {
        result = await UnifiedContentService.update(selectedContent._id, contentData);
      } else {
        result = await UnifiedContentService.create(contentData);
      }

      await loadUnifiedContents();
      setEditDialogOpen(false);

      if (onContentChange) {
        onContentChange(result);
      }

      setError(null);
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      setLoading(true);
      await UnifiedContentService.delete(contentId);
      await loadUnifiedContents();
      setError(null);
    } catch (err) {
      console.error('Error deleting content:', err);
      setError('Failed to delete content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (contentId, direction = 'bidirectional') => {
    try {
      setSyncProgress(prev => ({ ...prev, [contentId]: true }));

      await UnifiedContentService.syncContent(contentId, direction);
      await loadUnifiedContents();

      setError(null);
    } catch (err) {
      console.error('Error syncing content:', err);
      setError('Failed to sync content. Please try again.');
    } finally {
      setSyncProgress(prev => ({ ...prev, [contentId]: false }));
    }
  };

  const handlePreview = (content) => {
    // Open preview in new window/tab
    const previewUrl = `/api/unified-content/${content._id}/preview`;
    window.open(previewUrl, '_blank');
  };

  const getSyncStatusColor = (syncStatus) => {
    if (!syncStatus) return 'default';

    const hasConflicts = syncStatus.contentToVisual?.conflicts?.length > 0 ||
                        syncStatus.visualToContent?.conflicts?.length > 0;

    if (hasConflicts) return 'error';

    const isInSync = syncStatus.contentToVisual?.status === 'synced' &&
                     syncStatus.visualToContent?.status === 'synced';

    return isInSync ? 'success' : 'warning';
  };

  const getSyncStatusText = (syncStatus) => {
    if (!syncStatus) return 'Unknown';

    const hasConflicts = syncStatus.contentToVisual?.conflicts?.length > 0 ||
                        syncStatus.visualToContent?.conflicts?.length > 0;

    if (hasConflicts) return 'Conflicts';

    const isInSync = syncStatus.contentToVisual?.status === 'synced' &&
                     syncStatus.visualToContent?.status === 'synced';

    return isInSync ? 'In Sync' : 'Needs Sync';
  };

  const renderContentCard = (content) => (
    <Card key={content._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {content.title || 'Untitled Content'}
            </Typography>
            <Box display="flex" gap={1} mb={1}>
              <Chip
                label={content.status || 'draft'}
                size="small"
                color={content.status === 'published' ? 'success' : 'default'}
              />
              <Chip
                label={getSyncStatusText(content.syncStatus)}
                size="small"
                color={getSyncStatusColor(content.syncStatus)}
              />
              {content.aiSuggestions?.length > 0 && (
                <Chip
                  icon={<AIIcon />}
                  label={`${content.aiSuggestions.length} AI suggestions`}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Preview">
              <IconButton
                size="small"
                onClick={() => handlePreview(content)}
              >
                <PreviewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Sync Content">
              <IconButton
                size="small"
                onClick={() => handleSync(content._id)}
                disabled={syncProgress[content._id]}
              >
                {syncProgress[content._id] ? <CircularProgress size={20} /> : <SyncIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEdit(content)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDelete(content._id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Content Stats */}
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Components: {content.components?.length || 0}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Assets: {content.assets?.length || 0}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Last Modified: {new Date(content.lastModified).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Version: {content.version || 1}
            </Typography>
          </Grid>
        </Grid>

        {/* Sync Conflicts Warning */}
        {content.syncStatus?.contentToVisual?.conflicts?.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {content.syncStatus.contentToVisual.conflicts.length} sync conflicts need resolution
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderEditDialog = () => (
    <Dialog
      open={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedContent ? 'Edit Content' : 'Create New Content'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={editForm.status}
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="AI Content" />
            <Tab label="Visual Components" />
            <Tab label="Settings" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                AI Generated Content
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Structured Content (JSON)"
                value={JSON.stringify(editForm.aiContent, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditForm(prev => ({ ...prev, aiContent: parsed }));
                  } catch (err) {
                    // Invalid JSON, keep the string value for now
                  }
                }}
                helperText="Edit the AI-generated structured content"
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Visual Components
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Visual Components (JSON)"
                value={JSON.stringify(editForm.visualContent, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditForm(prev => ({ ...prev, visualContent: parsed }));
                  } catch (err) {
                    // Invalid JSON, keep the string value for now
                  }
                }}
                helperText="Edit the visual components structure"
              />
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Content Settings
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Additional settings and metadata will be available here.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setEditDialogOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading && unifiedContents.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>
          Content Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New Content
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {unifiedContents.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No content found
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Create your first unified content to get started with AI-powered content management.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
            >
              Create First Content
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {unifiedContents.map(renderContentCard)}
        </Box>
      )}

      {renderEditDialog()}
    </Box>
  );
}

export default ContentManager;