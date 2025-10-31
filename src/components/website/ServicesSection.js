import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  MedicalServices as ServiceIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import serviceService from '../../services/serviceService';

/**
 * ServicesSection Component
 * Displays integrated service pages within the main website
 * Shows only services that have been added to the website (isIntegrated: true)
 */
const ServicesSection = ({ websiteId, maxServices = 6, showTitle = true }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (websiteId) {
      fetchIntegratedServices();
    }
  }, [websiteId]);

  const fetchIntegratedServices = async () => {
    try {
      setLoading(true);

      // Get service pages that are integrated into the website
      const response = await serviceService.getServicePages(websiteId, {
        isIntegrated: true, // Only get services added to the website
        websiteSection: 'services'
      });

      if (response.success) {
        // Sort by integration date (newest first) and limit results
        const sortedServices = response.data
          .sort((a, b) => new Date(b.integratedAt) - new Date(a.integratedAt))
          .slice(0, maxServices);

        setServices(sortedServices);
      }
    } catch (error) {
      console.error('Error fetching integrated services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (serviceSlug) => {
    // Navigate to service page within the main website with website context
    navigate(`/website/${websiteId}/services/${serviceSlug}`);
  };

  const handleBookAppointment = () => {
    // Open appointment booking widget
    window.open('/widget', '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {showTitle && (
          <Skeleton variant="text" height={60} sx={{ mb: 4 }} />
        )}
        <Grid container spacing={4}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={250} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // No services state
  if (services.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {showTitle && (
          <Typography variant="h3" component="h2" textAlign="center" sx={{ mb: 4 }}>
            Our Services
          </Typography>
        )}
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          No services have been added to your website yet. Use the website builder to add services with AI-generated content.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        {showTitle && (
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom>
              Our Services
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
              Comprehensive dental care with AI-enhanced service information to help you make informed decisions about your oral health.
            </Typography>
          </Box>
        )}

        <Grid container spacing={4}>
          {services.map((servicePage) => {
            const service = servicePage.serviceId;
            const content = servicePage.content || {};

            return (
              <Grid item xs={12} sm={6} md={4} key={servicePage._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Service Category */}
                    <Chip
                      label={service.categoryDisplayName || service.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />

                    {/* Service Name */}
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {service.name}
                    </Typography>

                    {/* Service Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {content.overview?.content?.substring(0, 150) || service.shortDescription || 'Professional dental service tailored to your needs.'}
                      {(content.overview?.content?.length > 150 || service.shortDescription?.length > 150) && '...'}
                    </Typography>

                    {/* Service Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {service.duration?.procedure && (
                        <Typography variant="caption" color="text.secondary">
                          ⏱️ {service.duration.procedure} mins
                        </Typography>
                      )}
                      {service.priceDisplay && (
                        <Typography variant="caption" color="text.secondary">
                          💰 {service.priceDisplay}
                        </Typography>
                      )}
                    </Box>

                    {/* Benefits Preview */}
                    {content.benefits?.list && content.benefits.list.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                          Key Benefits:
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          • {content.benefits.list.slice(0, 2).map(b => b.title).join(' • ')}
                          {content.benefits.list.length > 2 && ' • ...'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<ArrowIcon />}
                      onClick={() => handleServiceClick(service.slug)}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    >
                      Learn More
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ScheduleIcon />}
                      onClick={handleBookAppointment}
                      size="small"
                      color="secondary"
                    >
                      Book Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Schedule a consultation to discuss which services are right for you.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ScheduleIcon />}
            onClick={handleBookAppointment}
            color="primary"
          >
            Book Appointment
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ServicesSection;