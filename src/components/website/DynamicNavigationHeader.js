import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  Chip,
  CircularProgress,
  Link,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  KeyboardArrowDown,
  MedicalServices as ServicesIcon
} from '@mui/icons-material';
import serviceService from '../../services/serviceService';

/**
 * Dynamic Navigation Header Component
 * A React component that loads services from the database and displays them in navigation
 * This replaces the static HTML approach with live data integration
 */
const DynamicNavigationHeader = ({
  websiteId,
  selectedServiceIds = [],
  logoUrl = null,
  siteName = "Dental Practice",
  primaryColor = "#007cba",
  textColor = "#333",
  showAllServices = false,
  groupByCategory = true,
  maxServicesInDropdown = 12,
  customNavigation = []
}) => {
  // State for services and navigation
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);

  // Load services and categories on mount
  useEffect(() => {
    loadServicesData();
  }, [selectedServiceIds, showAllServices]);

  const loadServicesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceService.getAllServices({ isActive: true }),
        serviceService.getCategories()
      ]);

      let allServices = servicesResponse.data || [];
      const allCategories = categoriesResponse.data || [];

      // Filter services based on selection if not showing all
      if (!showAllServices && selectedServiceIds.length > 0) {
        allServices = allServices.filter(service =>
          selectedServiceIds.includes(service._id)
        );
      }

      // Limit number of services if specified
      if (maxServicesInDropdown && allServices.length > maxServicesInDropdown) {
        allServices = allServices.slice(0, maxServicesInDropdown);
      }

      setServices(allServices);
      setCategories(allCategories);
    } catch (err) {
      console.error('Error loading services for navigation:', err);
      setError('Failed to load services');
      setServices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryId = service.category;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(service);
    return acc;
  }, {});

  // Get category display name
  const getCategoryDisplayName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '🦷';
  };

  // Handle services menu
  const handleServicesClick = (event) => {
    setAnchorEl(event.currentTarget);
    setServicesMenuOpen(true);
  };

  const handleServicesClose = () => {
    setAnchorEl(null);
    setServicesMenuOpen(false);
  };

  // Modern navigation styles
  const headerStyles = {
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    borderBottom: 'none',
    backdropFilter: 'blur(10px)',
    borderTop: `3px solid ${primaryColor}`
  };

  const buttonStyles = {
    color: textColor,
    fontWeight: 600,
    fontSize: '15px',
    textTransform: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      color: primaryColor,
      backgroundColor: `${primaryColor}10`,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  };

  // Render services dropdown content
  const renderServicesDropdown = () => {
    if (loading) {
      return (
        <MenuItem>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading services...</Typography>
          </Box>
        </MenuItem>
      );
    }

    if (error || services.length === 0) {
      return (
        <MenuItem>
          <Typography variant="body2" color="text.secondary">
            {error || 'No services available'}
          </Typography>
        </MenuItem>
      );
    }

    if (groupByCategory) {
      // Grouped by category
      return Object.entries(servicesByCategory).map(([categoryId, categoryServices], index) => (
        <Box key={categoryId}>
          {index > 0 && <Divider />}
          <MenuItem disabled sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: primaryColor }}>
                {getCategoryIcon(categoryId)} {getCategoryDisplayName(categoryId)}
              </Typography>
              <Chip
                label={categoryServices.length}
                size="small"
                sx={{ height: 16, fontSize: '0.6rem' }}
                color="primary"
              />
            </Box>
          </MenuItem>
          {categoryServices.map((service) => (
            <MenuItem
              key={service._id}
              component={Link}
              href={websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}
              onClick={handleServicesClose}
              sx={{
                pl: 4,
                '&:hover': { backgroundColor: 'rgba(0, 124, 186, 0.04)' },
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Typography variant="body2">{service.name}</Typography>
            </MenuItem>
          ))}
        </Box>
      ));
    } else {
      // Flat list
      return services.map((service) => (
        <MenuItem
          key={service._id}
          component={Link}
          href={websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}
          onClick={handleServicesClose}
          sx={{
            '&:hover': { backgroundColor: 'rgba(0, 124, 186, 0.04)' },
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Typography variant="body2">{service.name}</Typography>
        </MenuItem>
      ));
    }
  };

  return (
    <AppBar position="static" sx={headerStyles} elevation={0}>
      <Toolbar sx={{ maxWidth: 1200, margin: '0 auto', width: '100%', px: { xs: 2, md: 3 } }}>

        {/* Modern Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${siteName} Logo`}
              style={{
                maxWidth: 140,
                height: 'auto',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          ) : (
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 800,
                fontSize: '24px',
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
                letterSpacing: '-0.5px'
              }}
            >
              {siteName}
            </Typography>
          )}
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>

          {/* Home */}
          <Button
            href="/"
            sx={buttonStyles}
          >
            Home
          </Button>

          {/* Services Dropdown */}
          <Box>
            <Button
              onClick={handleServicesClick}
              endIcon={<KeyboardArrowDown />}
              sx={{
                ...buttonStyles,
                backgroundColor: servicesMenuOpen ? 'rgba(0, 124, 186, 0.04)' : 'transparent'
              }}
            >
              Services
              {!loading && services.length > 0 && (
                <Chip
                  label={services.length}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                />
              )}
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={servicesMenuOpen}
              onClose={handleServicesClose}
              PaperProps={{
                sx: {
                  minWidth: 320,
                  maxHeight: 450,
                  mt: 1.5,
                  borderRadius: '16px',
                  border: `1px solid ${primaryColor}15`,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255,255,255,0.95)'
                }
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              {renderServicesDropdown()}
            </Menu>
          </Box>

          {/* Custom Navigation Links */}
          {customNavigation.map((item, index) => (
            <Button
              key={index}
              href={item.url}
              sx={buttonStyles}
            >
              {item.name}
            </Button>
          ))}

          {/* About */}
          <Button
            href="/about"
            sx={buttonStyles}
          >
            About
          </Button>

          {/* Contact */}
          <Button
            href="/contact"
            sx={buttonStyles}
          >
            Contact
          </Button>
        </Box>

        {/* Modern CTA Button */}
        <Button
          href="#book-appointment"
          variant="contained"
          sx={{
            backgroundColor: primaryColor,
            color: 'white',
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '14px',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
            boxShadow: `0 4px 14px ${primaryColor}30`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: `linear-gradient(135deg, ${primaryColor}ee 0%, ${primaryColor}bb 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${primaryColor}40`
            }
          }}
        >
          Book Appointment
        </Button>
      </Toolbar>

      {/* Debug Info in Development */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{
          backgroundColor: '#f5f5f5',
          px: 2,
          py: 0.5,
          borderTop: '1px solid #e0e0e0',
          fontSize: '0.75rem',
          color: '#666'
        }}>
          Services: {services.length} |
          Selected: {showAllServices ? 'All' : selectedServiceIds.length} |
          Categories: {Object.keys(servicesByCategory).length} |
          WebsiteId: {websiteId || 'None'}
        </Box>
      )}
    </AppBar>
  );
};

export default DynamicNavigationHeader;