import React, { useState } from 'react';
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
  IconButton,
  Divider
} from '@mui/material';
import {
  KeyboardArrowDown,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useSharedServices from '../../hooks/useSharedServices';

/**
 * Modern Minimalist Header Component
 * Clean, minimal design with subtle animations and perfect typography
 */
const ModernMinimalistHeader = ({
  websiteId,
  selectedServiceIds = [],
  logoUrl = null,
  siteName = "Dental Practice",
  primaryColor = "#2563eb",
  textColor = "#1f2937",
  showAllServices = false,
  groupByCategory = true,
  maxServicesInDropdown = 12,
  customNavigation = []
}) => {
  // Use shared services hook with websiteId to get only integrated services
  const {
    services: allServices,
    categories,
    loading,
    error,
    filterServices,
    groupServicesByCategory,
    getCategoryDisplayName
  } = useSharedServices(websiteId);

  const [anchorEl, setAnchorEl] = useState(null);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter services based on component configuration
  const services = filterServices(selectedServiceIds, showAllServices, maxServicesInDropdown);
  const servicesByCategory = groupServicesByCategory(services);

  const handleServicesClick = (event) => {
    setAnchorEl(event.currentTarget);
    setServicesMenuOpen(true);
  };

  const handleServicesClose = () => {
    setAnchorEl(null);
    setServicesMenuOpen(false);
  };

  const headerStyles = {
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    borderBottom: '1px solid #f1f5f9',
    backdropFilter: 'blur(8px)',
  };

  const buttonStyles = {
    color: textColor,
    fontWeight: 500,
    fontSize: '15px',
    textTransform: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    minWidth: 'auto',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: primaryColor,
      backgroundColor: `${primaryColor}08`,
    }
  };

  const renderServicesDropdown = () => {
    if (loading) {
      return (
        <MenuItem>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={14} />
            <Typography variant="body2">Loading...</Typography>
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
      return Object.entries(servicesByCategory).map(([categoryId, categoryServices], index) => (
        <Box key={categoryId}>
          {index > 0 && <Divider sx={{ my: 1 }} />}
          <MenuItem disabled sx={{ py: 0.5, minHeight: 'auto' }}>
            <Typography variant="caption" sx={{
              fontWeight: 600,
              color: primaryColor,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.7rem'
            }}>
              {getCategoryDisplayName(categoryId)}
            </Typography>
          </MenuItem>
          {categoryServices.map((service) => (
            <MenuItem
              key={service._id}
              component={Link}
              href={websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}
              onClick={handleServicesClose}
              sx={{
                pl: 2,
                py: 0.5,
                '&:hover': { backgroundColor: `${primaryColor}06` },
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '14px'
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '14px' }}>
                {service.name}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      ));
    } else {
      return services.map((service) => (
        <MenuItem
          key={service._id}
          component={Link}
          href={websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}
          onClick={handleServicesClose}
          sx={{
            py: 0.5,
            '&:hover': { backgroundColor: `${primaryColor}06` },
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            {service.name}
          </Typography>
        </MenuItem>
      ));
    }
  };

  return (
    <AppBar position="static" sx={headerStyles} elevation={0}>
      <Toolbar sx={{
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        px: { xs: 2, md: 3 },
        py: 1
      }}>

        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 6 }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${siteName} Logo`}
              style={{
                maxWidth: 120,
                height: 'auto',
              }}
            />
          ) : (
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: '20px',
                color: textColor,
                textDecoration: 'none',
                letterSpacing: '-0.3px'
              }}
            >
              {siteName}
            </Typography>
          )}
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{
          flexGrow: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 1
        }}>
          <Button href="/" sx={buttonStyles}>
            Home
          </Button>

          <Box>
            <Button
              onClick={handleServicesClick}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              sx={{
                ...buttonStyles,
                backgroundColor: servicesMenuOpen ? `${primaryColor}08` : 'transparent'
              }}
            >
              Services
              {!loading && services.length > 0 && (
                <Chip
                  label={services.length}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 16,
                    fontSize: '0.65rem',
                    backgroundColor: primaryColor,
                    color: 'white',
                    '& .MuiChip-label': { px: 0.5 }
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
                  minWidth: 280,
                  maxHeight: 400,
                  mt: 0.5,
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }
              }}
            >
              {renderServicesDropdown()}
            </Menu>
          </Box>

          {customNavigation.map((item, index) => (
            <Button
              key={index}
              href={item.url}
              sx={buttonStyles}
            >
              {item.name}
            </Button>
          ))}

          <Button href="/about" sx={buttonStyles}>
            About
          </Button>

          <Button href="/contact" sx={buttonStyles}>
            Contact
          </Button>
        </Box>

        {/* CTA Button */}
        <Button
          href="#book-appointment"
          variant="contained"
          sx={{
            backgroundColor: primaryColor,
            color: 'white',
            borderRadius: '6px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: primaryColor,
              boxShadow: `0 4px 12px ${primaryColor}30`,
              transform: 'translateY(-1px)'
            }
          }}
        >
          Book Now
        </Button>

        {/* Mobile Menu Button */}
        <IconButton
          sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default ModernMinimalistHeader;