import React, { useState, useEffect } from 'react';
import {
  AutoAwesome as AIIcon,
  Sync as SyncIcon,
  Warning as ConflictIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
  SmartToy as BotIcon,
  EditNote as EditIcon
} from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import UnifiedContentService from '../../services/unifiedContentService';

/**
 * Unified Content Sidebar for Destack Editor
 *
 * This component provides unified content management directly within
 * the Destack editor interface as a collapsible sidebar panel.
 */
const DestackUnifiedContentSidebar = ({
  servicePageId,
  websiteId,
  isVisible,
  onToggle,
  onSyncTriggered,
  canvasComponents,
  globalSettings
}) => {
  const [unifiedContent, setUnifiedContent] = useState(null);
  const [syncStatus, setSyncStatus] = useState('unknown');
  const [conflicts, setConflicts] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Load unified content data
  const loadUnifiedContent = async () => {
    if (!servicePageId) return;

    setLoading(true);
    try {
      const data = await UnifiedContentService.getByServicePage(servicePageId);
      if (data) {
        setUnifiedContent(data);
        setSyncStatus(data.syncStatus || 'needs_sync');
        setConflicts(data.conflicts || []);
        setAiSuggestions(data.aiSuggestions?.filter(s => s.status === 'pending') || []);
      } else {
        // Create unified content if it doesn't exist
        const newUnifiedContent = await UnifiedContentService.create(servicePageId, websiteId);
        setUnifiedContent(newUnifiedContent);
        setSyncStatus('synced');
        setConflicts([]);
        setAiSuggestions([]);
      }
    } catch (error) {
      console.error('Error loading unified content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync content with current canvas state
  const handleSyncContent = async () => {
    if (!unifiedContent) return;

    setLoading(true);
    try {
      // Update components in unified content
      await UnifiedContentService.updateComponents(servicePageId, canvasComponents, {
        globalSettings,
        timestamp: new Date().toISOString(),
        source: 'destack_editor'
      });

      // Refresh unified content
      await loadUnifiedContent();

      // Notify parent component
      if (onSyncTriggered) {
        onSyncTriggered('content_to_visual');
      }
    } catch (error) {
      console.error('Error syncing content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle AI suggestion
  const handleAISuggestion = async (suggestionId, action) => {
    try {
      await UnifiedContentService.handleAISuggestion(servicePageId, suggestionId, null, action);
      await loadUnifiedContent();
    } catch (error) {
      console.error('Error handling AI suggestion:', error);
    }
  };

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!unifiedContent) return;

    setLoading(true);
    try {
      await UnifiedContentService.generateAISuggestions(unifiedContent._id, {
        context: 'destack_editor',
        currentComponents: canvasComponents,
        globalSettings
      });
      await loadUnifiedContent();
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resolve conflict
  const handleResolveConflict = async (conflictId, resolution) => {
    try {
      await UnifiedContentService.resolveConflict(servicePageId, conflictId, resolution);
      await loadUnifiedContent();
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  useEffect(() => {
    if (servicePageId && isVisible) {
      loadUnifiedContent();
    }
  }, [servicePageId, isVisible]);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'synced': return 'success';
      case 'needs_sync': return 'warning';
      case 'conflicted': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'synced': return <CheckIcon />;
      case 'needs_sync': return <PendingIcon />;
      case 'conflicted': return <ConflictIcon />;
      default: return <SyncIcon />;
    }
  };

  if (!isVisible) {
    return (
      <Box
        sx={{
          position: 'fixed',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1300
        }}
      >
        <Tooltip title="Open Unified Content Panel">
          <IconButton
            onClick={onToggle}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <Badge
              badgeContent={conflicts.length + aiSuggestions.length}
              color="error"
            >
              <BotIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        right: 0,
        top: 64, // Below app bar
        bottom: 0,
        width: 350,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <BotIcon />
            <Typography variant="h6">Unified Content</Typography>
          </Stack>
          <IconButton onClick={onToggle} sx={{ color: 'white' }}>
            <EditIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Stack spacing={2}>
            {/* Sync Status */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  {getStatusIcon(syncStatus)}
                  <Typography variant="subtitle2">Sync Status</Typography>
                </Stack>
                <Chip
                  label={syncStatus.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(syncStatus)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleSyncContent}
                  disabled={loading}
                  size="small"
                >
                  Sync Content
                </Button>
              </CardContent>
            </Card>

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <Card variant="outlined">
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <ConflictIcon color="error" />
                    <Typography variant="subtitle2" color="error">
                      Conflicts ({conflicts.length})
                    </Typography>
                  </Stack>
                  <List dense>
                    {conflicts.slice(0, 3).map((conflict, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={conflict.type}
                          secondary={conflict.description}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            onClick={() => handleResolveConflict(conflict.id, 'accept_visual')}
                          >
                            Resolve
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  {conflicts.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{conflicts.length - 3} more conflicts
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Suggestions */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <AIIcon color="primary" />
                  <Typography variant="subtitle2">
                    AI Suggestions ({aiSuggestions.length})
                  </Typography>
                </Stack>

                {aiSuggestions.length === 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BotIcon />}
                    onClick={generateAISuggestions}
                    disabled={loading}
                    size="small"
                  >
                    Generate Suggestions
                  </Button>
                )}

                {aiSuggestions.length > 0 && (
                  <List dense>
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <ListItem key={index} sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                        <Box sx={{ width: '100%', mb: 1 }}>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {suggestion.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {suggestion.description}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleAISuggestion(suggestion.id, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleAISuggestion(suggestion.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                )}

                {aiSuggestions.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{aiSuggestions.length - 3} more suggestions
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AIIcon />}
                    onClick={generateAISuggestions}
                    disabled={loading}
                    size="small"
                  >
                    Get AI Suggestions
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncContent}
                    disabled={loading}
                    size="small"
                  >
                    Force Sync
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default DestackUnifiedContentSidebar;