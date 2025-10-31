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
  Close as CloseIcon,
} from '@mui/icons-material';
import useSharedServices from '../../hooks/useSharedServices';

/**
 * Glassmorphism Header Component
 * Modern glass effect with backdrop blur and transparent elements
 */
const GlassmorphismHeader = ({
  websiteId,
  selectedServiceIds = [],
  logoUrl = null,
  siteName = "Dental Practice",
  primaryColor = "#6366f1",
  textColor = "#1e293b",
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
    getCategoryDisplayName,
    getCategoryIcon
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
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const buttonStyles = {
    color: textColor,
    fontWeight: 600,
    fontSize: '14px',
    textTransform: 'none',
    borderRadius: '12px',
    padding: '8px 16px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    '&:hover': {
      color: 'white',
      background: `linear-gradient(135deg, ${primaryColor}aa, ${primaryColor}cc)`,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${primaryColor}40`,
      boxShadow: `0 8px 25px ${primaryColor}30`,
      transform: 'translateY(-2px)',
    }
  };

  const renderServicesDropdown = () => {
    if (loading) {
      return (
        <MenuItem>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: primaryColor }} />
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
      return Object.entries(servicesByCategory).map(([categoryId, categoryServices], index) => (
        <Box key={categoryId}>
          {index > 0 && <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />}
          <MenuItem disabled sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: primaryColor,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.7rem'
              }}>
                {getCategoryIcon(categoryId)} {getCategoryDisplayName(categoryId)}
              </Typography>
              <Chip
                label={categoryServices.length}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)`,
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
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
                pl: 3,
                borderRadius: '8px',
                mx: 1,
                my: 0.25,
                '&:hover': {
                  backgroundColor: `${primaryColor}15`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${primaryColor}30`
                },
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
            borderRadius: '8px',
            mx: 1,
            my: 0.25,
            '&:hover': {
              backgroundColor: `${primaryColor}15`,
              backdropFilter: 'blur(20px)'
            },
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
        py: 1.5
      }}>

        {/* Logo Section with Glass Effect */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          {logoUrl ? (
            <Box sx={{
              padding: '8px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <img
                src={logoUrl}
                alt={`${siteName} Logo`}
                style={{
                  maxWidth: 120,
                  height: 'auto',
                }}
              />
            </Box>
          ) : (
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 800,
                fontSize: '22px',
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              ✨ {siteName}
            </Typography>
          )}
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{
          flexGrow: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 2
        }}>
          <Button href="/" sx={buttonStyles}>
            Home
          </Button>

          <Box>
            <Button
              onClick={handleServicesClick}
              endIcon={<KeyboardArrowDown />}
              sx={{
                ...buttonStyles,
                background: servicesMenuOpen
                  ? `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}30)`
                  : 'rgba(255, 255, 255, 0.1)'
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
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                    color: 'white',
                    backdropFilter: 'blur(10px)'
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
                  minWidth: 340,
                  maxHeight: 450,
                  mt: 1,
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(25px)',
                  WebkitBackdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
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

        {/* Glass CTA Button */}
        <Button
          href="#book-appointment"
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            color: 'white',
            borderRadius: '16px',
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '14px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `0 8px 25px ${primaryColor}40`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}bb)`,
              transform: 'translateY(-3px)',
              boxShadow: `0 12px 35px ${primaryColor}50`,
            }
          }}
        >
          Book Appointment
        </Button>

        {/* Mobile Menu Button */}
        <IconButton
          sx={{
            display: { xs: 'flex', md: 'none' },
            ml: 1,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              background: `${primaryColor}30`,
              backdropFilter: 'blur(20px)'
            }
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default GlassmorphismHeader;