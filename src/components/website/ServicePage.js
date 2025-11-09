import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Breadcrumbs,
  Link,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Home as HomeIcon,
  MedicalServices as ServicesIcon
} from '@mui/icons-material';
import serviceService from '../../services/serviceService';
import websiteService from '../../services/websiteService';
import { generateCompleteSEOPackage } from '../../utils/seoUtils';
import BlogSection from '../blog/BlogSection';

/**
 * ServicePage Component
 * Displays a published service page with generated content
 * This is the public-facing component that website visitors see
 */
const ServicePage = () => {
  const { subdomain, serviceSlug, websiteId } = useParams();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState(null);
  const [servicePage, setServicePage] = useState(null);
  const [service, setService] = useState(null);
  const [error, setError] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);

  useEffect(() => {
    fetchServicePage();
  }, [subdomain, serviceSlug, websiteId]);

  // Update SEO metadata when service page loads
  useEffect(() => {
    if (servicePage && service && website) {
      updateSEOMetadata();
    }
  }, [servicePage, service, website]);

  // Fetch service page data
  const fetchServicePage = async () => {
    try {
      setLoading(true);

      let websiteData;

      // Handle different routing patterns
      if (websiteId) {
        // Route: /website/:websiteId/services/:serviceSlug
        const websiteResponse = await fetch(`http://localhost:5000/api/websites/public/info/${websiteId}`, {
          credentials: 'include'
        });

        if (!websiteResponse.ok) {
          throw new Error('Website not found');
        }

        const response = await websiteResponse.json();
        websiteData = response.data;
      } else if (subdomain) {
        // Route: /:subdomain/services/:serviceSlug (deprecated but supported)
        const websiteResponse = await fetch(`http://localhost:5000/api/websites/info/${subdomain}`, {
          credentials: 'include'
        });

        if (!websiteResponse.ok) {
          throw new Error('Website not found');
        }

        const response = await websiteResponse.json();
        websiteData = response.data;
      } else {
        // Route: /services/:serviceSlug (no website identifier)
        // Search for the service across all websites the user has access to
        console.log('No website identifier provided, searching for service:', serviceSlug);

        try {
          // For now, we'll just throw an error, but we could implement a search here
          // TODO: Implement cross-website service search
          throw new Error('Website identifier not provided. Please access services through the website builder.');
        } catch (searchError) {
          console.error('Error finding service:', searchError);
          throw new Error('Service page not found');
        }
      }

      setWebsite(websiteData);

      // Then get the service page using the public endpoint with cache-busting
      const cacheBuster = Date.now();
      const response = await fetch(`http://localhost:5000/api/services/public/page/${websiteData._id}/${serviceSlug}?_t=${cacheBuster}`, {
        credentials: 'include',
        cache: 'no-cache' // Ensure fresh data from server
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service page not found');
        }
        throw new Error('Failed to fetch service page');
      }

      const servicePageResponse = await response.json();
      const servicePage = servicePageResponse.data;

      if (!servicePage) {
        throw new Error('Service page not found');
      }

      setServicePage(servicePage);
      setService(servicePage.serviceId);

      // Fetch related services
      if (servicePage.serviceId?.category) {
        const relatedResponse = await serviceService.getServicesByCategory(
          servicePage.serviceId.category
        );
        const filteredRelated = relatedResponse.data
          .filter(s => s.slug !== serviceSlug)
          .slice(0, 3);
        setRelatedServices(filteredRelated);
      }

      // Increment view count
      await serviceService.trackServiceView(servicePage.serviceId._id || servicePage.serviceId);

    } catch (error) {
      console.error('Error fetching service page:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update document head with SEO metadata
  const updateSEOMetadata = () => {
    const practiceInfo = {
      name: website.name,
      location: website.location || '',
      baseUrl: websiteService.getWebsiteUrl(website)
    };

    const seoPackage = generateCompleteSEOPackage(
      service,
      practiceInfo,
      `${practiceInfo.baseUrl}/services/${service.slug}`
    );

    // Update document title
    document.title = seoPackage.basic.metaTitle;

    // Update meta description
    updateMetaTag('description', seoPackage.basic.metaDescription);

    // Update keywords
    updateMetaTag('keywords', seoPackage.basic.keywords.join(', '));

    // Update canonical URL
    updateLinkTag('canonical', seoPackage.basic.canonicalUrl);

    // Update Open Graph tags
    Object.entries(seoPackage.openGraph).forEach(([property, content]) => {
      updateMetaTag(property, content, 'property');
    });

    // Update Twitter Card tags
    Object.entries(seoPackage.twitterCard).forEach(([name, content]) => {
      updateMetaTag(name, content);
    });

    // Add structured data
    addStructuredData(seoPackage.structured);
  };

  // Helper function to update meta tags
  const updateMetaTag = (name, content, attribute = 'name') => {
    if (!content) return;

    let tag = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // Helper function to update link tags
  const updateLinkTag = (rel, href) => {
    if (!href) return;

    let tag = document.querySelector(`link[rel="${rel}"]`);
    if (!tag) {
      tag = document.createElement('link');
      tag.setAttribute('rel', rel);
      document.head.appendChild(tag);
    }
    tag.setAttribute('href', href);
  };

  // Helper function to add structured data
  const addStructuredData = (structuredData) => {
    // Remove existing structured data for this service
    const existingScript = document.querySelector('#service-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.id = 'service-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  // Handle booking appointment
  const handleBookAppointment = () => {
    // Navigate to appointment booking or open widget
    window.open('/widget', '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error || !servicePage || !service) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Service page not found'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const content = servicePage.content || {};

  return (
    <Box>
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Breadcrumbs>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/services"
            onClick={(e) => {
              e.preventDefault();
              navigate('/services');
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ServicesIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Services
          </Link>
          <Typography color="text.primary">{service.name}</Typography>
        </Breadcrumbs>
      </Container>

      {/* Hero Section */}
      {content.hero && (
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>
                  {content.hero.title || service.name}
                </Typography>
                {content.hero.subtitle && (
                  <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                    {content.hero.subtitle}
                  </Typography>
                )}
                {content.hero.description && (
                  <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
                    {content.hero.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    startIcon={<ScheduleIcon />}
                    onClick={handleBookAppointment}
                  >
                    {content.hero.ctaText || 'Book Appointment'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="inherit"
                    startIcon={<PhoneIcon />}
                    sx={{ borderColor: 'white', color: 'white' }}
                  >
                    Call Now
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Chip
                  label={service.categoryDisplayName}
                  color="secondary"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Overview Section */}
            {content.overview && (
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    {content.overview.title || 'Overview'}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.overview.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Benefits Section */}
            {content.benefits && content.benefits.list && content.benefits.list.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    {content.benefits.title || 'Benefits'}
                  </Typography>
                  {content.benefits.introduction && (
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {content.benefits.introduction}
                    </Typography>
                  )}
                  <Grid container spacing={2}>
                    {content.benefits.list.map((benefit, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <CheckIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {benefit.title}
                            </Typography>
                            {benefit.description && (
                              <Typography variant="body2" color="text.secondary">
                                {benefit.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Procedure Section */}
            {content.procedure && content.procedure.steps && content.procedure.steps.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    {content.procedure.title || 'The Procedure'}
                  </Typography>
                  {content.procedure.introduction && (
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {content.procedure.introduction}
                    </Typography>
                  )}
                  <List>
                    {content.procedure.steps.map((step, index) => (
                      <ListItem key={index} sx={{ alignItems: 'flex-start', px: 0 }}>
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}
                          >
                            {step.stepNumber || index + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={step.title}
                          secondary={step.description}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            {content.faq && content.faq.questions && content.faq.questions.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    {content.faq.title || 'Frequently Asked Questions'}
                  </Typography>
                  {content.faq.introduction && (
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {content.faq.introduction}
                    </Typography>
                  )}
                  {content.faq.questions.map((faq, index) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1">
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Aftercare Section */}
            {content.aftercare && content.aftercare.showSection && content.aftercare.instructions && (
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    {content.aftercare.title || 'Recovery & Aftercare'}
                  </Typography>
                  {content.aftercare.introduction && (
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {content.aftercare.introduction}
                    </Typography>
                  )}
                  <List>
                    {content.aftercare.instructions.map((instruction, index) => (
                      <ListItem key={index} sx={{ alignItems: 'flex-start', px: 0 }}>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={instruction.title}
                          secondary={
                            <>
                              {instruction.description}
                              {instruction.timeframe && (
                                <Chip
                                  label={instruction.timeframe}
                                  size="small"
                                  variant="outlined"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* CTA Card */}
            <Card sx={{ mb: 4, position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  {content.cta?.title || 'Ready to Get Started?'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {content.cta?.subtitle || `Schedule your ${service.name} consultation today.`}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={handleBookAppointment}
                  sx={{ mb: 2 }}
                >
                  {content.cta?.buttonText || 'Book Consultation'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<PhoneIcon />}
                >
                  Call {content.cta?.phoneNumber || '(555) 123-4567'}
                </Button>
              </CardContent>
            </Card>

            {/* Service Info */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Category"
                      secondary={service.categoryDisplayName}
                    />
                  </ListItem>
                  {service.duration?.procedure && (
                    <ListItem>
                      <ListItemText
                        primary="Duration"
                        secondary={`${service.duration.procedure} minutes`}
                      />
                    </ListItem>
                  )}
                  {service.priceDisplay && (
                    <ListItem>
                      <ListItemText
                        primary="Starting Price"
                        secondary={service.priceDisplay}
                      />
                    </ListItem>
                  )}
                  {service.requiresConsultation && (
                    <ListItem>
                      <ListItemText
                        primary="Consultation Required"
                        secondary="Yes"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Related Services
                  </Typography>
                  <List>
                    {relatedServices.map(relatedService => (
                      <ListItem
                        key={relatedService._id}
                        button
                        onClick={() => navigate(`/services/${relatedService.slug}`)}
                        sx={{ px: 0 }}
                      >
                        <ListItemText
                          primary={relatedService.name}
                          secondary={relatedService.shortDescription}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Blog Section - Display 6 related blog cards */}
      <BlogSection
        servicePageId={servicePage._id}
        serviceName={service.name}
        serviceSlug={service.slug}
        title={`Learn More About ${service.name}`}
        maxBlogs={6}
        showViewAll={true}
      />

      {/* Final CTA Section */}
      {content.cta && (
        <Box sx={{ bgcolor: content.cta.backgroundColor || 'primary.main', color: 'white', py: 8 }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom>
              {content.cta.title || 'Ready to Schedule Your Appointment?'}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              {content.cta.subtitle || `Experience the benefits of ${service.name} today.`}
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              startIcon={<ScheduleIcon />}
              onClick={handleBookAppointment}
              sx={{ mr: 2 }}
            >
              {content.cta.buttonText || 'Book Now'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              startIcon={<PhoneIcon />}
              sx={{ borderColor: 'white', color: 'white' }}
            >
              Call {content.cta.phoneNumber || '(555) 123-4567'}
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default ServicePage;