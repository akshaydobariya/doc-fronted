import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
  Badge
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon,
  EventAvailable as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  VideoCall as VideoIcon,
  Notifications as NotificationIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import availabilityService from '../../services/availabilityService';
import calendarService from '../../services/calendarService';
import appointmentService from '../../services/appointmentService';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    reason: '',
    notes: ''
  });
  const [myAppointments, setMyAppointments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      await loadDoctors();
      await loadMyAppointments();
    } catch (error) {
      console.error('Dashboard init error:', error);
      showSnackbar('Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const { doctors: allDoctors } = await availabilityService.getAllDoctors();
      setDoctors(allDoctors);
    } catch (error) {
      console.error('Load doctors error:', error);
    }
  };

  const loadMyAppointments = async () => {
    try {
      const { appointments } = await appointmentService.getAppointments();
      setMyAppointments(appointments);
    } catch (error) {
      console.error('Load appointments error:', error);
    }
  };

  const handleDoctorChange = async (e) => {
    const doctorId = e.target.value;
    setSelectedDoctor(doctorId);
    setSelectedDate('');
    setSelectedType('');
    setAvailableSlots([]);

    if (doctorId) {
      try {
        // Load doctor's appointment types
        const { availability } = await availabilityService.getAvailability(doctorId);
        setAppointmentTypes(availability.appointmentTypes || []);
      } catch (error) {
        console.error('Load appointment types error:', error);
        showSnackbar('Error loading appointment types', 'error');
      }
    }
  };

  const handleSearchSlots = async () => {
    if (!selectedDoctor || !selectedDate) {
      showSnackbar('Please select doctor and date', 'warning');
      return;
    }

    try {
      setLoading(true);
      // Use UTC to match backend slot times
      const startDate = new Date(selectedDate + 'T00:00:00.000Z');
      const endDate = new Date(selectedDate + 'T23:59:59.999Z');

      const { slots } = await calendarService.getAvailableSlots(
        selectedDoctor,
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Filter by appointment type if selected
      let filteredSlots = slots.filter(slot => slot.isAvailable);
      if (selectedType) {
        filteredSlots = filteredSlots.filter(slot =>
          slot.type === selectedType || slot.appointmentType?._id === selectedType
        );
      }

      setAvailableSlots(filteredSlots);

      if (filteredSlots.length === 0) {
        showSnackbar('No available slots for selected date and type', 'info');
      }
    } catch (error) {
      console.error('Search slots error:', error);
      showSnackbar('Error loading available slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setOpenConfirmDialog(true);
  };

  const handleBookAppointment = async () => {
    if (!patientInfo.phone) {
      showSnackbar('Phone number is required', 'warning');
      return;
    }

    try {
      await calendarService.bookSlot(selectedSlot._id, {
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        reasonForVisit: patientInfo.reason,
        notes: patientInfo.notes
      });

      setOpenConfirmDialog(false);
      setSelectedSlot(null);
      setPatientInfo({ ...patientInfo, phone: '', reason: '', notes: '' });

      showSnackbar('Appointment booked successfully!', 'success');

      // Refresh data
      await handleSearchSlots();
      await loadMyAppointments();
    } catch (error) {
      console.error('Book appointment error:', error);
      showSnackbar(error.response?.data?.message || 'Failed to book appointment', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'primary',
      confirmed: 'success',
      cancelled: 'error',
      completed: 'default',
      'no-show': 'warning'
    };
    return colors[status] || 'default';
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading && doctors.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Modern Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #14B8A6 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: 3, position: 'relative', zIndex: 1 }}>
            {/* Top Navigation Bar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <HospitalIcon sx={{ color: '#0EA5E9', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    HealthCare Portal
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    Book & Manage Appointments
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <IconButton
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  onClick={logout}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Stack>
            </Stack>

            {/* Welcome Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1, letterSpacing: '-0.03em' }}>
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                  Book your next appointment or manage existing ones
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'white',
                  color: '#0EA5E9',
                  fontSize: '2rem',
                  fontWeight: 700,
                  border: '4px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4, mb: 4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {/* Quick Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '2px solid #93C5FD',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(59,130,246,0.2)' }
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <EventIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E40AF' }}>
                          {myAppointments.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1E40AF', fontWeight: 600 }}>
                          Total Appointments
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                    border: '2px solid #86EFAC',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(16,185,129,0.2)' }
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#065F46' }}>
                          {myAppointments.filter(a => a.status === 'confirmed').length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#065F46', fontWeight: 600 }}>
                          Confirmed
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    border: '2px solid #FCD34D',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(245,158,11,0.2)' }
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ScheduleIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#92400E' }}>
                          {myAppointments.filter(a => a.status === 'scheduled').length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#92400E', fontWeight: 600 }}>
                          Upcoming
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    background: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)',
                    border: '2px solid #5EEAD4',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(20,184,166,0.2)' }
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#134E4A' }}>
                          {doctors.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#134E4A', fontWeight: 600 }}>
                          Doctors Available
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Booking Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: 'white',
                border: '2px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(14,165,233,0.25)',
                  }}
                >
                  <CalendarIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Book New Appointment
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    Select a doctor, date and available time slot
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={3}>
                {/* Doctor Selection */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 600 }}>Select Doctor</InputLabel>
                    <Select
                      value={selectedDoctor}
                      onChange={handleDoctorChange}
                      label="Select Doctor"
                      sx={{
                        borderRadius: 2.5,
                        bgcolor: '#F9FAFB',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E5E7EB',
                          borderWidth: 2,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0EA5E9',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0EA5E9',
                        }
                      }}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#0EA5E9', fontSize: '0.875rem' }}>
                              {doctor.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>Dr. {doctor.name}</Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date Selection */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Select Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getTodayDate() }}
                    disabled={!selectedDoctor}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        bgcolor: '#F9FAFB',
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                          borderWidth: 2,
                        },
                        '&:hover fieldset': {
                          borderColor: '#0EA5E9',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0EA5E9',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                      }
                    }}
                  />
                </Grid>

                {/* Appointment Type Selection */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth disabled={!selectedDoctor}>
                    <InputLabel sx={{ fontWeight: 600 }}>Appointment Type (Optional)</InputLabel>
                    <Select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      label="Appointment Type (Optional)"
                      sx={{
                        borderRadius: 2.5,
                        bgcolor: '#F9FAFB',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E5E7EB',
                          borderWidth: 2,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0EA5E9',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0EA5E9',
                        }
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {appointmentTypes.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip
                              label={`${type.duration} min`}
                              size="small"
                              sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 700 }}
                            />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{type.name}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Search Button */}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSearchSlots}
                    disabled={!selectedDoctor || !selectedDate || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalendarIcon />}
                    fullWidth
                    sx={{
                      py: 2,
                      borderRadius: 2.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                      boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0284C7 0%, #0891B2 100%)',
                        boxShadow: '0 6px 16px rgba(14,165,233,0.4)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: '#E5E7EB',
                        color: '#9CA3AF',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Searching Available Slots...' : 'Find Available Time Slots'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Available Slots */}
          {availableSlots.length > 0 && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '2px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(139,92,246,0.25)',
                    }}
                  >
                    <TimeIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      Available Time Slots
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                      {availableSlots.length} slots available - Click to book
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={2.5}>
                  {availableSlots.map((slot) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={slot._id}>
                      <Card
                        elevation={0}
                        sx={{
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: '#E0E7FF',
                          bgcolor: '#F5F3FF',
                          borderRadius: 3,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'visible',
                          '&:hover': {
                            borderColor: '#8B5CF6',
                            transform: 'translateY(-6px) scale(1.02)',
                            boxShadow: '0 20px 25px -5px rgba(139,92,246,0.2), 0 10px 10px -5px rgba(139,92,246,0.15)',
                            bgcolor: 'white',
                          },
                          '&:hover::before': {
                            opacity: 1,
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -4,
                            left: -4,
                            right: -4,
                            bottom: -4,
                            background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                            borderRadius: '14px',
                            opacity: 0,
                            zIndex: -1,
                            transition: 'opacity 0.3s',
                          }
                        }}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <CardContent sx={{ p: 2.5, textAlign: 'center', '&:last-child': { pb: 2.5 } }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 12px',
                            }}
                          >
                            <TimeIcon sx={{ color: 'white', fontSize: 24 }} />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              color: '#5B21B6',
                              mb: 0.5,
                              fontSize: '1.125rem'
                            }}
                          >
                            {formatTime(slot.startTime)}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: '#7C3AED',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              mb: 1
                            }}
                          >
                            {slot.duration} min
                          </Typography>

                          <Chip
                            label={slot.type}
                            size="small"
                            sx={{
                              bgcolor: '#DDD6FE',
                              color: '#5B21B6',
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 22,
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* My Appointments */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: 'white',
                border: '2px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(16,185,129,0.25)',
                  }}
                >
                  <EventIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    My Appointments
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    {myAppointments.length} {myAppointments.length === 1 ? 'appointment' : 'appointments'} in your schedule
                  </Typography>
                </Box>
                <Chip
                  label={myAppointments.length}
                  sx={{
                    bgcolor: '#D1FAE5',
                    color: '#065F46',
                    fontWeight: 800,
                    fontSize: '1.125rem',
                    height: 40,
                    borderRadius: 2,
                    px: 2,
                  }}
                />
              </Stack>

              {myAppointments.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 3,
                    borderRadius: 3,
                    bgcolor: '#F9FAFB',
                    border: '2px dashed #D1D5DB',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 40, color: '#3B82F6' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                    No Appointments Yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                    Book your first appointment using the form above
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarIcon />}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    sx={{
                      borderRadius: 2.5,
                      borderWidth: 2,
                      fontWeight: 700,
                      '&:hover': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    Book Appointment
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {myAppointments.map((appointment) => (
                    <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          border: '2px solid #E5E7EB',
                          borderRadius: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: '#10B981',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(16,185,129,0.15)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 6,
                            background: appointment.status === 'confirmed'
                              ? 'linear-gradient(90deg, #10B981, #059669)'
                              : appointment.status === 'scheduled'
                              ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                              : 'linear-gradient(90deg, #6B7280, #4B5563)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3, pt: 4 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: '#0EA5E9',
                                  fontWeight: 700,
                                  fontSize: '1.125rem'
                                }}
                              >
                                {appointment.doctor?.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                                  Dr. {appointment.doctor?.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                  {appointment.doctor?.specialty || 'General Physician'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Stack>

                          <Chip
                            label={appointment.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: appointment.status === 'confirmed' ? '#D1FAE5' : appointment.status === 'scheduled' ? '#FEF3C7' : '#F3F4F6',
                              color: appointment.status === 'confirmed' ? '#065F46' : appointment.status === 'scheduled' ? '#92400E' : '#374151',
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              height: 24,
                              mb: 2,
                            }}
                          />

                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 1.5,
                                  bgcolor: '#EFF6FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <CalendarIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                              </Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                                  Date & Time
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                  {formatDateTime(appointment.slot?.startTime)}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 1.5,
                                  bgcolor: '#F5F3FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <TimeIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />
                              </Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                                  Type & Duration
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                  {appointment.slot?.type} • {appointment.slot?.duration || 30} min
                                </Typography>
                              </Box>
                            </Box>

                            {appointment.reasonForVisit && (
                              <Box
                                sx={{
                                  mt: 1,
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: '#F9FAFB',
                                  border: '1px solid #E5E7EB',
                                }}
                              >
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                  Reason for Visit
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 500 }}>
                                  {appointment.reasonForVisit}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Modern Booking Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Confirm Appointment
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Please verify your details
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setOpenConfirmDialog(false)} sx={{ color: '#6B7280' }}>
              <LogoutIcon sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {selectedSlot && (
            <Box>
              {/* Appointment Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                  border: '2px solid #BAE6FD',
                }}
              >
                <Typography variant="overline" sx={{ color: '#0369A1', fontWeight: 700, display: 'block', mb: 2 }}>
                  Appointment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: '#0EA5E9', width: 36, height: 36 }}>
                        {doctors.find(d => d._id === selectedDoctor)?.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          Doctor
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Dr. {doctors.find(d => d._id === selectedDoctor)?.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>
                      Date & Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {formatDateTime(selectedSlot.startTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>
                      Duration
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {selectedSlot.duration} minutes
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>
                      Type
                    </Typography>
                    <Chip
                      label={selectedSlot.type}
                      size="small"
                      sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 700 }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Patient Information Form */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                Your Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#F9FAFB',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={patientInfo.email}
                  onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#F9FAFB',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                  required
                  placeholder="e.g. +1 234 567 8900"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#F9FAFB',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Reason for Visit"
                  value={patientInfo.reason}
                  onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
                  placeholder="Brief description of your medical concern"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#F9FAFB',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  value={patientInfo.notes}
                  onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Any additional information..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#F9FAFB',
                    }
                  }}
                />
              </Stack>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2.5,
              borderWidth: 2,
              px: 3,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookAppointment}
            variant="contained"
            size="large"
            startIcon={<CheckIcon />}
            sx={{
              borderRadius: 2.5,
              px: 4,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 6px 16px rgba(16,185,129,0.4)',
              }
            }}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            '& .MuiAlert-icon': {
              fontSize: 28,
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientDashboard;