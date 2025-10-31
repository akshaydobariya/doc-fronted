import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Warning as WarningIcon,
  MergeType as MergeIcon,
  Visibility as PreviewIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  CompareArrows as CompareIcon,
  AutoFixHigh as AutoResolveIcon
} from '@mui/icons-material';
import { diffLines } from 'diff';
import UnifiedContentService from '../../services/unifiedContentService';

/**
 * ConflictResolution Component
 *
 * Handles synchronization conflicts between AI content and visual edits
 * with preview, merge options, and intelligent resolution capabilities.
 */
function ConflictResolution({ contentId, conflicts, onResolutionComplete }) {
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolutionMode, setResolutionMode] = useState('manual'); // manual, auto, hybrid
  const [resolutionStrategy, setResolutionStrategy] = useState('merge');
  const [previewMode, setPreviewMode] = useState('side-by-side');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track resolution choices for each conflict
  const [resolutions, setResolutions] = useState({});

  useEffect(() => {
    // Initialize resolutions object
    if (conflicts && conflicts.length > 0) {
      const initialResolutions = {};
      conflicts.forEach(conflict => {
        initialResolutions[conflict.id] = {
          strategy: 'merge',
          chosenVersion: null,
          customMerge: null
        };
      });
      setResolutions(initialResolutions);
    }
  }, [conflicts]);

  const getConflictSeverity = (conflict) => {
    if (conflict.type === 'structural') return 'error';
    if (conflict.type === 'content') return 'warning';
    return 'info';
  };

  const getConflictTypeIcon = (type) => {
    switch (type) {
      case 'structural':
        return <WarningIcon color="error" />;
      case 'content':
        return <CompareIcon color="warning" />;
      default:
        return <MergeIcon color="info" />;
    }
  };

  const resolveConflict = async (conflictId, resolution) => {
    try {
      setLoading(true);
      await UnifiedContentService.resolveConflict(contentId, conflictId, resolution);

      // Update local state
      setResolutions(prev => ({
        ...prev,
        [conflictId]: { ...prev[conflictId], resolved: true }
      }));

      setError(null);
    } catch (err) {
      console.error('Error resolving conflict:', err);
      setError('Failed to resolve conflict. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resolveAllConflicts = async () => {
    try {
      setLoading(true);

      const resolutionData = Object.entries(resolutions).map(([conflictId, resolution]) => ({
        conflictId,
        ...resolution
      }));

      await UnifiedContentService.resolveAllConflicts(contentId, resolutionData);

      if (onResolutionComplete) {
        onResolutionComplete();
      }

      setError(null);
    } catch (err) {
      console.error('Error resolving all conflicts:', err);
      setError('Failed to resolve conflicts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autoResolveConflicts = async () => {
    try {
      setLoading(true);
      const autoResolutions = await UnifiedContentService.autoResolveConflicts(contentId);

      // Update local state with auto-resolutions
      setResolutions(prev => ({
        ...prev,
        ...autoResolutions.reduce((acc, res) => {
          acc[res.conflictId] = res;
          return acc;
        }, {})
      }));

      setError(null);
    } catch (err) {
      console.error('Error auto-resolving conflicts:', err);
      setError('Failed to auto-resolve conflicts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDiffViewer = (conflict) => {
    if (!conflict.aiVersion || !conflict.visualVersion) {
      return (
        <Typography variant="body2" color="textSecondary">
          No diff available for this conflict
        </Typography>
      );
    }

    const diff = diffLines(
      JSON.stringify(conflict.aiVersion, null, 2),
      JSON.stringify(conflict.visualVersion, null, 2)
    );

    return (
      <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
        <Typography variant="subtitle2" gutterBottom>
          Changes:
        </Typography>
        <Box component="pre" sx={{ fontSize: '0.875rem', fontFamily: 'monospace', m: 0 }}>
          {diff.map((part, index) => (
            <Box
              key={index}
              component="span"
              sx={{
                backgroundColor: part.added ? 'success.light' :
                                part.removed ? 'error.light' : 'transparent',
                color: part.added ? 'success.contrastText' :
                       part.removed ? 'error.contrastText' : 'text.primary',
                display: 'block',
                opacity: part.added || part.removed ? 1 : 0.7
              }}
            >
              {part.value}
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const renderConflictDetails = (conflict) => (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {getConflictTypeIcon(conflict.type)}
        <Typography variant="h6">
          {conflict.title || `${conflict.type} Conflict`}
        </Typography>
        <Chip
          label={conflict.type}
          size="small"
          color={getConflictSeverity(conflict)}
        />
      </Box>

      <Typography variant="body2" color="textSecondary" mb={2}>
        {conflict.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Resolution Strategy */}
      <Typography variant="subtitle1" gutterBottom>
        Resolution Strategy
      </Typography>
      <RadioGroup
        value={resolutions[conflict.id]?.strategy || 'merge'}
        onChange={(e) =>
          setResolutions(prev => ({
            ...prev,
            [conflict.id]: { ...prev[conflict.id], strategy: e.target.value }
          }))
        }
      >
        <FormControlLabel
          value="merge"
          control={<Radio />}
          label="Smart Merge - Combine both versions intelligently"
        />
        <FormControlLabel
          value="ai"
          control={<Radio />}
          label="Use AI Version - Keep AI-generated content"
        />
        <FormControlLabel
          value="visual"
          control={<Radio />}
          label="Use Visual Version - Keep visual editor changes"
        />
        <FormControlLabel
          value="custom"
          control={<Radio />}
          label="Custom Resolution - Manual merge"
        />
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      {/* Preview Versions */}
      <Typography variant="subtitle1" gutterBottom>
        Version Comparison
      </Typography>

      <Tabs
        value={previewMode}
        onChange={(e, newValue) => setPreviewMode(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Side by Side" value="side-by-side" />
        <Tab label="Diff View" value="diff" />
        <Tab label="AI Version" value="ai" />
        <Tab label="Visual Version" value="visual" />
      </Tabs>

      {previewMode === 'side-by-side' && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              AI Version
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'primary.50', maxHeight: 200, overflow: 'auto' }}>
              <Box component="pre" sx={{ fontSize: '0.875rem', fontFamily: 'monospace', m: 0 }}>
                {JSON.stringify(conflict.aiVersion, null, 2)}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" gutterBottom color="secondary">
              Visual Version
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'secondary.50', maxHeight: 200, overflow: 'auto' }}>
              <Box component="pre" sx={{ fontSize: '0.875rem', fontFamily: 'monospace', m: 0 }}>
                {JSON.stringify(conflict.visualVersion, null, 2)}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {previewMode === 'diff' && renderDiffViewer(conflict)}

      {previewMode === 'ai' && (
        <Paper sx={{ p: 2, bgcolor: 'primary.50', maxHeight: 300, overflow: 'auto' }}>
          <Box component="pre" sx={{ fontSize: '0.875rem', fontFamily: 'monospace', m: 0 }}>
            {JSON.stringify(conflict.aiVersion, null, 2)}
          </Box>
        </Paper>
      )}

      {previewMode === 'visual' && (
        <Paper sx={{ p: 2, bgcolor: 'secondary.50', maxHeight: 300, overflow: 'auto' }}>
          <Box component="pre" sx={{ fontSize: '0.875rem', fontFamily: 'monospace', m: 0 }}>
            {JSON.stringify(conflict.visualVersion, null, 2)}
          </Box>
        </Paper>
      )}
    </Box>
  );

  const renderConflictList = () => (
    <List>
      {conflicts.map((conflict) => (
        <ListItem
          key={conflict.id}
          button
          onClick={() => setSelectedConflict(conflict)}
          selected={selectedConflict?.id === conflict.id}
        >
          <Box display="flex" alignItems="center" mr={2}>
            {getConflictTypeIcon(conflict.type)}
          </Box>
          <ListItemText
            primary={conflict.title || `${conflict.type} Conflict`}
            secondary={
              <Box>
                <Typography variant="body2" color="textSecondary">
                  {conflict.description}
                </Typography>
                <Chip
                  label={conflict.type}
                  size="small"
                  color={getConflictSeverity(conflict)}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            }
          />
          <ListItemSecondaryAction>
            {resolutions[conflict.id]?.resolved ? (
              <Chip label="Resolved" color="success" size="small" />
            ) : (
              <Chip label="Pending" color="warning" size="small" />
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  if (!conflicts || conflicts.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <AcceptIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="success.main" gutterBottom>
            No Conflicts Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            AI content and visual edits are perfectly synchronized.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h5">
            Conflict Resolution
          </Typography>
          <Chip
            label={`${conflicts.length} conflicts`}
            color="warning"
            size="small"
          />
        </Box>

        <Box display="flex" gap={1}>
          <Button
            startIcon={<AutoResolveIcon />}
            onClick={autoResolveConflicts}
            disabled={loading}
          >
            Auto Resolve
          </Button>
          <Button
            variant="contained"
            startIcon={<MergeIcon />}
            onClick={resolveAllConflicts}
            disabled={loading}
          >
            Apply Resolutions
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Conflict List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conflicts ({conflicts.length})
              </Typography>
              {renderConflictList()}
            </CardContent>
          </Card>
        </Grid>

        {/* Conflict Details */}
        <Grid item xs={12} md={8}>
          {selectedConflict ? (
            <Card>
              <CardContent>
                {renderConflictDetails(selectedConflict)}

                <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
                  <Button
                    startIcon={<PreviewIcon />}
                    onClick={() => {
                      // Open preview with the selected resolution
                      console.log('Preview resolution for:', selectedConflict.id);
                    }}
                  >
                    Preview Resolution
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AcceptIcon />}
                    onClick={() =>
                      resolveConflict(
                        selectedConflict.id,
                        resolutions[selectedConflict.id]
                      )
                    }
                    disabled={loading}
                  >
                    Resolve This Conflict
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CompareIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Select a Conflict
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Choose a conflict from the list to view details and resolution options.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ConflictResolution;