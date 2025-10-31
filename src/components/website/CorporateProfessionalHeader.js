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
  Divider,
  Badge
} from '@mui/material';
import {
  KeyboardArrowDown,
  Menu as MenuIcon,
  Close as CloseIcon,
  Business,
  Phone,
  Email,
  Schedule
} from '@mui/icons-material';
import useSharedServices from '../../hooks/useSharedServices';

/**
 * Corporate Professional Header Component
 * Clean, business-focused design with professional styling
 */
const CorporateProfessionalHeader = ({
  websiteId,
  selectedServiceIds = [],
  logoUrl = null,
  siteName = "Dental Practice",
  primaryColor = "#1565c0",
  secondaryColor = "#0d47a1",
  textColor = "#263238",
  showAllServices = false,
  groupByCategory = true,
  maxServicesInDropdown = 12,
  customNavigation = [],
  contactInfo = {
    phone: "(555) 123-4567",
    email: "info@dentalpractice.com",
    hours: "Mon-Fri 8AM-6PM"
  }
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

  const topBarStyles = {
    backgroundColor: secondaryColor,
    color: 'white',
    py: 0.5,
    borderBottom: `1px solid ${primaryColor}30`
  };

  const headerStyles = {
    backgroundColor: '#ffffff',
    color: textColor,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderBottom: `3px solid ${primaryColor}`,
  };

  const buttonStyles = {
    color: textColor,
    fontWeight: 600,
    fontSize: '14px',
    textTransform: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
    '&:hover': {
      color: primaryColor,
      backgroundColor: `${primaryColor}08`,
      border: `1px solid ${primaryColor}20`,
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
          {index > 0 && <Divider sx={{ my: 1 }} />}
          <MenuItem disabled sx={{ py: 1, backgroundColor: `${primaryColor}05` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Business sx={{ fontSize: 16, color: primaryColor }} />
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: primaryColor,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}>
                {getCategoryDisplayName(categoryId)}
              </Typography>
              <Badge
                badgeContent={categoryServices.length}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: primaryColor,
                    color: 'white',
                    fontSize: '0.6rem',
                    height: 16,
                    minWidth: 16
                  }
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
                pl: 4,
                borderLeft: `2px solid transparent`,
                '&:hover': {
                  backgroundColor: `${primaryColor}05`,
                  borderLeft: `2px solid ${primaryColor}`,
                  pl: 4
                },
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
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
            borderLeft: `2px solid transparent`,
            '&:hover': {
              backgroundColor: `${primaryColor}05`,
              borderLeft: `2px solid ${primaryColor}`
            },
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
            {service.name}
          </Typography>
        </MenuItem>
      ));
    }
  };

  return (
    <>
      {/* Top Contact Bar */}
      <Box sx={topBarStyles}>
        <Box sx={{
          maxWidth: 1200,
          margin: '0 auto',
          px: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: '12px' }}>
                {contactInfo.phone}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Email sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: '12px' }}>
                {contactInfo.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: '12px' }}>
              {contactInfo.hours}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Header */}
      <AppBar position="static" sx={headerStyles} elevation={0}>
        <Toolbar sx={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          px: { xs: 2, md: 3 },
          py: 1
        }}>

          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            {logoUrl ? (
              <Box sx={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${primaryColor}20`
              }}>
                <img
                  src={logoUrl}
                  alt={`${siteName} Logo`}
                  style={{
                    maxWidth: 150,
                    height: 'auto',
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business sx={{ fontSize: 28, color: primaryColor }} />
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    fontSize: '22px',
                    color: textColor,
                    textDecoration: 'none',
                    letterSpacing: '-0.5px'
                  }}
                >
                  {siteName}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{
            flexGrow: 1,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 0.5
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
                  backgroundColor: servicesMenuOpen ? `${primaryColor}08` : 'transparent',
                  border: servicesMenuOpen ? `1px solid ${primaryColor}20` : '1px solid transparent'
                }}
              >
                Our Services
                {!loading && services.length > 0 && (
                  <Chip
                    label={services.length}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 18,
                      fontSize: '0.65rem',
                      backgroundColor: primaryColor,
                      color: 'white',
                      fontWeight: 'bold'
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
                    mt: 0.5,
                    borderRadius: '4px',
                    border: `1px solid ${primaryColor}20`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
              About Us
            </Button>

            <Button href="/contact" sx={buttonStyles}>
              Contact
            </Button>

            <Button href="/patient-portal" sx={buttonStyles}>
              Patient Portal
            </Button>
          </Box>

          {/* Professional CTA Button */}
          <Button
            href="#book-appointment"
            variant="contained"
            sx={{
              backgroundColor: primaryColor,
              color: 'white',
              borderRadius: '4px',
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: `0 2px 8px ${primaryColor}40`,
              '&:hover': {
                backgroundColor: secondaryColor,
                boxShadow: `0 4px 12px ${primaryColor}50`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Schedule Appointment
          </Button>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{
              display: { xs: 'flex', md: 'none' },
              ml: 1,
              color: textColor,
              border: `1px solid ${primaryColor}20`,
              '&:hover': {
                backgroundColor: `${primaryColor}08`,
                color: primaryColor
              }
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default CorporateProfessionalHeader;