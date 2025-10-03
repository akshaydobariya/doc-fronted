import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { CircularProgress, Container, Typography, Box } from '@mui/material';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) return;

      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && !hasProcessed.current) {
        hasProcessed.current = true;

        try {
          setStatus('Authenticating with Google...');
          const response = await api.post('/api/auth/google/callback', {
            code,
            state
          });

          console.log('Auth callback response:', response.data);
          console.log('Response headers:', response.headers);

          // Store user data in localStorage as backup
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          if (state === 'doctor') {
            setStatus('Setting up your calendar...');
            // Give backend time to setup webhook and sync
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          setStatus('Redirecting to dashboard...');
          // Use window.location for full page reload to ensure cookies are set
          window.location.href = state === 'doctor' ? '/doctor/dashboard' : '/client/dashboard';
        } catch (error) {
          console.error('Auth callback failed:', error);
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1500);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box textAlign="center">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          {status}
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthCallback;