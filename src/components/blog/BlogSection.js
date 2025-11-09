import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
  Container,
  Divider
} from '@mui/material';
import {
  Article as ArticleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BlogCard from './BlogCard';
import blogService from '../../services/blogService';

/**
 * BlogSection Component
 * Displays a section of blog cards on service pages
 * Shows 6 related blog posts per service
 */
const BlogSection = ({
  servicePageId,
  serviceName,
  serviceSlug,
  title = "Related Articles",
  maxBlogs = 6,
  showViewAll = true,
  variant = 'grid' // 'grid', 'carousel'
}) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (servicePageId) {
      fetchServiceBlogs();
    }
  }, [servicePageId, maxBlogs]);

  const fetchServiceBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogService.getBlogsByService(servicePageId, maxBlogs);

      if (response.success) {
        // Format blog data for display
        const formattedBlogs = response.data.map(blog => blogService.formatBlogCardData(blog));
        setBlogs(formattedBlogs);
      } else {
        setError(response.message || 'Failed to load articles');
      }
    } catch (err) {
      console.error('Error fetching service blogs:', err);
      setError('Unable to load related articles');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllBlogs = () => {
    navigate('/blog');
  };

  const handleBlogClick = (blog) => {
    // Navigate to full blog page
    navigate(`/blog/${blog.slug}`);
  };

  // Don't render section if no blogs and not loading
  if (!loading && blogs.length === 0 && !error) {
    return null;
  }

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h4" component="h2">
              {title}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {Array.from({ length: maxBlogs }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: 350 }}>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton variant="text" height={30} width="80%" />
                    <Skeleton variant="text" height={20} width="100%" />
                    <Skeleton variant="text" height={20} width="70%" />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="text" height={16} width="50%" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ArticleIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {serviceName ?
              `Explore comprehensive guides, tips, and insights about ${serviceName} to make informed decisions about your dental care.` :
              'Discover helpful articles and insights about dental care and treatments.'
            }
          </Typography>

          <Divider />
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Blog Grid */}
        {blogs.length > 0 && (
          <Grid container spacing={3}>
            {blogs.map((blog, index) => (
              <Grid item xs={12} sm={6} md={4} key={blog.id || index}>
                <BlogCard
                  blog={blog}
                  onClick={handleBlogClick}
                  showCategory={true}
                  showAuthor={true}
                  showReadMore={true}
                  variant={index === 0 && blogs.length > 3 ? 'featured' : 'standard'}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* View All Button */}
        {showViewAll && blogs.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllBlogs}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main'
                }
              }}
            >
              View All Articles
            </Button>
          </Box>
        )}

        {/* Empty State with Call-to-Action */}
        {!loading && !error && blogs.length === 0 && (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <ArticleIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Articles Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're working on creating helpful articles about {serviceName || 'this service'}.
              In the meantime, feel free to book a consultation to learn more.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/appointment')}
            >
              Book Consultation
            </Button>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default BlogSection;