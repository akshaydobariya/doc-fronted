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
  Psychology,
  Biotech,
  Science,
  SmartToy,
  FlashOn
} from '@mui/icons-material';
import useSharedServices from '../../hooks/useSharedServices';

/**
 * Futuristic Tech Header Component
 * High-tech design with neon accents, animations, and sci-fi styling
 */
const FuturisticTechHeader = ({
  websiteId,
  selectedServiceIds = [],
  logoUrl = null,
  siteName = "Dental Practice",
  primaryColor = "#00ff88",
  secondaryColor = "#0099ff",
  accentColor = "#ff0066",
  textColor = "#ffffff",
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
    background: `linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)`,
    color: textColor,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${primaryColor}20, transparent)`,
      animation: 'scanline 3s linear infinite',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${secondaryColor}30, transparent)`,
      animation: 'shimmer 4s ease-in-out infinite',
    }
  };

  const buttonStyles = {
    color: textColor,
    fontWeight: 600,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderRadius: '0px',
    padding: '10px 20px',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${primaryColor}40`,
    background: 'rgba(0, 255, 136, 0.05)',
    backdropFilter: 'blur(10px)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(45deg, ${primaryColor}00, ${primaryColor}40, ${primaryColor}00)`,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover': {
      color: '#000000',
      background: primaryColor,
      border: `1px solid ${primaryColor}`,
      boxShadow: `0 0 20px ${primaryColor}80, inset 0 0 20px ${primaryColor}40`,
      transform: 'translateY(-2px)',
      '&::before': {
        opacity: 1,
      }
    }
  };

  const renderServicesDropdown = () => {
    if (loading) {
      return (
        <MenuItem sx={{ background: 'rgba(26, 26, 46, 0.95)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: primaryColor }} />
            <Typography variant="body2" sx={{ color: textColor }}>
              Scanning services...
            </Typography>
          </Box>
        </MenuItem>
      );
    }

    if (error || services.length === 0) {
      return (
        <MenuItem sx={{ background: 'rgba(26, 26, 46, 0.95)' }}>
          <Typography variant="body2" sx={{ color: accentColor }}>
            {error || 'No services detected'}
          </Typography>
        </MenuItem>
      );
    }

    if (groupByCategory) {
      return Object.entries(servicesByCategory).map(([categoryId, categoryServices], index) => (
        <Box key={categoryId}>
          {index > 0 && (
            <Divider sx={{
              my: 1,
              borderColor: primaryColor,
              '&::before, &::after': {
                borderColor: primaryColor
              }
            }} />
          )}
          <MenuItem disabled sx={{
            py: 1,
            background: `linear-gradient(90deg, rgba(0, 255, 136, 0.1), rgba(0, 153, 255, 0.1))`,
            border: `1px solid ${primaryColor}30`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {getCategoryIcon(categoryId)}
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: primaryColor,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontSize: '0.7rem',
                fontFamily: 'monospace'
              }}>
                {getCategoryDisplayName(categoryId)}
              </Typography>
              <Chip
                label={`[${categoryServices.length}]`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  color: '#000000',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  border: `1px solid ${primaryColor}`
                }}
              />
            </Box>
          </MenuItem>
          {categoryServices.map((service, serviceIndex) => (
            <MenuItem
              key={service._id}
              component={Link}
              href={websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}
              onClick={handleServicesClose}
              sx={{
                pl: 4,
                borderLeft: `2px solid ${primaryColor}30`,
                background: 'rgba(26, 26, 46, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: `linear-gradient(90deg, ${primaryColor}20, ${secondaryColor}20)`,
                  borderLeft: `2px solid ${primaryColor}`,
                  boxShadow: `inset 0 0 10px ${primaryColor}30`,
                  transform: 'translateX(5px)'
                },
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <FlashOn sx={{ fontSize: 14, mr: 1, color: primaryColor }} />
              <Typography variant="body2" sx={{
                fontWeight: 500,
                color: textColor,
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                {`[${(serviceIndex + 1).toString().padStart(2, '0')}] ${service.title}`}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      ));
    } else {
      return services.map((service, index) => (
        <MenuItem
          key={service._id}
          component={Link}
          href={websiteId ? `/website/${websiteId}/services/${service.slug}` : `/services/${service.slug}`}
          onClick={handleServicesClose}
          sx={{
            borderLeft: `2px solid ${primaryColor}30`,
            background: 'rgba(26, 26, 46, 0.8)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `linear-gradient(90deg, ${primaryColor}20, ${secondaryColor}20)`,
              borderLeft: `2px solid ${primaryColor}`,
              boxShadow: `inset 0 0 10px ${primaryColor}30`
            },
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <FlashOn sx={{ fontSize: 14, mr: 1, color: primaryColor }} />
          <Typography variant="body2" sx={{
            fontWeight: 500,
            color: textColor,
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {`[${index + 1}] ${service.name}`}
          </Typography>
        </MenuItem>
      ));
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes scanline {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes shimmer {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
          @keyframes glow {
            0%, 100% { text-shadow: 0 0 5px ${primaryColor}40; }
            50% { text-shadow: 0 0 20px ${primaryColor}80, 0 0 30px ${primaryColor}60; }
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
          zIndex: 2
        }}>

          {/* Futuristic Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            {logoUrl ? (
              <Box sx={{
                padding: '10px',
                border: `2px solid ${primaryColor}60`,
                borderRadius: '0px',
                background: 'rgba(0, 255, 136, 0.1)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor}, ${accentColor}, ${primaryColor})`,
                  borderRadius: '0px',
                  zIndex: -1,
                  animation: 'shimmer 2s linear infinite'
                }
              }}>
                <img
                  src={logoUrl}
                  alt={`${siteName} Logo`}
                  style={{
                    maxWidth: 140,
                    height: 'auto',
                    filter: `drop-shadow(0 0 10px ${primaryColor}60)`
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToy sx={{
                  fontSize: 32,
                  color: primaryColor,
                  animation: 'glow 2s ease-in-out infinite'
                }} />
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 900,
                    fontSize: '24px',
                    color: textColor,
                    textDecoration: 'none',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    animation: 'glow 3s ease-in-out infinite',
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor})`,
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

          {/* Tech Navigation */}
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
                endIcon={<KeyboardArrowDown />}
                sx={{
                  ...buttonStyles,
                  background: servicesMenuOpen
                    ? `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)`
                    : 'rgba(0, 255, 136, 0.05)',
                  border: servicesMenuOpen ? `1px solid ${primaryColor}` : `1px solid ${primaryColor}40`
                }}
              >
                Services
                {!loading && services.length > 0 && (
                  <Chip
                    label={`[${services.length}]`}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 22,
                      fontSize: '0.65rem',
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      color: '#000000',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      border: `1px solid ${primaryColor}`
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
                    minWidth: 380,
                    maxHeight: 500,
                    mt: 1,
                    borderRadius: '0px',
                    background: 'rgba(10, 10, 10, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${primaryColor}60`,
                    boxShadow: `0 0 30px ${primaryColor}40, inset 0 0 30px ${primaryColor}20`,
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

          {/* Futuristic CTA Button */}
          <Button
            href="#book-appointment"
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
              color: '#000000',
              borderRadius: '0px',
              px: 4,
              py: 1.5,
              textTransform: 'uppercase',
              fontWeight: 900,
              fontSize: '12px',
              letterSpacing: '2px',
              fontFamily: 'monospace',
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 20px ${accentColor}60, inset 0 0 20px ${accentColor}30`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                transition: 'left 0.5s ease',
              },
              '&:hover': {
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: `0 0 30px ${accentColor}80, inset 0 0 30px ${accentColor}40`,
                '&::before': {
                  left: '100%',
                }
              }
            }}
          >
            <FlashOn sx={{ fontSize: 16, mr: 1 }} />
            Initialize
          </Button>

          {/* Tech Mobile Menu Button */}
          <IconButton
            sx={{
              display: { xs: 'flex', md: 'none' },
              ml: 1,
              background: 'rgba(0, 255, 136, 0.1)',
              border: `2px solid ${primaryColor}60`,
              color: primaryColor,
              '&:hover': {
                background: `${primaryColor}30`,
                boxShadow: `0 0 15px ${primaryColor}60`
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

export default FuturisticTechHeader;