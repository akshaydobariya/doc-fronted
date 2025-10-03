import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          top: '-250px',
          left: '-250px',
          animation: 'float 20s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          bottom: '-200px',
          right: '-200px',
          animation: 'float 15s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(50px, 50px)' },
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          className="glassmorphism"
          sx={{
            padding: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            animation: 'fadeIn 0.8s ease-out',
          }}
        >
          {/* Logo/Icon */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
              mb: 3,
            }}
          >
            <CalendarIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1F2937 0%, #4B5563 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            MediSync
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 5,
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            Smart Appointment Management
          </Typography>

          {/* Login Buttons */}
          <Stack spacing={3}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<HospitalIcon />}
              onClick={() => login('doctor')}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 28px rgba(99, 102, 241, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Login as Doctor
            </Button>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<PersonIcon />}
              onClick={() => login('client')}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                borderWidth: 2,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.common.white, 0.8),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.common.white, 0.95),
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 28px rgba(99, 102, 241, 0.2)',
                },
                '&:active': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Login as Patient
            </Button>
          </Stack>

          {/* Footer Text */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 4,
              fontSize: '0.875rem',
              letterSpacing: '0.3px'
            }}
          >
            Secure • Fast • Reliable
          </Typography>
        </Box>

        {/* Bottom Branding */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 4,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          © 2025 MediSync. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;