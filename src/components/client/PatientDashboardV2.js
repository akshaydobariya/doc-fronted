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
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
  InputAdornment
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon,
  EventAvailable as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import availabilityService from '../../services/availabilityService';
import calendarService from '../../services/calendarService';
import appointmentService from '../../services/appointmentService';

const PatientDashboardV2 = () => {
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
      const startDate = new Date(selectedDate + 'T00:00:00.000Z');
      const endDate = new Date(selectedDate + 'T23:59:59.999Z');

      const { slots } = await calendarService.getAvailableSlots(
        selectedDoctor,
        startDate.toISOString(),
        endDate.toISOString()
      );

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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading && doctors.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#F5F7FA">
        <CircularProgress size={60} sx={{ color: '#5F6FFF' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #E4E7EB',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#5F6FFF',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1D1F' }}>
                HealthCare
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#5F6FFF',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1D1F', lineHeight: 1 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6F767E' }}>
                    Patient
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={logout} size="small">
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1D1F', mb: 0.5 }}>
                Welcome back, {user?.name?.split(' ')[0]}!
              </Typography>
              <Typography variant="body1" sx={{ color: '#6F767E' }}>
                Book your next appointment or manage your existing ones
              </Typography>
            </Box>
          </Grid>

          {/* Book Appointment Card */}
          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid #E4E7EB',
                overflow: 'visible',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1D1F', mb: 3 }}>
                  Book an Appointment
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1D1F', mb: 1 }}>
                        Select Doctor
                      </Typography>
                      <Select
                        value={selectedDoctor}
                        onChange={handleDoctorChange}
                        displayEmpty
                        sx={{
                          borderRadius: '12px',
                          bgcolor: '#F5F7FA',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                          },
                        }}
                      >
                        <MenuItem value="" disabled>Choose a doctor</MenuItem>
                        {doctors.map((doctor) => (
                          <MenuItem key={doctor._id} value={doctor._id}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#5F6FFF', fontSize: '0.875rem' }}>
                                {doctor.name?.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Dr. {doctor.name}
                              </Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1D1F', mb: 1 }}>
                      Select Date
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      inputProps={{ min: getTodayDate() }}
                      disabled={!selectedDoctor}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#F5F7FA',
                          '& fieldset': {
                            border: 'none',
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!selectedDoctor}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1D1F', mb: 1 }}>
                        Appointment Type
                      </Typography>
                      <Select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        displayEmpty
                        sx={{
                          borderRadius: '12px',
                          bgcolor: '#F5F7FA',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                          },
                        }}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {appointmentTypes.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.name} ({type.duration} min)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleSearchSlots}
                      disabled={!selectedDoctor || !selectedDate || loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                      sx={{
                        bgcolor: '#5F6FFF',
                        color: 'white',
                        borderRadius: '12px',
                        py: 1.75,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#4A5AE8',
                          boxShadow: 'none',
                        },
                        '&:disabled': {
                          bgcolor: '#E4E7EB',
                          color: '#9CA3AF',
                        },
                      }}
                    >
                      {loading ? 'Searching...' : 'Search Available Slots'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Available Slots */}
            {availableSlots.length > 0 && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #E4E7EB',
                  mt: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1D1F', mb: 2 }}>
                    Available Time Slots
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6F767E', mb: 3 }}>
                    {availableSlots.length} slots available
                  </Typography>

                  <Grid container spacing={2}>
                    {availableSlots.map((slot) => (
                      <Grid item xs={6} sm={4} md={3} key={slot._id}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleSlotSelect(slot)}
                          sx={{
                            borderRadius: '12px',
                            py: 2,
                            border: '2px solid #E4E7EB',
                            color: '#1A1D1F',
                            textTransform: 'none',
                            flexDirection: 'column',
                            gap: 0.5,
                            '&:hover': {
                              borderColor: '#5F6FFF',
                              bgcolor: '#F5F6FF',
                            },
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {formatTime(slot.startTime)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6F767E' }}>
                            {slot.duration} min
                          </Typography>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Appointments Sidebar */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid #E4E7EB',
                position: 'sticky',
                top: 88,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1D1F' }}>
                    My Appointments
                  </Typography>
                  <Chip
                    label={myAppointments.length}
                    size="small"
                    sx={{
                      bgcolor: '#5F6FFF',
                      color: 'white',
                      fontWeight: 700,
                      height: 24,
                    }}
                  />
                </Stack>

                <Stack spacing={2} sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {myAppointments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CalendarIcon sx={{ fontSize: 48, color: '#E4E7EB', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#6F767E' }}>
                        No appointments yet
                      </Typography>
                    </Box>
                  ) : (
                    myAppointments.slice(0, 5).map((appointment) => (
                      <Paper
                        key={appointment._id}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          bgcolor: '#F5F7FA',
                          border: '1px solid #E4E7EB',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#5F6FFF', fontSize: '0.875rem' }}>
                            {appointment.doctor?.name?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1D1F', lineHeight: 1.2 }}>
                              Dr. {appointment.doctor?.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6F767E' }}>
                              {appointment.slot?.type}
                            </Typography>
                          </Box>
                          <Chip
                            label={appointment.status}
                            size="small"
                            sx={{
                              bgcolor: appointment.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7',
                              color: appointment.status === 'confirmed' ? '#065F46' : '#92400E',
                              fontWeight: 600,
                              height: 22,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#6F767E', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 14 }} />
                          {formatDateTime(appointment.slot?.startTime)}
                        </Typography>
                      </Paper>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Booking Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Confirm Booking
            </Typography>
            <IconButton onClick={() => setOpenConfirmDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {selectedSlot && (
            <Stack spacing={2.5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: '#F5F6FF',
                  border: '1px solid #E4E7EB',
                }}
              >
                <Typography variant="caption" sx={{ color: '#6F767E', display: 'block', mb: 1.5 }}>
                  Appointment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#6F767E', display: 'block' }}>
                      Doctor
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Dr. {doctors.find(d => d._id === selectedDoctor)?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#6F767E', display: 'block' }}>
                      Type
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedSlot.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#6F767E', display: 'block' }}>
                      Date & Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDateTime(selectedSlot.startTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#6F767E', display: 'block' }}>
                      Duration
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedSlot.duration} min
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <TextField
                fullWidth
                label="Name"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#6F767E', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={patientInfo.email}
                onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#6F767E', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Phone"
                value={patientInfo.phone}
                onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#6F767E', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Reason for Visit"
                value={patientInfo.reason}
                onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon sx={{ color: '#6F767E', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Additional Notes"
                value={patientInfo.notes}
                onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            sx={{
              borderRadius: '12px',
              px: 3,
              color: '#6F767E',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookAppointment}
            variant="contained"
            sx={{
              bgcolor: '#5F6FFF',
              borderRadius: '12px',
              px: 4,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4A5AE8',
                boxShadow: 'none',
              }
            }}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
            borderRadius: '12px',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientDashboardV2;
