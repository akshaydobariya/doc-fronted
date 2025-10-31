import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  MedicalServices as ServiceIcon,
  Schedule as TimeIcon,
  AttachMoney as PriceIcon,
  Star as BenefitIcon,
  Assignment as ProcedureIcon,
  QuestionAnswer as FAQIcon,
  LocalHospital as CareIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import serviceService from '../../services/serviceService';

/**
 * Service Page Display Component
 * Renders LLM-generated service content with proper SEO and design
 */
const ServicePageDisplay = ({
  serviceSlug,
  websiteId,
  design = {},
  showBookingCTA = true,
  showRelatedServices = true
}) => {
  const [servicePage, setServicePage] = useState(null);
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Design configuration
  const theme = {
    primaryColor: design.primaryColor || '#007cba',
    secondaryColor: design.secondaryColor || '#f8f9fa',
    textColor: design.textColor || '#333',
    backgroundColor: design.backgroundColor || '#ffffff',
    accentColor: design.accentColor || '#28a745',
    fontFamily: design.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  useEffect(() => {
    if (serviceSlug) {
      loadServicePage();
    }
  }, [serviceSlug, websiteId]);

  const loadServicePage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load service by slug
      const serviceResponse = await serviceService.getServiceBySlug(serviceSlug);
      const serviceData = serviceResponse.data;
      setService(serviceData);

      // Load service page content
      const pageResponse = await serviceService.getServicePage({
        serviceId: serviceData._id,
        websiteId
      });
      setServicePage(pageResponse.data);

      // Load related services
      if (showRelatedServices) {
        const relatedResponse = await serviceService.getAllServices({
          category: serviceData.category,
          isActive: true,
          limit: 4
        });
        setRelatedServices(
          relatedResponse.data.filter(s => s._id !== serviceData._id).slice(0, 3)
        );
      }

      // Track page view
      await serviceService.trackServiceView(serviceData._id);

    } catch (err) {
      console.error('Error loading service page:', err);
      setError('Service not found or failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  const renderSEOHead = () => {
    if (!servicePage?.seo || !service) return null;

    const seo = servicePage.seo;
    const canonicalUrl = `${window.location.origin}/services/${service.slug}`;

    return (
      <Helmet>
        <title>{seo.metaTitle || `${service.name} | Professional Dental Care`}</title>
        <meta name="description" content={seo.metaDescription || service.shortDescription} />
        <meta name="keywords" content={seo.keywords?.join(', ') || service.name} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={seo.metaTitle} />
        <meta property="og:description" content={seo.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.metaTitle} />
        <meta name="twitter:description" content={seo.metaDescription} />
        {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

        {/* Structured Data */}
        {seo.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(seo.structuredData)}
          </script>
        )}
      </Helmet>
    );
  };

  const renderBreadcrumbs = () => {
    if (!service) return null;

    const categoryName = service.categoryDisplayName ||
      service.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Home
        </Link>
        <Link color="inherit" href="/services">
          Services
        </Link>
        <Link color="inherit" href={`/services/category/${service.category}`}>
          {categoryName}
        </Link>
        <Typography color="text.primary">{service.name}</Typography>
      </Breadcrumbs>
    );
  };

  const renderHeroSection = () => {
    if (!service || !servicePage?.content) return null;

    const content = servicePage.content;

    return (
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.primaryColor}15 0%, ${theme.secondaryColor} 100%)`,
          py: { xs: 4, md: 6 },
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: theme.textColor,
                  mb: 2,
                  fontFamily: theme.fontFamily
                }}
              >
                {service.name}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: theme.textColor,
                  opacity: 0.8,
                  mb: 3,
                  lineHeight: 1.6
                }}
              >
                {service.shortDescription}
              </Typography>

              {content.serviceOverview && (
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.textColor,
                    mb: 4,
                    lineHeight: 1.7,
                    maxWidth: '600px'
                  }}
                >
                  {content.serviceOverview.substring(0, 300)}...
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                {service.duration && (
                  <Chip
                    icon={<TimeIcon />}
                    label={`${(service.duration.consultation || 0) + (service.duration.procedure || 0)} minutes`}
                    sx={{ backgroundColor: theme.primaryColor, color: 'white' }}
                  />
                )}

                {service.pricing && service.priceDisplay && (
                  <Chip
                    icon={<PriceIcon />}
                    label={service.priceDisplay}
                    sx={{ backgroundColor: theme.accentColor, color: 'white' }}
                  />
                )}

                <Chip
                  icon={<ServiceIcon />}
                  label={service.categoryDisplayName || service.category}
                  variant="outlined"
                />
              </Box>

              {showBookingCTA && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  sx={{
                    backgroundColor: theme.primaryColor,
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: theme.primaryColor,
                      filter: 'brightness(0.9)'
                    }
                  }}
                  href="#book-appointment"
                >
                  Book Appointment
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              {service.media?.featuredImage && (
                <Box
                  component="img"
                  src={service.media.featuredImage}
                  alt={service.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                />
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  };

  const renderServiceBenefits = () => {
    const benefits = servicePage?.content?.serviceBenefits;
    if (!benefits || !Array.isArray(benefits)) return null;

    return (
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            fontWeight: 600,
            color: theme.textColor,
            mb: 4,
            textAlign: 'center'
          }}
        >
          Benefits of {service.name}
        </Typography>

        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: `4px solid ${theme.primaryColor}`,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <BenefitIcon sx={{ color: theme.primaryColor, mt: 0.5 }} />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 1, color: theme.textColor }}
                      >
                        {benefit.title || `Benefit ${index + 1}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.textColor, lineHeight: 1.6 }}
                      >
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  };

  const renderProcedureSteps = () => {
    const steps = servicePage?.content?.procedureSteps;
    if (!steps || !Array.isArray(steps)) return null;

    return (
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            fontWeight: 600,
            color: theme.textColor,
            mb: 4,
            textAlign: 'center'
          }}
        >
          The {service.name} Procedure
        </Typography>

        <Grid container spacing={3}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${theme.primaryColor}20`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: theme.primaryColor,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      mr: 2
                    }}
                  >
                    {step.step || index + 1}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: theme.textColor }}
                  >
                    {step.title}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: theme.textColor, lineHeight: 1.6 }}
                >
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  };

  const renderFAQSection = () => {
    const faqs = servicePage?.content?.faqs;
    if (!faqs || !Array.isArray(faqs)) return null;

    return (
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            fontWeight: 600,
            color: theme.textColor,
            mb: 4,
            textAlign: 'center'
          }}
        >
          Frequently Asked Questions
        </Typography>

        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              borderRadius: 1,
              border: `1px solid ${theme.primaryColor}20`
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: theme.secondaryColor,
                '&:hover': { backgroundColor: `${theme.primaryColor}08` }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    );
  };

  const renderRelatedServices = () => {
    if (!showRelatedServices || relatedServices.length === 0) return null;

    return (
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            fontWeight: 600,
            color: theme.textColor,
            mb: 4,
            textAlign: 'center'
          }}
        >
          Related Services
        </Typography>

        <Grid container spacing={3}>
          {relatedServices.map((relatedService) => (
            <Grid item xs={12} md={4} key={relatedService._id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
                onClick={() => window.location.href = `/services/${relatedService.slug}`}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: theme.primaryColor }}
                  >
                    {relatedService.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.textColor, mb: 2, lineHeight: 1.6 }}
                  >
                    {relatedService.shortDescription}
                  </Typography>
                  <Button
                    size="small"
                    sx={{ color: theme.primaryColor }}
                    endIcon={<ArrowIcon />}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading service information...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          <Typography variant="h6">{error}</Typography>
          <Typography>
            The service you're looking for may have been moved or doesn't exist.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/services'}
          >
            View All Services
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.backgroundColor, minHeight: '100vh' }}>
      {renderSEOHead()}

      <Container maxWidth="lg" sx={{ py: 2 }}>
        {renderBreadcrumbs()}
      </Container>

      {renderHeroSection()}
      {renderServiceBenefits()}
      {renderProcedureSteps()}
      {renderFAQSection()}
      {renderRelatedServices()}

      {/* CTA Section */}
      {showBookingCTA && (
        <Box
          sx={{
            backgroundColor: theme.primaryColor,
            color: 'white',
            py: 6,
            textAlign: 'center'
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Schedule Your {service?.name}?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Our experienced dental team is here to provide you with exceptional care.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: theme.primaryColor,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
              href="#book-appointment"
            >
              Book Your Appointment Today
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default ServicePageDisplay;