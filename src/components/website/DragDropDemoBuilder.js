import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Tooltip,
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
  Alert,
  Divider
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  Preview as PreviewIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Import drag and drop
let DragDropContext, Droppable, Draggable;
try {
  const dnd = require('react-beautiful-dnd');
  DragDropContext = dnd.DragDropContext;
  Droppable = dnd.Droppable;
  Draggable = dnd.Draggable;
} catch (error) {
  console.warn('react-beautiful-dnd not installed, drag and drop disabled');
  DragDropContext = ({ children }) => children;
  Droppable = ({ children }) => children({ droppableProps: {}, innerRef: () => {} });
  Draggable = ({ children }) => children({ draggableProps: {}, dragHandleProps: {}, innerRef: () => {} });
}

import ServiceComponentLibrary from './ServiceComponentLibrary';
import UnifiedContentService from '../../services/unifiedContentService';

// Component preview renderer
const ComponentPreview = ({ component, onEdit, onDelete, onDuplicate, isDragDisabled }) => {
  const [editing, setEditing] = useState(false);
  const [localProps, setLocalProps] = useState(component.props || {});

  const handleSave = () => {
    onEdit(component.id, { props: localProps });
    setEditing(false);
  };

  const renderPreview = () => {
    switch (component.type) {
      case 'ServiceHero':
        return (
          <Box sx={{
            p: 4,
            background: `linear-gradient(135deg, ${component.props?.backgroundColor || '#1976d2'}, ${component.props?.secondaryColor || '#1565c0'})`,
            color: 'white',
            textAlign: 'center',
            borderRadius: 2
          }}>
            <Typography variant="h3" gutterBottom>
              {component.props?.title || 'Service Title'}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {component.props?.subtitle || 'Professional care you can trust'}
            </Typography>
            <Typography variant="body1" paragraph>
              {component.props?.description || 'Expert dental services with modern technology.'}
            </Typography>
            <Button variant="contained" color="secondary" size="large">
              {component.props?.ctaText || 'Book Appointment'}
            </Button>
          </Box>
        );

      case 'ServiceOverview':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {component.props?.title || 'About This Service'}
            </Typography>
            <Typography variant="body1" paragraph>
              {component.props?.content || 'Comprehensive description of our dental service...'}
            </Typography>
            <Grid container spacing={2}>
              {(component.props?.highlights || ['Expert Care', 'Modern Technology', 'Comfortable Experience']).map((highlight, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Chip icon={<AIIcon />} label={highlight} color="primary" />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'ServiceBenefits':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {component.props?.title || 'Benefits'}
            </Typography>
            <Grid container spacing={3}>
              {(component.props?.benefits || [
                { title: 'Expert Care', description: 'Professional treatment by experienced dentists', icon: '👨‍⚕️' },
                { title: 'Modern Technology', description: 'State-of-the-art equipment for precise procedures', icon: '🔬' },
                { title: 'Comfortable Experience', description: 'Pain-free procedures in a relaxing environment', icon: '😊' }
              ]).map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {benefit.icon} {benefit.title}
                      </Typography>
                      <Typography variant="body2">
                        {benefit.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'ServiceProcedure':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {component.props?.title || 'Procedure Steps'}
            </Typography>
            {(component.props?.steps || [
              { title: 'Consultation', description: 'Initial examination and treatment planning' },
              { title: 'Preparation', description: 'Preparing the treatment area' },
              { title: 'Treatment', description: 'Performing the dental procedure' },
              { title: 'Follow-up', description: 'Post-treatment care and monitoring' }
            ]).map((step, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                <Chip label={index + 1} color="primary" sx={{ mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6">{step.title}</Typography>
                  <Typography variant="body2">{step.description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        );

      case 'ServiceFAQ':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {component.props?.title || 'Frequently Asked Questions'}
            </Typography>
            {(component.props?.faqs || [
              { question: 'How long does the procedure take?', answer: 'Most procedures are completed within 1-2 hours.' },
              { question: 'Is the treatment painful?', answer: 'We use modern techniques to ensure minimal discomfort.' },
              { question: 'What is the recovery time?', answer: 'Recovery typically takes 1-3 days depending on the procedure.' }
            ]).map((faq, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Q: {faq.question}
                </Typography>
                <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
                  A: {faq.answer}
                </Typography>
                <Divider />
              </Box>
            ))}
          </Box>
        );

      case 'ServiceCTA':
        return (
          <Box sx={{
            p: 4,
            background: `linear-gradient(135deg, ${component.props?.backgroundColor || '#4caf50'}, ${component.props?.secondaryColor || '#388e3c'})`,
            color: 'white',
            textAlign: 'center',
            borderRadius: 2
          }}>
            <Typography variant="h4" gutterBottom>
              {component.props?.title || 'Ready to Get Started?'}
            </Typography>
            <Typography variant="body1" paragraph>
              {component.props?.description || 'Schedule your appointment today and experience professional dental care.'}
            </Typography>
            <Button variant="contained" color="secondary" size="large">
              {component.props?.buttonText || 'Book Now'}
            </Button>
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 3, border: '2px dashed #ccc', textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {component.name || component.type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Component preview not available
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <Box sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
        display: 'flex',
        gap: 1
      }}>
        <Tooltip title="Edit Component">
          <IconButton size="small" onClick={() => setEditing(true)} sx={{ bgcolor: 'white' }}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate">
          <IconButton size="small" onClick={() => onDuplicate(component)} sx={{ bgcolor: 'white' }}>
            <CopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(component.id)} sx={{ bgcolor: 'white' }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        {!isDragDisabled && (
          <Tooltip title="Drag to reorder">
            <IconButton size="small" sx={{ bgcolor: 'white', cursor: 'grab' }}>
              <DragIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ p: 1 }}>
        <Chip
          label={component.name || component.type}
          size="small"
          color="primary"
          sx={{ mb: 1 }}
        />
        {renderPreview()}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editing} onClose={() => setEditing(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit {component.name || component.type}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {component.type === 'ServiceHero' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={localProps.title || ''}
                    onChange={(e) => setLocalProps({ ...localProps, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subtitle"
                    value={localProps.subtitle || ''}
                    onChange={(e) => setLocalProps({ ...localProps, subtitle: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={localProps.description || ''}
                    onChange={(e) => setLocalProps({ ...localProps, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CTA Button Text"
                    value={localProps.ctaText || ''}
                    onChange={(e) => setLocalProps({ ...localProps, ctaText: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="color"
                    label="Background Color"
                    value={localProps.backgroundColor || '#1976d2'}
                    onChange={(e) => setLocalProps({ ...localProps, backgroundColor: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {component.type === 'ServiceOverview' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={localProps.title || ''}
                    onChange={(e) => setLocalProps({ ...localProps, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Content"
                    value={localProps.content || ''}
                    onChange={(e) => setLocalProps({ ...localProps, content: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {/* Add more component-specific editing forms as needed */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// Main Drag and Drop Demo Builder
const DragDropDemoBuilder = ({ servicePageId }) => {
  const [components, setComponents] = useState([]);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [isDragDisabled, setIsDragDisabled] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Initialize with demo components
  useEffect(() => {
    const demoComponents = [
      {
        id: 'demo-hero',
        type: 'ServiceHero',
        name: 'Hero Section',
        order: 0,
        props: {
          title: 'Professional Teeth Whitening',
          subtitle: 'Brighten Your Smile with Expert Care',
          description: 'Transform your smile with our advanced teeth whitening technology. Safe, effective, and long-lasting results.',
          ctaText: 'Book Consultation',
          backgroundColor: '#1976d2',
          secondaryColor: '#1565c0'
        }
      },
      {
        id: 'demo-overview',
        type: 'ServiceOverview',
        name: 'Service Overview',
        order: 1,
        props: {
          title: 'About Teeth Whitening',
          content: 'Our professional teeth whitening service uses the latest technology to safely and effectively brighten your teeth. Our experienced team ensures comfortable treatment with dramatic results.',
          highlights: ['FDA Approved Technology', 'Experienced Professionals', 'Comfortable Environment', 'Long-lasting Results']
        }
      },
      {
        id: 'demo-benefits',
        type: 'ServiceBenefits',
        name: 'Benefits Section',
        order: 2,
        props: {
          title: 'Why Choose Our Whitening?',
          benefits: [
            { title: 'Expert Care', description: 'Professional treatment by certified dentists', icon: '👨‍⚕️' },
            { title: 'Safe Technology', description: 'FDA-approved whitening systems for optimal safety', icon: '🛡️' },
            { title: 'Fast Results', description: 'See dramatic improvements in just one session', icon: '⚡' },
            { title: 'Long-lasting', description: 'Results that last with proper maintenance', icon: '⭐' }
          ]
        }
      },
      {
        id: 'demo-procedure',
        type: 'ServiceProcedure',
        name: 'Procedure Steps',
        order: 3,
        props: {
          title: 'The Whitening Process',
          steps: [
            { title: 'Consultation', description: 'Initial examination and shade assessment' },
            { title: 'Preparation', description: 'Protecting gums and preparing teeth' },
            { title: 'Whitening Application', description: 'Professional-grade whitening gel application' },
            { title: 'Activation', description: 'Special light activation for enhanced results' },
            { title: 'Final Assessment', description: 'Results evaluation and aftercare instructions' }
          ]
        }
      },
      {
        id: 'demo-faq',
        type: 'ServiceFAQ',
        name: 'FAQ Section',
        order: 4,
        props: {
          title: 'Common Questions',
          faqs: [
            { question: 'How long does teeth whitening take?', answer: 'Most whitening sessions are completed in 60-90 minutes.' },
            { question: 'Is teeth whitening safe?', answer: 'Yes, our FDA-approved whitening systems are completely safe when performed by professionals.' },
            { question: 'How long do results last?', answer: 'With proper care, whitening results can last 6 months to 2 years.' },
            { question: 'Will it cause sensitivity?', answer: 'Some temporary sensitivity is normal but typically resolves within 24-48 hours.' }
          ]
        }
      },
      {
        id: 'demo-cta',
        type: 'ServiceCTA',
        name: 'Call to Action',
        order: 5,
        props: {
          title: 'Ready for a Brighter Smile?',
          description: 'Schedule your professional teeth whitening consultation today and see the difference our expert care can make.',
          buttonText: 'Book Your Appointment',
          backgroundColor: '#4caf50',
          secondaryColor: '#388e3c'
        }
      }
    ];

    setComponents(demoComponents);
  }, []);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setComponents(reorderedItems);

    if (autoSave && servicePageId) {
      // Auto-save to backend
      UnifiedContentService.updateComponents(servicePageId, reorderedItems, {
        source: 'drag_drop_demo',
        timestamp: Date.now()
      }).catch(console.error);
    }
  };

  // Handle component addition
  const handleComponentAdd = (componentData) => {
    const newComponent = {
      id: `comp_${Date.now()}`,
      type: componentData.type,
      name: componentData.name,
      order: components.length,
      props: { ...componentData.defaultProps }
    };

    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    setShowComponentLibrary(false);

    if (autoSave && servicePageId) {
      UnifiedContentService.updateComponents(servicePageId, newComponents, {
        source: 'drag_drop_demo',
        timestamp: Date.now()
      }).catch(console.error);
    }
  };

  // Handle component edit
  const handleComponentEdit = (componentId, updates) => {
    const newComponents = components.map(comp =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);

    if (autoSave && servicePageId) {
      UnifiedContentService.updateComponents(servicePageId, newComponents, {
        source: 'drag_drop_demo',
        timestamp: Date.now()
      }).catch(console.error);
    }
  };

  // Handle component deletion
  const handleComponentDelete = (componentId) => {
    const newComponents = components.filter(comp => comp.id !== componentId);
    setComponents(newComponents);

    if (autoSave && servicePageId) {
      UnifiedContentService.updateComponents(servicePageId, newComponents, {
        source: 'drag_drop_demo',
        timestamp: Date.now()
      }).catch(console.error);
    }
  };

  // Handle component duplication
  const handleComponentDuplicate = (component) => {
    const newComponent = {
      ...component,
      id: `comp_${Date.now()}`,
      order: components.length
    };

    const newComponents = [...components, newComponent];
    setComponents(newComponents);

    if (autoSave && servicePageId) {
      UnifiedContentService.updateComponents(servicePageId, newComponents, {
        source: 'drag_drop_demo',
        timestamp: Date.now()
      }).catch(console.error);
    }
  };

  // Generate AI content for all components
  const handleGenerateAIContent = async () => {
    try {
      if (!servicePageId) {
        alert('Service Page ID required for AI generation');
        return;
      }

      const result = await UnifiedContentService.generateAIContent(servicePageId, [
        'hero', 'overview', 'benefits', 'procedure', 'faq'
      ], {
        provider: 'auto',
        temperature: 0.7
      });

      if (result.success) {
        // Update components with AI-generated content
        const updatedComponents = components.map(comp => {
          if (comp.type === 'ServiceHero' && result.generatedContent.hero) {
            return {
              ...comp,
              props: {
                ...comp.props,
                ...result.generatedContent.hero
              }
            };
          }
          if (comp.type === 'ServiceOverview' && result.generatedContent.overview) {
            return {
              ...comp,
              props: {
                ...comp.props,
                ...result.generatedContent.overview
              }
            };
          }
          if (comp.type === 'ServiceBenefits' && result.generatedContent.benefits) {
            return {
              ...comp,
              props: {
                ...comp.props,
                ...result.generatedContent.benefits
              }
            };
          }
          return comp;
        });

        setComponents(updatedComponents);
        alert(`AI content generated successfully! Used ${result.tokensUsed} tokens.`);
      } else {
        alert(`Failed to generate AI content: ${result.error}`);
      }
    } catch (error) {
      alert(`Error generating AI content: ${error.message}`);
    }
  };

  return (
    <Box>
      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            🎨 Drag & Drop Website Builder Demo
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={!isDragDisabled}
                  onChange={(e) => setIsDragDisabled(!e.target.checked)}
                />
              }
              label="Drag & Drop"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
              }
              label="Auto-save"
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowComponentLibrary(true)}
            >
              Add Component
            </Button>
            <Button
              variant="outlined"
              startIcon={<AIIcon />}
              onClick={handleGenerateAIContent}
              disabled={!servicePageId}
            >
              Generate AI Content
            </Button>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Demo Features:</strong> Drag components to reorder • Click edit to modify content •
          Add new components from library • Generate AI content • Auto-save changes
        </Alert>
      </Paper>

      {/* Drag and Drop Canvas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="components" isDropDisabled={isDragDisabled}>
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ minHeight: 200 }}
            >
              {components.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', border: '2px dashed #ccc' }}>
                  <Typography variant="h6" gutterBottom>
                    No components yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Add components to start building your page
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowComponentLibrary(true)}
                  >
                    Add Your First Component
                  </Button>
                </Paper>
              ) : (
                components
                  .sort((a, b) => a.order - b.order)
                  .map((component, index) => (
                    <Draggable
                      key={component.id}
                      draggableId={component.id}
                      index={index}
                      isDragDisabled={isDragDisabled}
                    >
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                            transition: 'transform 0.2s ease'
                          }}
                        >
                          <ComponentPreview
                            component={component}
                            onEdit={handleComponentEdit}
                            onDelete={handleComponentDelete}
                            onDuplicate={handleComponentDuplicate}
                            isDragDisabled={isDragDisabled}
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))
              )}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* Component Library Dialog */}
      <Dialog
        open={showComponentLibrary}
        onClose={() => setShowComponentLibrary(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon />
            Component Library
          </Box>
        </DialogTitle>
        <DialogContent>
          <ServiceComponentLibrary onComponentSelect={handleComponentAdd} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComponentLibrary(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DragDropDemoBuilder;