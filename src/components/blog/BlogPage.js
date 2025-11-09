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
      <Container maxWidth="md" sx={{ py: 2 }}>
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

      <Container maxWidth="md" sx={{ py: 4 }}>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
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
              <Card>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    {content.faq.title}
                  </Typography>
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
      </Container>
    </Box>
  );
};

export default BlogPage;