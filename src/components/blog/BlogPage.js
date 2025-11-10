import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  Button,
  Grid,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Article as ArticleIcon,
  ArrowBack as BackIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import blogService from '../../services/blogService';

/**
 * BlogPage Component
 * Displays full blog content with Clove Dental 11-section structure
 * Includes SEO optimization and social sharing
 */
const BlogPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchBlogContent();
    }
  }, [slug]);

  const fetchBlogContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogService.getBlogBySlug(slug);

      if (response.success) {
        setBlog(response.data.blog);

        // Fetch related blogs
        const relatedResponse = await blogService.getRelatedBlogs(response.data.blog._id);
        if (relatedResponse.success) {
          setRelatedBlogs(relatedResponse.data.map(blog => blogService.formatBlogCardData(blog)));
        }

        // Update SEO metadata
        updateSEOMetadata(response.data.blog);
      } else {
        setError(response.message || 'Article not found');
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const updateSEOMetadata = (blogData) => {
    // Update document title
    document.title = blogData.metaTitle || blogData.title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = blogData.metaDescription || blogData.introduction;
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && blogData.seoKeywords) {
      metaKeywords.content = blogData.seoKeywords.join(', ');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.introduction,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading article...
        </Typography>
      </Container>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Article not found'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/blog')}>
          Back to Articles
        </Button>
      </Container>
    );
  }

  const { content } = blog;

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
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              navigate('/blog');
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ArticleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Articles
          </Link>
          <Typography color="text.primary">{blog.title}</Typography>
        </Breadcrumbs>
      </Container>

      {/* Two-column layout matching Clove Dental design */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content Column */}
          <Grid item xs={12} md={8}>
        {/* Article Header */}
        <Box sx={{ mb: 4 }}>
          <Chip
            label={blog.category?.replace('-', ' ').toUpperCase()}
            color="primary"
            sx={{ mb: 2 }}
          />

          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: 3, lineHeight: 1.2 }}>
            {blog.title}
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.5 }}>
            {blog.introduction}
          </Typography>

          {/* Article Meta */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="body2">
                By {blog.author}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {blogService.formatReadingTime(blog.readingTime)}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {blogService.formatPublishDate(blog.publishedAt)}
            </Typography>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<ShareIcon />} onClick={handleShare}>
                Share
              </Button>
            </Box>
          </Box>

          <Divider />
        </Box>

        {/* Key Takeaways */}
        {blog.keyTakeaways && blog.keyTakeaways.length > 0 && (
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Key Takeaways
            </Typography>
            <List dense>
              {blog.keyTakeaways.map((takeaway, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`• ${takeaway}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Article Content - 11 Sections */}
        {content && (
          <Box sx={{ '& > *': { mb: 4 } }}>
            {/* Section 1: Introduction */}
            {content.introduction && (
              <Card id="section-introduction">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.introduction.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.introduction.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 2: What is it? */}
            {content.whatIsIt && (
              <Card id="section-whatIsIt">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.whatIsIt.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.whatIsIt.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 3: Why need it? */}
            {content.whyNeedIt && (
              <Card id="section-whyNeedIt">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.whyNeedIt.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.whyNeedIt.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 4: Signs and Symptoms */}
            {content.signsSymptoms && (
              <Card id="section-signsSymptoms">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.signsSymptoms.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.signsSymptoms.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 5: Consequences of Delay */}
            {content.consequencesDelay && (
              <Card id="section-consequencesDelay">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.consequencesDelay.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.consequencesDelay.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 6: Treatment Process */}
            {content.treatmentProcess && (
              <Card id="section-treatmentProcess">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.treatmentProcess.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.treatmentProcess.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 7: Benefits */}
            {content.benefits && (
              <Card id="section-benefits">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.benefits.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.benefits.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 8: Recovery and Aftercare */}
            {content.recoveryAftercare && (
              <Card id="section-recoveryAftercare">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.recoveryAftercare.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.recoveryAftercare.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 9: Myths vs Facts */}
            {content.mythsFacts && (
              <Card id="section-mythsFacts">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.mythsFacts.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.mythsFacts.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 10: Cost Considerations */}
            {content.costConsiderations && (
              <Card id="section-costConsiderations">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.costConsiderations.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {content.costConsiderations.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Section 11: FAQ */}
            {content.faq && content.faq.questions && content.faq.questions.length > 0 && (
              <Card id="section-faq">
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ color: '#f58420' }}>
                    {content.faq.title}
                  </Typography>
                  {content.faq.questions.map((faq, index) => (
                    <Accordion key={index} sx={{
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid #e0e0e0',
                      mb: 1,
                      '&.Mui-expanded': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: '#f9f9f9',
                          '&:hover': {
                            bgcolor: '#f0f0f0'
                          },
                          '&.Mui-expanded': {
                            bgcolor: '#f58420',
                            color: 'white',
                            '& .MuiAccordionSummary-expandIconWrapper': {
                              color: 'white'
                            }
                          }
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ bgcolor: 'white', pt: 2 }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Article Footer */}
        <Box sx={{ mt: 6 }}>
          <Divider sx={{ mb: 3 }} />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {blog.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => navigate(`/blog/tag/${tag}`)}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

            {/* Call to Action */}
            <Card sx={{ mt: 4, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Ready to Schedule Your Consultation?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Our experienced team is here to help you achieve optimal dental health.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/appointment')}
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar Column - Sticky */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              position: { xs: 'static', md: 'sticky' },
              top: 100,
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto'
            }}>
              {/* Table of Contents */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{
                    color: '#f58420',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #f58420',
                    pb: 1,
                    mb: 2
                  }}>
                    Table of Contents
                  </Typography>
                  {content && (
                    <List dense sx={{ '& .MuiListItem-root': { py: 0.5 } }}>
                      {content.introduction && (
                        <ListItem button onClick={() => document.getElementById('section-introduction')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary="Introduction" sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.whatIsIt && (
                        <ListItem button onClick={() => document.getElementById('section-whatIsIt')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.whatIsIt.title || "What is it?"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.whyNeedIt && (
                        <ListItem button onClick={() => document.getElementById('section-whyNeedIt')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.whyNeedIt.title || "Why need it?"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.signsSymptoms && (
                        <ListItem button onClick={() => document.getElementById('section-signsSymptoms')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.signsSymptoms.title || "Signs & Symptoms"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.consequencesDelay && (
                        <ListItem button onClick={() => document.getElementById('section-consequencesDelay')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.consequencesDelay.title || "Consequences of Delay"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.treatmentProcess && (
                        <ListItem button onClick={() => document.getElementById('section-treatmentProcess')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.treatmentProcess.title || "Treatment Process"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.benefits && (
                        <ListItem button onClick={() => document.getElementById('section-benefits')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.benefits.title || "Benefits"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.recoveryAftercare && (
                        <ListItem button onClick={() => document.getElementById('section-recoveryAftercare')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.recoveryAftercare.title || "Recovery & Aftercare"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.mythsFacts && (
                        <ListItem button onClick={() => document.getElementById('section-mythsFacts')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.mythsFacts.title || "Myths vs Facts"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.costConsiderations && (
                        <ListItem button onClick={() => document.getElementById('section-costConsiderations')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.costConsiderations.title || "Cost Considerations"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                      {content.faq && content.faq.questions && content.faq.questions.length > 0 && (
                        <ListItem button onClick={() => document.getElementById('section-faq')?.scrollIntoView({ behavior: 'smooth' })}>
                          <ListItemText primary={content.faq.title || "FAQs"} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                        </ListItem>
                      )}
                    </List>
                  )}
                </CardContent>
              </Card>

              {/* Quick Consultation Card */}
              <Card sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #f58420 0%, #e6762b 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Get Expert Consultation
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                    Schedule a consultation with our dental experts to discuss your treatment options.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'white',
                      color: '#f58420',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                    onClick={() => navigate('/appointment')}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedBlogs && relatedBlogs.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{
                      color: '#f58420',
                      fontWeight: 'bold',
                      borderBottom: '2px solid #f58420',
                      pb: 1,
                      mb: 2
                    }}>
                      Related Articles
                    </Typography>
                    {relatedBlogs.map((relatedBlog, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          mb: 2,
                          pb: 2,
                          borderBottom: index < relatedBlogs.length - 1 ? '1px solid #e0e0e0' : 'none',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'grey.50'
                          },
                          borderRadius: 1,
                          p: 1
                        }}
                        onClick={() => navigate(`/blog/${relatedBlog.slug}`)}
                      >
                        {relatedBlog.featuredImage && (
                          <Box
                            component="img"
                            src={relatedBlog.featuredImage.url}
                            alt={relatedBlog.title}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 1,
                              mr: 2
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold" sx={{
                            mb: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {relatedBlog.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {blogService.formatReadingTime(relatedBlog.readingTime)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BlogPage;