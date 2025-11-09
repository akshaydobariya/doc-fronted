import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  ArrowForward as ReadMoreIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * BlogCard Component
 * Displays a single blog post in card format
 * Used in blog sections, service pages, and blog listings
 */
const BlogCard = ({
  blog,
  onClick,
  showCategory = true,
  showAuthor = true,
  showReadMore = true,
  variant = 'standard' // 'standard', 'compact', 'featured'
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(blog);
    } else {
      // Navigate to full blog page
      navigate(`/blog/${blog.slug}`);
    }
  };

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    navigate(`/blog/category/${blog.category}`);
  };

  const cardHeight = variant === 'compact' ? 280 : variant === 'featured' ? 400 : 350;
  const imageHeight = variant === 'compact' ? 120 : variant === 'featured' ? 200 : 160;

  return (
    <Card
      sx={{
        height: cardHeight,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
        position: 'relative'
      }}
      onClick={handleClick}
    >
      {/* Featured Image or Placeholder */}
      {blog.featuredImage ? (
        <CardMedia
          component="img"
          height={imageHeight}
          image={blog.featuredImage}
          alt={blog.title}
          sx={{
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            height: imageHeight,
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.contrastText'
          }}
        >
          <ArticleIcon sx={{ fontSize: variant === 'featured' ? 60 : 40 }} />
        </Box>
      )}

      {/* Category Chip */}
      {showCategory && blog.category && (
        <Chip
          label={blog.category.replace('-', ' ').toUpperCase()}
          size="small"
          color="primary"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            zIndex: 1
          }}
          onClick={handleCategoryClick}
        />
      )}

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Title */}
        <Typography
          variant={variant === 'featured' ? 'h6' : 'subtitle1'}
          fontWeight="bold"
          sx={{
            mb: 1,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: variant === 'compact' ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {blog.title}
        </Typography>

        {/* Excerpt */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: variant === 'compact' ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4
          }}
        >
          {blog.excerpt}
        </Typography>

        {/* Footer */}
        <Box sx={{ mt: 'auto' }}>
          {/* Meta Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {/* Reading Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {blog.readingTime}
              </Typography>
            </Box>

            {/* Author */}
            {showAuthor && blog.author && (
              <>
                <Typography variant="caption" color="text.secondary">•</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {blog.author}
                  </Typography>
                </Box>
              </>
            )}

            {/* Publish Date */}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {blog.publishDate}
            </Typography>
          </Box>

          {/* Read More Button */}
          {showReadMore && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {blog.tags?.slice(0, 2).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.6rem', height: 20 }}
                  />
                ))}
              </Box>

              <Tooltip title="Read full article">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleClick}
                  sx={{ ml: 1 }}
                >
                  <ReadMoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlogCard;