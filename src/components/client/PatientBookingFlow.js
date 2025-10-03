import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  LocationOn as LocationIcon,
  Description as NotesIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
  EventAvailable as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import availabilityService from '../../services/availabilityService';
import calendarService from '../../services/calendarService';
import appointmentService from '../../services/appointmentService';

const steps = ['Select Doctor', 'Choose Date & Time', 'Patient Details', 'Confirmation'];

const PatientBookingFlow = ({ embedded = false }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [patientDetails, setPatientDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    reason: '',
    notes: '',
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await availabilityService.getDoctors();
      setDoctors(response.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (doctorId) => {
    try {
      setLoading(true);
      const response = await availabilityService.getAvailability(doctorId);
      setAppointmentTypes(response.availability?.appointmentTypes || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      setError('Failed to load doctor availability');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (doctorId, date, typeId) => {
    try {
      setLoading(true);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const response = await calendarService.getSlots({
        doctorId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const filteredSlots = response.slots?.filter(
        (slot) => slot.isAvailable && slot.type === appointmentTypes.find(t => t._id === typeId)?.name
      ) || [];

      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    await loadAvailability(doctor._id);
    setActiveStep(1);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedDoctor && selectedType) {
      loadSlots(selectedDoctor._id, date, selectedType);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type._id);
    if (selectedDate && selectedDoctor) {
      loadSlots(selectedDoctor._id, selectedDate, type._id);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setActiveStep(2);
  };

  const handlePatientDetailsChange = (field, value) => {
    setPatientDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      setError('');

      const bookingData = {
        slotId: selectedSlot._id,
        patientName: patientDetails.name,
        patientEmail: patientDetails.email,
        patientPhone: patientDetails.phone,
        reason: patientDetails.reason,
        notes: patientDetails.notes,
      };

      const response = await calendarService.bookSlot(bookingData);

      setConfirmationData({
        appointmentId: response.appointment._id,
        doctor: selectedDoctor,
        date: selectedSlot.startTime,
        time: `${new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: selectedSlot.type,
        patient: patientDetails,
      });

      setBookingComplete(true);
      setActiveStep(3);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedType(null);
    setAvailableSlots([]);
    setBookingComplete(false);
    setConfirmationData(null);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleNext = () => {
    if (activeStep === 2 && validatePatientDetails()) {
      handleBookAppointment();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const validatePatientDetails = () => {
    if (!patientDetails.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!patientDetails.email.trim() || !/\S+@\S+\.\S+/.test(patientDetails.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!patientDetails.phone.trim() || patientDetails.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!patientDetails.reason.trim()) {
      setError('Please enter reason for visit');
      return false;
    }
    return true;
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedDoctor !== null;
      case 1:
        return selectedSlot !== null;
      case 2:
        return validatePatientDetails();
      default:
        return false;
    }
  };

  // Step 1: Select Doctor
  const renderDoctorSelection = () => (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3,
        }}
      >
        Choose Your Doctor
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select from our experienced healthcare professionals
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {doctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid',
                  borderColor: selectedDoctor?._id === doctor._id ? '#667eea' : 'transparent',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
                  },
                }}
                onClick={() => handleDoctorSelect(doctor)}
              >
                <Box
                  sx={{
                    position: 'relative',
                    pt: 3,
                    pb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      margin: '0 auto',
                      border: '4px solid white',
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      bgcolor: '#4F46E5',
                    }}
                  >
                    {doctor.name?.charAt(0)}
                  </Avatar>
                </Box>
                <CardContent sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Dr. {doctor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {doctor.specialty || 'General Physician'}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Verified"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {doctor.hasCalendarIntegration && (
                      <Chip
                        icon={<CalendarIcon />}
                        label="Available"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {doctors.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No doctors available at the moment. Please check back later.
        </Alert>
      )}
    </Box>
  );

  // Step 2: Choose Date & Time
  const renderDateTime = () => (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
        }}
      >
        Select Date & Time
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose a convenient time for your appointment with Dr. {selectedDoctor?.name}
      </Typography>

      {/* Appointment Type Selection */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon color="primary" /> Appointment Type
        </Typography>
        <Grid container spacing={2}>
          {appointmentTypes.map((type) => (
            <Grid item xs={12} sm={6} md={4} key={type._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: selectedType === type._id ? '#667eea' : '#E5E7EB',
                  bgcolor: selectedType === type._id ? '#667eea10' : 'white',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#667eea',
                    transform: 'scale(1.02)',
                  },
                }}
                onClick={() => handleTypeSelect(type)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {type.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.duration} minutes
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      width: 30,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: type.color || '#667eea',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Date Selection */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon color="primary" /> Select Date
        </Typography>
        <TextField
          type="date"
          fullWidth
          value={selectedDate || ''}
          onChange={(e) => handleDateChange(e.target.value)}
          InputProps={{
            inputProps: {
              min: new Date().toISOString().split('T')[0],
              max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '1.1rem',
            },
          }}
        />
      </Paper>

      {/* Time Slots */}
      {selectedDate && selectedType && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon color="primary" /> Available Time Slots
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : availableSlots.length > 0 ? (
            <Grid container spacing={2}>
              {availableSlots.map((slot) => (
                <Grid item xs={6} sm={4} md={3} key={slot._id}>
                  <Button
                    fullWidth
                    variant={selectedSlot?._id === slot._id ? 'contained' : 'outlined'}
                    onClick={() => handleSlotSelect(slot)}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {new Date(slot.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Button>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No available slots for this date. Please select another date.
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );

  // Step 3: Patient Details
  const renderPatientDetails = () => (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
        }}
      >
        Patient Information
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please provide your contact details
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={patientDetails.name}
              onChange={(e) => handlePatientDetailsChange('name', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={patientDetails.email}
              onChange={(e) => handlePatientDetailsChange('email', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={patientDetails.phone}
              onChange={(e) => handlePatientDetailsChange('phone', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Visit"
              value={patientDetails.reason}
              onChange={(e) => handlePatientDetailsChange('reason', e.target.value)}
              required
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                    <NotesIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              value={patientDetails.notes}
              onChange={(e) => handlePatientDetailsChange('notes', e.target.value)}
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Appointment Summary */}
        <Box sx={{ bgcolor: '#F9FAFB', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Appointment Summary
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Doctor:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Dr. {selectedDoctor?.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Date:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Time:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(selectedSlot?.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {new Date(selectedSlot?.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Type:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {selectedSlot?.type}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );

  // Step 4: Confirmation
  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)',
        }}
      >
        <CheckIcon sx={{ fontSize: 60, color: 'white' }} />
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#10B981' }}>
        Booking Confirmed!
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Your appointment has been successfully scheduled
      </Typography>

      <Paper
        sx={{
          p: 4,
          maxWidth: 600,
          margin: '0 auto',
          borderRadius: 3,
          border: '2px solid #10B981',
          background: 'linear-gradient(135deg, #10B98110 0%, #05966910 100%)',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
              Appointment ID
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              #{confirmationData?.appointmentId.substring(0, 8).toUpperCase()}
            </Typography>
          </Box>

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Doctor
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Dr. {confirmationData?.doctor.name}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {confirmationData?.type}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Date
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(confirmationData?.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Time
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {confirmationData?.time}
              </Typography>
            </Grid>
          </Grid>

          <Divider />

          <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Patient
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {confirmationData?.patient.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {confirmationData?.patient.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {confirmationData?.patient.phone}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Alert severity="success" sx={{ mt: 3, maxWidth: 600, margin: '24px auto 0' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          📧 Confirmation emails have been sent to both you and the doctor
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          📱 You will also receive SMS notifications
        </Typography>
      </Alert>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={handleReset}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Book Another Appointment
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.location.href = '/client/dashboard'}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Go to Dashboard
        </Button>
      </Stack>
    </Box>
  );

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return renderDoctorSelection();
      case 1:
        return renderDateTime();
      case 2:
        return renderPatientDetails();
      case 3:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: embedded ? 'auto' : '100vh',
        bgcolor: embedded ? 'transparent' : '#F9FAFB',
        py: embedded ? 0 : 4,
      }}
    >
      <Container maxWidth="lg">
        {!embedded && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Book Your Appointment
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Schedule a visit with our healthcare professionals
            </Typography>
          </Box>
        )}

        {/* Stepper */}
        {!bookingComplete && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>{renderStep()}</Box>

        {/* Navigation Buttons */}
        {!bookingComplete && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                size="large"
                startIcon={<BackIcon />}
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Back
              </Button>

              {activeStep < 2 && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ForwardIcon />}
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Next
                </Button>
              )}

              {activeStep === 2 && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<CheckIcon />}
                  onClick={handleBookAppointment}
                  disabled={!validatePatientDetails() || loading}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
                </Button>
              )}
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default PatientBookingFlow;
