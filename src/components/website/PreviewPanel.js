import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility as PreviewIcon,
  Phone as MobileIcon,
  Tablet as TabletIcon,
  Computer as DesktopIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  BugReport as DebugIcon,
  Speed as PerformanceIcon,
  Accessibility as AccessibilityIcon
} from '@mui/icons-material';
import UnifiedContentService from '../../services/unifiedContentService';

/**
 * PreviewPanel Component
 *
 * Provides real-time preview of unified content with responsive
 * testing, performance analysis, and debugging capabilities.
 */
function PreviewPanel({ contentId, websiteId }) {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [accessibilityReport, setAccessibilityReport] = useState(null);

  // Preview frame ref
  const iframeRef = useRef(null);

  // Device dimensions
  const deviceSizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 }
  };

  useEffect(() => {
    if (contentId || websiteId) {
      generatePreviewUrl();
    }
  }, [contentId, websiteId]);

  const generatePreviewUrl = async () => {
    try {
      setLoading(true);

      let url;
      if (contentId) {
        url = await UnifiedContentService.getPreviewUrl(contentId);
      } else if (websiteId) {
        url = `/api/dynamic/preview/${websiteId}`;
      }

      setPreviewUrl(url);
      setError(null);
    } catch (err) {
      console.error('Error generating preview URL:', err);
      setError('Failed to generate preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const generateShareableLink = async () => {
    try {
      const shareableUrl = await UnifiedContentService.generateShareableLink(contentId, {
        expiresIn: '24h',
        password: false
      });

      navigator.clipboard.writeText(shareableUrl);
      setShareDialogOpen(false);

      // Show success message (you might want to use a snackbar here)
      alert('Shareable link copied to clipboard!');
    } catch (err) {
      console.error('Error generating shareable link:', err);
      setError('Failed to generate shareable link.');
    }
  };

  const runPerformanceAnalysis = async () => {
    try {
      setLoading(true);
      const metrics = await UnifiedContentService.analyzePerformance(contentId);
      setPerformanceMetrics(metrics);
    } catch (err) {
      console.error('Error running performance analysis:', err);
      setError('Failed to analyze performance.');
    } finally {
      setLoading(false);
    }
  };

  const runAccessibilityCheck = async () => {
    try {
      setLoading(true);
      const report = await UnifiedContentService.checkAccessibility(contentId);
      setAccessibilityReport(report);
    } catch (err) {
      console.error('Error running accessibility check:', err);
      setError('Failed to check accessibility.');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile':
        return <MobileIcon />;
      case 'tablet':
        return <TabletIcon />;
      case 'desktop':
        return <DesktopIcon />;
      default:
        return <DesktopIcon />;
    }
  };

  const getPreviewDimensions = () => {
    const device = deviceSizes[previewMode];
    return {
      width: device.width,
      height: device.height,
      maxWidth: '100%',
      maxHeight: '80vh'
    };
  };

  const renderPreviewFrame = () => {
    if (!previewUrl) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height={400}
          bgcolor="grey.100"
          borderRadius={1}
        >
          <PreviewIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Preview Available
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Select content to generate a preview
          </Typography>
        </Box>
      );
    }

    const dimensions = getPreviewDimensions();

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        p={2}
        bgcolor="grey.100"
        borderRadius={1}
        minHeight={400}
      >
        <Paper
          elevation={3}
          sx={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: dimensions.maxWidth,
            maxHeight: dimensions.maxHeight,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {debugMode && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bgcolor="warning.main"
              color="warning.contrastText"
              px={1}
              py={0.5}
              zIndex={1}
            >
              <Typography variant="caption">
                Debug Mode: {dimensions.width}x{dimensions.height}
              </Typography>
            </Box>
          )}

          <iframe
            ref={iframeRef}
            src={previewUrl}
            title="Content Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              marginTop: debugMode ? '24px' : '0'
            }}
            onLoad={() => setLoading(false)}
          />
        </Paper>
      </Box>
    );
  };

  const renderPerformanceMetrics = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Performance Analysis</Typography>
        <Button
          startIcon={<PerformanceIcon />}
          onClick={runPerformanceAnalysis}
          disabled={loading || !previewUrl}
        >
          Run Analysis
        </Button>
      </Box>

      {performanceMetrics ? (
        <Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Last analyzed: {new Date(performanceMetrics.timestamp).toLocaleString()}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Chip
              label={`Load Time: ${performanceMetrics.loadTime}ms`}
              color={performanceMetrics.loadTime < 3000 ? 'success' : 'warning'}
            />
            <Chip
              label={`Size: ${performanceMetrics.totalSize}KB`}
              color={performanceMetrics.totalSize < 500 ? 'success' : 'warning'}
            />
            <Chip
              label={`Images: ${performanceMetrics.imageCount}`}
              color="info"
            />
          </Box>

          <Typography variant="body2" mb={1}>
            <strong>Recommendations:</strong>
          </Typography>
          <ul>
            {performanceMetrics.recommendations.map((rec, index) => (
              <li key={index}>
                <Typography variant="body2">{rec}</Typography>
              </li>
            ))}
          </ul>
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Click "Run Analysis" to check performance metrics
        </Typography>
      )}
    </Box>
  );

  const renderAccessibilityReport = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Accessibility Check</Typography>
        <Button
          startIcon={<AccessibilityIcon />}
          onClick={runAccessibilityCheck}
          disabled={loading || !previewUrl}
        >
          Run Check
        </Button>
      </Box>

      {accessibilityReport ? (
        <Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Last checked: {new Date(accessibilityReport.timestamp).toLocaleString()}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Chip
              label={`Score: ${accessibilityReport.score}/100`}
              color={accessibilityReport.score >= 90 ? 'success' :
                     accessibilityReport.score >= 70 ? 'warning' : 'error'}
            />
            <Chip
              label={`Issues: ${accessibilityReport.issues.length}`}
              color={accessibilityReport.issues.length === 0 ? 'success' : 'error'}
            />
          </Box>

          {accessibilityReport.issues.length > 0 && (
            <>
              <Typography variant="body2" mb={1}>
                <strong>Issues Found:</strong>
              </Typography>
              <ul>
                {accessibilityReport.issues.slice(0, 5).map((issue, index) => (
                  <li key={index}>
                    <Typography variant="body2" color="error">
                      {issue.description}
                    </Typography>
                  </li>
                ))}
              </ul>
              {accessibilityReport.issues.length > 5 && (
                <Typography variant="body2" color="textSecondary">
                  ... and {accessibilityReport.issues.length - 5} more issues
                </Typography>
              )}
            </>
          )}

          {accessibilityReport.recommendations.length > 0 && (
            <>
              <Typography variant="body2" mb={1} mt={2}>
                <strong>Recommendations:</strong>
              </Typography>
              <ul>
                {accessibilityReport.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index}>
                    <Typography variant="body2">{rec}</Typography>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Click "Run Check" to analyze accessibility
        </Typography>
      )}
    </Box>
  );

  const renderShareDialog = () => (
    <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
      <DialogTitle>Share Preview</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" mb={2}>
          Generate a shareable link for this preview that others can view.
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Expiration</InputLabel>
          <Select defaultValue="24h">
            <MenuItem value="1h">1 Hour</MenuItem>
            <MenuItem value="24h">24 Hours</MenuItem>
            <MenuItem value="7d">7 Days</MenuItem>
            <MenuItem value="30d">30 Days</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={generateShareableLink}>
          Generate & Copy Link
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading && !previewUrl) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6">Preview</Typography>

          <ToggleButtonGroup
            value={previewMode}
            exclusive
            onChange={(e, newMode) => newMode && setPreviewMode(newMode)}
            size="small"
          >
            <ToggleButton value="mobile">
              <Tooltip title="Mobile (375px)">
                <MobileIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="tablet">
              <Tooltip title="Tablet (768px)">
                <TabletIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="desktop">
              <Tooltip title="Desktop (1200px)">
                <DesktopIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box display="flex" gap={1}>
          <Tooltip title="Debug Mode">
            <IconButton
              color={debugMode ? "primary" : "default"}
              onClick={() => setDebugMode(!debugMode)}
            >
              <DebugIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton onClick={refreshPreview} disabled={!previewUrl}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Open in New Tab">
            <IconButton onClick={openInNewTab} disabled={!previewUrl}>
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton
              onClick={() => setShareDialogOpen(true)}
              disabled={!previewUrl}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Preview Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
        <Tab label="Preview" icon={<PreviewIcon />} />
        <Tab label="Performance" icon={<PerformanceIcon />} />
        <Tab label="Accessibility" icon={<AccessibilityIcon />} />
      </Tabs>

      {/* Tab Content */}
      {tabValue === 0 && renderPreviewFrame()}
      {tabValue === 1 && renderPerformanceMetrics()}
      {tabValue === 2 && renderAccessibilityReport()}

      {/* Share Dialog */}
      {renderShareDialog()}
    </Box>
  );
}

export default PreviewPanel;