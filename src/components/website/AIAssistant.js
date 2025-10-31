import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Divider,
  Badge
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Psychology as BrainIcon,
  ThumbUp as AcceptIcon,
  ThumbDown as RejectIcon,
  Refresh as RegenerateIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as SuggestionIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Article as ContentIcon,
  Tune as OptimizeIcon
} from '@mui/icons-material';
import UnifiedContentService from '../../services/unifiedContentService';

/**
 * AIAssistant Component
 *
 * Provides AI-powered suggestions for content improvement,
 * image recommendations, and content optimization with
 * accept/reject workflow capabilities.
 */
function AIAssistant({ contentId, onSuggestionApplied }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [generationInProgress, setGenerationInProgress] = useState(false);

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    suggestionTypes: {
      content: true,
      images: true,
      videos: false,
      seo: true,
      design: true
    },
    aggressiveness: 'moderate', // conservative, moderate, aggressive
    focusAreas: ['readability', 'engagement', 'seo'],
    autoApply: false,
    minimumConfidence: 0.8
  });

  // Generation preferences
  const [generationPrefs, setGenerationPrefs] = useState({
    contentStyle: 'professional',
    targetAudience: 'general',
    tone: 'friendly',
    includeImages: true,
    includeCallToActions: true
  });

  useEffect(() => {
    if (contentId) {
      loadSuggestions();
    }
  }, [contentId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await UnifiedContentService.getAISuggestions(contentId);
      setSuggestions(response.suggestions || []);
      setError(null);
    } catch (err) {
      console.error('Error loading AI suggestions:', err);
      setError('Failed to load AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      setGenerationInProgress(true);
      await UnifiedContentService.generateAISuggestions(contentId, {
        ...aiSettings,
        ...generationPrefs
      });
      await loadSuggestions();
      setError(null);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate AI suggestions. Please try again.');
    } finally {
      setGenerationInProgress(false);
    }
  };

  const applySuggestion = async (suggestion) => {
    try {
      setLoading(true);
      await UnifiedContentService.applySuggestion(contentId, suggestion.id);

      // Update suggestion status locally
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id
            ? { ...s, status: 'applied', appliedAt: new Date() }
            : s
        )
      );

      if (onSuggestionApplied) {
        onSuggestionApplied(suggestion);
      }

      setError(null);
    } catch (err) {
      console.error('Error applying suggestion:', err);
      setError('Failed to apply suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rejectSuggestion = async (suggestionId) => {
    try {
      await UnifiedContentService.rejectSuggestion(contentId, suggestionId);

      // Update suggestion status locally
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId
            ? { ...s, status: 'rejected', rejectedAt: new Date() }
            : s
        )
      );

      setError(null);
    } catch (err) {
      console.error('Error rejecting suggestion:', err);
      setError('Failed to reject suggestion. Please try again.');
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'content':
        return <ContentIcon />;
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      case 'seo':
        return <OptimizeIcon />;
      default:
        return <SuggestionIcon />;
    }
  };

  const getSuggestionColor = (confidence) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'primary';
    if (confidence >= 0.5) return 'warning';
    return 'default';
  };

  const getPendingSuggestionsCount = () => {
    return suggestions.filter(s => s.status === 'pending').length;
  };

  const renderSuggestionCard = (suggestion) => (
    <Card key={suggestion.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {getSuggestionIcon(suggestion.type)}
            <Typography variant="h6">
              {suggestion.title}
            </Typography>
            <Chip
              label={`${Math.round(suggestion.confidence * 100)}%`}
              size="small"
              color={getSuggestionColor(suggestion.confidence)}
            />
            <Chip
              label={suggestion.type}
              size="small"
              variant="outlined"
            />
          </Box>

          {suggestion.status === 'pending' && (
            <Box display="flex" gap={1}>
              <Tooltip title="Accept Suggestion">
                <IconButton
                  color="success"
                  onClick={() => applySuggestion(suggestion)}
                  disabled={loading}
                >
                  <AcceptIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject Suggestion">
                <IconButton
                  color="error"
                  onClick={() => rejectSuggestion(suggestion.id)}
                  disabled={loading}
                >
                  <RejectIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Typography variant="body1" color="textSecondary" mb={2}>
          {suggestion.description}
        </Typography>

        {suggestion.preview && (
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" color="textSecondary" mb={1}>
              Preview:
            </Typography>
            <Typography variant="body2">
              {suggestion.preview}
            </Typography>
          </Box>
        )}

        {suggestion.reasoning && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                Why this suggestion?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="textSecondary">
                {suggestion.reasoning}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}

        {suggestion.status !== 'pending' && (
          <Box mt={2}>
            <Chip
              label={`${suggestion.status} ${suggestion.appliedAt || suggestion.rejectedAt ?
                `on ${new Date(suggestion.appliedAt || suggestion.rejectedAt).toLocaleDateString()}` : ''}`}
              size="small"
              color={suggestion.status === 'applied' ? 'success' : 'default'}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderSettingsDialog = () => (
    <Dialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>AI Assistant Settings</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Suggestion Types */}
          <Typography variant="h6" gutterBottom>
            Suggestion Types
          </Typography>
          <Box mb={3}>
            {Object.entries(aiSettings.suggestionTypes).map(([type, enabled]) => (
              <FormControlLabel
                key={type}
                control={
                  <Switch
                    checked={enabled}
                    onChange={(e) =>
                      setAiSettings(prev => ({
                        ...prev,
                        suggestionTypes: {
                          ...prev.suggestionTypes,
                          [type]: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label={type.charAt(0).toUpperCase() + type.slice(1)}
              />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* AI Aggressiveness */}
          <Typography variant="h6" gutterBottom>
            AI Behavior
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Suggestion Aggressiveness</InputLabel>
            <Select
              value={aiSettings.aggressiveness}
              onChange={(e) =>
                setAiSettings(prev => ({ ...prev, aggressiveness: e.target.value }))
              }
            >
              <MenuItem value="conservative">Conservative - Only high-confidence suggestions</MenuItem>
              <MenuItem value="moderate">Moderate - Balanced approach</MenuItem>
              <MenuItem value="aggressive">Aggressive - More experimental suggestions</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={aiSettings.autoApply}
                onChange={(e) =>
                  setAiSettings(prev => ({ ...prev, autoApply: e.target.checked }))
                }
              />
            }
            label="Auto-apply high-confidence suggestions"
          />

          <Divider sx={{ my: 2 }} />

          {/* Content Generation Preferences */}
          <Typography variant="h6" gutterBottom>
            Content Generation Preferences
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Content Style</InputLabel>
            <Select
              value={generationPrefs.contentStyle}
              onChange={(e) =>
                setGenerationPrefs(prev => ({ ...prev, contentStyle: e.target.value }))
              }
            >
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Target Audience</InputLabel>
            <Select
              value={generationPrefs.targetAudience}
              onChange={(e) =>
                setGenerationPrefs(prev => ({ ...prev, targetAudience: e.target.value }))
              }
            >
              <MenuItem value="general">General Public</MenuItem>
              <MenuItem value="patients">Existing Patients</MenuItem>
              <MenuItem value="new_patients">New Patients</MenuItem>
              <MenuItem value="professionals">Healthcare Professionals</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={generationPrefs.includeImages}
                onChange={(e) =>
                  setGenerationPrefs(prev => ({ ...prev, includeImages: e.target.checked }))
                }
              />
            }
            label="Include image suggestions"
          />

          <FormControlLabel
            control={
              <Switch
                checked={generationPrefs.includeCallToActions}
                onChange={(e) =>
                  setGenerationPrefs(prev => ({ ...prev, includeCallToActions: e.target.checked }))
                }
              />
            }
            label="Include call-to-action suggestions"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setSettingsOpen(false)}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => setSettingsOpen(false)}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!contentId) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <BrainIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            AI Assistant Ready
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Select content to see AI-powered suggestions and improvements.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <AIIcon color="primary" />
          <Typography variant="h5">
            AI Assistant
          </Typography>
          {getPendingSuggestionsCount() > 0 && (
            <Badge badgeContent={getPendingSuggestionsCount()} color="primary">
              <SuggestionIcon />
            </Badge>
          )}
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<RegenerateIcon />}
            onClick={generateSuggestions}
            disabled={generationInProgress}
          >
            {generationInProgress ? 'Generating...' : 'Generate Suggestions'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && suggestions.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AIIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No suggestions available
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Generate AI suggestions to get content improvements and recommendations.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RegenerateIcon />}
              onClick={generateSuggestions}
              disabled={generationInProgress}
            >
              {generationInProgress ? 'Generating...' : 'Generate First Suggestions'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {/* Pending Suggestions */}
          {suggestions.filter(s => s.status === 'pending').length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Pending Suggestions ({suggestions.filter(s => s.status === 'pending').length})
              </Typography>
              {suggestions
                .filter(s => s.status === 'pending')
                .map(renderSuggestionCard)}
            </>
          )}

          {/* Applied/Rejected Suggestions */}
          {suggestions.filter(s => s.status !== 'pending').length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Previous Suggestions
              </Typography>
              {suggestions
                .filter(s => s.status !== 'pending')
                .map(renderSuggestionCard)}
            </>
          )}
        </Box>
      )}

      {renderSettingsDialog()}
    </Box>
  );
}

export default AIAssistant;