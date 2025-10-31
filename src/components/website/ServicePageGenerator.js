import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ServicePageGenerator = ({ service, websiteId, onSave, onClose }) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [editableContent, setEditableContent] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generation settings
  const [generationSettings, setGenerationSettings] = useState({
    provider: 'auto',
    temperature: 0.7,
    customKeywords: service?.seo?.keywords?.join(', ') || '',
    regenerateSections: {
      overview: true,
      benefits: true,
      procedure: true,
      faq: true,
      aftercare: true,
      seo: true
    }
  });

  // UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewMode, setPreviewMode] = useState(false);
  const [llmStatus, setLLMStatus] = useState(null);

  // Content sections configuration
  const contentSections = [
    { key: 'overview', label: 'Service Overview', icon: '📋' },
    { key: 'benefits', label: 'Benefits', icon: '✨' },
    { key: 'procedure', label: 'Procedure Steps', icon: '🔧' },
    { key: 'faq', label: 'FAQ Section', icon: '❓' },
    { key: 'aftercare', label: 'Aftercare', icon: '🏥' },
    { key: 'seo', label: 'SEO Metadata', icon: '🔍' }
  ];

  useEffect(() => {
    fetchLLMStatus();
  }, []);

  // Fetch LLM provider status
  const fetchLLMStatus = async () => {
    try {
      const response = await fetch('/api/services/llm/status', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLLMStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching LLM status:', error);
    }
  };

  // Generate content for all selected sections
  const generateContent = async () => {
    if (!service) return;

    setGenerating(true);
    const results = {};

    try {
      // Generate content for each selected section
      const promises = Object.entries(generationSettings.regenerateSections)
        .filter(([_, enabled]) => enabled)
        .map(async ([sectionKey]) => {
          try {
            const response = await fetch(`/api/services/${service._id}/generate-content`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                contentType: sectionKey === 'overview' ? 'serviceOverview' :
                           sectionKey === 'benefits' ? 'serviceBenefits' :
                           sectionKey === 'procedure' ? 'procedureSteps' :
                           sectionKey === 'faq' ? 'faqGeneration' :
                           sectionKey === 'aftercare' ? 'aftercareInstructions' :
                           sectionKey === 'seo' ? 'seoContent' : sectionKey,
                provider: generationSettings.provider,
                temperature: generationSettings.temperature,
                keywords: generationSettings.customKeywords.split(',').map(k => k.trim()).filter(Boolean)
              })
            });

            if (!response.ok) {
              throw new Error(`Failed to generate ${sectionKey}`);
            }

            const data = await response.json();
            return { sectionKey, content: data.data.content, success: true };

          } catch (error) {
            console.error(`Error generating ${sectionKey}:`, error);
            return { sectionKey, error: error.message, success: false };
          }
        });

      const sectionResults = await Promise.allSettled(promises);

      // Process results
      sectionResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const { sectionKey, content, success, error } = result.value;
          if (success) {
            results[sectionKey] = content;
          } else {
            results[sectionKey] = { error };
          }
        }
      });

      setGeneratedContent(results);
      setEditableContent(JSON.parse(JSON.stringify(results))); // Deep copy for editing

      showSnackbar('Content generated successfully!', 'success');

    } catch (error) {
      console.error('Error generating content:', error);
      showSnackbar('Failed to generate content', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Save service page
  const saveServicePage = async () => {
    if (!editableContent || !websiteId) return;

    setSaving(true);

    try {
      // Transform generated content into service page format
      const pageContent = transformContentToPageFormat(editableContent);

      const response = await fetch('/api/services/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          websiteId,
          serviceId: service._id,
          content: pageContent,
          seo: extractSEOFromContent(editableContent.seo),
          autoGenerate: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save service page');
      }

      const data = await response.json();
      showSnackbar('Service page saved successfully!', 'success');

      if (onSave) {
        onSave(data.data);
      }

    } catch (error) {
      console.error('Error saving service page:', error);
      showSnackbar('Failed to save service page', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Transform generated content to service page format
  const transformContentToPageFormat = (content) => {
    return {
      hero: {
        title: service.name,
        subtitle: service.shortDescription,
        description: content.overview || service.fullDescription,
        ctaText: 'Book Appointment'
      },
      overview: {
        title: 'Overview',
        content: content.overview
      },
      benefits: {
        title: 'Benefits',
        introduction: 'Here are the key benefits of this treatment:',
        list: parseContentToBenefits(content.benefits)
      },
      procedure: {
        title: 'The Procedure',
        introduction: 'Our procedure follows these careful steps:',
        steps: parseContentToProcedureSteps(content.procedure)
      },
      faq: {
        title: 'Frequently Asked Questions',
        introduction: 'Common questions about this treatment:',
        questions: parseContentToFAQs(content.faq)
      },
      aftercare: {
        title: 'Recovery & Aftercare',
        showSection: true,
        introduction: 'Proper aftercare is essential for optimal results:',
        instructions: parseContentToInstructions(content.aftercare)
      },
      cta: {
        title: 'Ready to Schedule Your Appointment?',
        subtitle: `Learn more about ${service.name} and how it can benefit you.`,
        buttonText: 'Book Consultation',
        backgroundColor: '#2563eb'
      }
    };
  };

  // Extract SEO metadata from generated content
  const extractSEOFromContent = (seoContent) => {
    if (!seoContent || typeof seoContent !== 'string') {
      return {
        metaTitle: `${service.name} | Professional Dental Care`,
        metaDescription: service.shortDescription,
        keywords: service.seo?.keywords || []
      };
    }

    // Parse SEO content (assuming it's structured text)
    const lines = seoContent.split('\n').filter(line => line.trim());
    const seo = {};

    lines.forEach(line => {
      if (line.toLowerCase().includes('meta title:')) {
        seo.metaTitle = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('meta description:')) {
        seo.metaDescription = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('keywords:')) {
        const keywordsText = line.split(':')[1]?.trim();
        seo.keywords = keywordsText?.split(',').map(k => k.trim()) || [];
      }
    });

    return {
      metaTitle: seo.metaTitle || `${service.name} | Professional Dental Care`,
      metaDescription: seo.metaDescription || service.shortDescription,
      keywords: seo.keywords || service.seo?.keywords || []
    };
  };

  // Parse content into structured benefits
  const parseContentToBenefits = (benefitsContent) => {
    if (!benefitsContent) return service.benefits?.map(benefit => ({ title: benefit, description: '' })) || [];

    // Try to parse structured benefits from generated content
    const lines = benefitsContent.split('\n').filter(line => line.trim());
    const benefits = [];

    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.match(/^\d+\./)) {
        const cleanLine = line.replace(/^[•\-\d\.]+\s*/, '').trim();
        if (cleanLine) {
          benefits.push({
            title: cleanLine.split(':')[0] || cleanLine,
            description: cleanLine.split(':')[1]?.trim() || ''
          });
        }
      }
    });

    return benefits.length > 0 ? benefits : [{ title: benefitsContent, description: '' }];
  };

  // Parse content into procedure steps
  const parseContentToProcedureSteps = (procedureContent) => {
    if (!procedureContent) return [];

    const lines = procedureContent.split('\n').filter(line => line.trim());
    const steps = [];
    let stepNumber = 1;

    lines.forEach(line => {
      if (line.match(/^\d+\./) || line.includes('Step')) {
        const cleanLine = line.replace(/^[\d\.\s]*/, '').replace(/^Step\s*\d+[:\.]?\s*/i, '').trim();
        if (cleanLine) {
          steps.push({
            stepNumber: stepNumber++,
            title: cleanLine.split(':')[0] || `Step ${stepNumber - 1}`,
            description: cleanLine.split(':')[1]?.trim() || cleanLine
          });
        }
      }
    });

    return steps;
  };

  // Parse content into FAQs
  const parseContentToFAQs = (faqContent) => {
    if (!faqContent) return service.faqs || [];

    const sections = faqContent.split(/(?=Q:|Question:)/i).filter(section => section.trim());
    const faqs = [];

    sections.forEach(section => {
      const lines = section.split('\n');
      let question = '';
      let answer = '';

      lines.forEach(line => {
        if (line.match(/^Q:|^Question:/i)) {
          question = line.replace(/^Q:|^Question:/i, '').trim();
        } else if (line.match(/^A:|^Answer:/i)) {
          answer = line.replace(/^A:|^Answer:/i, '').trim();
        } else if (question && !answer) {
          answer += line.trim() + ' ';
        }
      });

      if (question && answer) {
        faqs.push({ question, answer: answer.trim() });
      }
    });

    return faqs.length > 0 ? faqs : [{ question: 'What should I expect?', answer: faqContent }];
  };

  // Parse content into aftercare instructions
  const parseContentToInstructions = (aftercareContent) => {
    if (!aftercareContent) return [];

    const lines = aftercareContent.split('\n').filter(line => line.trim());
    const instructions = [];

    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.match(/^\d+\./)) {
        const cleanLine = line.replace(/^[•\-\d\.]+\s*/, '').trim();
        if (cleanLine) {
          instructions.push({
            title: cleanLine.split(':')[0] || 'Aftercare Step',
            description: cleanLine.split(':')[1]?.trim() || cleanLine,
            timeframe: 'As directed'
          });
        }
      }
    });

    return instructions.length > 0 ? instructions : [{ title: 'Follow Instructions', description: aftercareContent, timeframe: 'As directed' }];
  };

  // Copy content to clipboard
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      showSnackbar('Content copied to clipboard', 'success');
    });
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Render content section
  const renderContentSection = (sectionKey, content) => {
    if (!content) return null;

    const section = contentSections.find(s => s.key === sectionKey);
    const isError = content.error;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              {section?.icon} {section?.label}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => copyToClipboard(isError ? content.error : content)}>
                <CopyIcon />
              </IconButton>
              <IconButton size="small" onClick={() => {
                // Implement individual section regeneration
                const newSettings = { ...generationSettings };
                Object.keys(newSettings.regenerateSections).forEach(key => {
                  newSettings.regenerateSections[key] = key === sectionKey;
                });
                setGenerationSettings(newSettings);
                generateContent();
              }}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {isError ? (
            <Alert severity="error">
              <Typography variant="body2">{content.error}</Typography>
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography
                variant="body2"
                component="pre"
                sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
              >
                {content}
              </Typography>
            </Paper>
          )}

          {!isError && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Edit Content"
              value={editableContent?.[sectionKey] || content}
              onChange={(e) => setEditableContent(prev => ({
                ...prev,
                [sectionKey]: e.target.value
              }))}
              sx={{ mt: 2 }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  if (!service) {
    return (
      <Alert severity="error">
        No service selected for content generation.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="between">
          <Box>
            <Typography variant="h5" gutterBottom>
              Generate Content: {service.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Use AI to generate comprehensive content for your service page
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* LLM Status */}
        {llmStatus && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">
              Available Providers:
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              {llmStatus.providers.map(provider => (
                <Chip
                  key={provider.key}
                  label={provider.name}
                  size="small"
                  color={provider.enabled ? 'success' : 'default'}
                  icon={provider.enabled ? <CheckIcon /> : <WarningIcon />}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Generation Settings */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Generation Settings
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Temperature (Creativity)"
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                value={generationSettings.temperature}
                onChange={(e) => setGenerationSettings(prev => ({
                  ...prev,
                  temperature: parseFloat(e.target.value)
                }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Keywords (comma-separated)"
                value={generationSettings.customKeywords}
                onChange={(e) => setGenerationSettings(prev => ({
                  ...prev,
                  customKeywords: e.target.value
                }))}
                placeholder="dental care, oral health, smile makeover..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Sections to Generate:
              </Typography>
              <Grid container spacing={1}>
                {contentSections.map(section => (
                  <Grid item xs={6} sm={4} md={2} key={section.key}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generationSettings.regenerateSections[section.key]}
                          onChange={(e) => setGenerationSettings(prev => ({
                            ...prev,
                            regenerateSections: {
                              ...prev.regenerateSections,
                              [section.key]: e.target.checked
                            }
                          }))}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption">
                          {section.icon} {section.label}
                        </Typography>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={generating ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={generateContent}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Content'}
            </Button>

            {generatedContent && (
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Generated Content */}
      {generatedContent && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Generated Content
          </Typography>

          {Object.entries(generatedContent).map(([sectionKey, content]) => (
            <Box key={sectionKey}>
              {renderContentSection(sectionKey, content)}
            </Box>
          ))}

          {/* Save Actions */}
          <Paper elevation={2} sx={{ p: 2, mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={saveServicePage}
              disabled={saving || !editableContent}
              sx={{ mr: 2 }}
            >
              {saving ? 'Saving...' : 'Save Service Page'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={onClose}
            >
              Cancel
            </Button>
          </Paper>
        </Box>
      )}

      {/* Service Information */}
      {!generatedContent && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Name:</Typography>
                <Typography variant="body1" gutterBottom>{service.name}</Typography>

                <Typography variant="subtitle2" color="textSecondary">Category:</Typography>
                <Typography variant="body1" gutterBottom>{service.categoryDisplayName}</Typography>

                <Typography variant="subtitle2" color="textSecondary">Description:</Typography>
                <Typography variant="body2">{service.shortDescription}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                {service.benefits && service.benefits.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">Current Benefits:</Typography>
                    <List dense>
                      {service.benefits.slice(0, 3).map((benefit, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon sx={{ fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {service.seo?.keywords && service.seo.keywords.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Keywords:</Typography>
                    <Box mt={1}>
                      {service.seo.keywords.map((keyword, index) => (
                        <Chip key={index} label={keyword} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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
    </Box>
  );
};

export default ServicePageGenerator;