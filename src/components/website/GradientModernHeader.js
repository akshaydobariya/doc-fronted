import {
  AutoAwesome,
  Close as CloseIcon,
  KeyboardArrowDown,
  LocalHospital,
  Menu as MenuIcon
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@mui/material';
import { useState } from 'react';
import useSharedServices from '../../hooks/useSharedServices';

/**
 * Gradient Modern Header Component
 * Bold gradient design with vibrant colors and modern animations
 */
const GradientModernHeader = ({
  websiteId,
  selectedServiceIds = [],
  logoUrl = null,
  siteName = "Dental Practice",
  primaryColor = "#8b5cf6",
  secondaryColor = "#06b6d4",
  textColor = "#ffffff",
  showAllServices = false,
  groupByCategory = true,
  maxServicesInDropdown = 12,
  customNavigation = []
}) => {
  // Use shared services hook to prevent multiple API calls
  const {
    services: allServices,
    categories,
    loading,
    error,
    filterServices,
    groupServicesByCategory,
    getCategoryDisplayName,
    getCategoryIcon
  } = useSharedServices();

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
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    borderBottom: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
      backgroundSize: '20px 20px',
      animation: 'gradientMove 20s linear infinite',
    }
  };

  const buttonStyles = {
    color: textColor,
    fontWeight: 600,
    fontSize: '14px',
    textTransform: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      color: primaryColor,
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid rgba(255, 255, 255, 0.8)',
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
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
          {index > 0 && <Divider sx={{ my: 1, background: `linear-gradient(90deg, transparent, ${primaryColor}30, transparent)` }} />}
          <MenuItem disabled sx={{ py: 1, background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography variant="caption" sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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
                  height: 20,
                  fontSize: '0.6rem',
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  color: 'white',
                  fontWeight: 'bold'
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
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
                  transform: 'translateX(8px)',
                  borderLeft: `3px solid ${primaryColor}`
                },
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <LocalHospital sx={{ fontSize: 16, mr: 1, color: primaryColor }} />
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
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
              transform: 'translateX(8px)'
            },
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <LocalHospital sx={{ fontSize: 16, mr: 1, color: primaryColor }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {service.name}
          </Typography>
        </MenuItem>
      ));
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes gradientMove {
            0% { transform: translateX(-20px); }
            100% { transform: translateX(20px); }
          }
        `}
      </style>
      <AppBar position="static" sx={headerStyles} elevation={0}>
        <Toolbar sx={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          px: { xs: 2, md: 3 },
          py: 2,
          position: 'relative',
          zIndex: 1
        }}>

          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            {logoUrl ? (
              <Box sx={{
                padding: '10px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(15px)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <img
                  src={logoUrl}
                  alt={`${siteName} Logo`}
                  style={{
                    maxWidth: 130,
                    height: 'auto',
                    filter: 'brightness(1.1) contrast(1.1)'
                  }}
                />
              </Box>
            ) : (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AutoAwesome sx={{
                  fontSize: 28,
                  color: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 900,
                    fontSize: '26px',
                    color: 'white',
                    textDecoration: 'none',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,1), rgba(255,255,255,0.8))',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
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
            gap: 1.5
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
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: servicesMenuOpen ? primaryColor : textColor
                }}
              >
                Services
                {!loading && services.length > 0 && (
                  <Chip
                    label={services.length}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 22,
                      fontSize: '0.7rem',
                      background: servicesMenuOpen ? primaryColor : 'rgba(255, 255, 255, 0.3)',
                      color: servicesMenuOpen ? 'white' : textColor,
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
                    minWidth: 360,
                    maxHeight: 500,
                    mt: 1,
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))`,
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${primaryColor}30`,
                    boxShadow: `0 20px 40px ${primaryColor}20`,
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

          {/* Gradient CTA Button */}
          <Button
            href="#book-appointment"
            variant="contained"
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '16px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '15px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 8px 25px rgba(255,255,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.95)',
                color: primaryColor,
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: '0 15px 40px rgba(255,255,255,0.4)',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }
            }}
          >
            <AutoAwesome sx={{ fontSize: 18, mr: 1 }} />
            Book Now
          </Button>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{
              display: { xs: 'flex', md: 'none' },
              ml: 1,
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.9)',
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

export default GradientModernHeader;