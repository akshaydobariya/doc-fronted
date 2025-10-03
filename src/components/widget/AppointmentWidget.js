import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Stack,
  Paper,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const steps = ['Doctor', 'Date & Time', 'Details', 'Confirm'];

/**
 * Embeddable Appointment Booking Widget
 *
 * Props:
 * - apiUrl: Backend API base URL (required)
 * - theme: 'light' | 'dark' (default: 'light')
 * - primaryColor: Custom primary color (default: '#0EA5E9')
 * - compact: Boolean to show compact version (default: false)
 * - onBookingComplete: Callback function when booking is complete
 * - defaultDoctorId: Pre-select a doctor
 */
const AppointmentWidget = ({
  apiUrl = 'http://localhost:5000/api',
  theme = 'light',
  primaryColor = '#0EA5E9',
  compact = false,
  onBookingComplete,
  defaultDoctorId = null,
  showHeader = true,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    notes: '',
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (defaultDoctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d._id === defaultDoctorId);
      if (doctor) {
        handleDoctorSelect(doctor);
      }
    }
  }, [defaultDoctorId, doctors]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/availability/doctors`);
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (doctorId) => {
    try {
      const response = await fetch(`${apiUrl}/availability/${doctorId}`);
      const data = await response.json();
      setAppointmentTypes(data.availability?.appointmentTypes || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const loadSlots = async (doctorId, date, typeId) => {
    try {
      setLoading(true);
      const startDate = new Date(date + 'T00:00:00.000Z');
      const endDate = new Date(date + 'T23:59:59.999Z');

      const response = await fetch(
        `${apiUrl}/calendar/slots?doctorId=${doctorId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();

      const typeName = appointmentTypes.find(t => t._id === typeId)?.name;
      const filtered = data.slots?.filter(
        slot => slot.isAvailable && slot.type === typeName
      ) || [];

      setAvailableSlots(filtered);
    } catch (error) {
      console.error('Error loading slots:', error);
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    await loadAvailability(doctor._id);
    if (!compact) {
      setActiveStep(1);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type._id);
    if (selectedDate && selectedDoctor) {
      loadSlots(selectedDoctor._id, selectedDate, type._id);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedDoctor && selectedType) {
      loadSlots(selectedDoctor._id, date, selectedType);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${apiUrl}/calendar/book-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot._id,
          patientName: patientInfo.name,
          patientEmail: patientInfo.email,
          patientPhone: patientInfo.phone,
          reasonForVisit: patientInfo.reason,
          notes: patientInfo.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const data = await response.json();

      setConfirmationData({
        appointmentId: data.appointment._id,
        doctor: selectedDoctor,
        date: selectedSlot.startTime,
        time: `${new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: selectedSlot.type,
        patient: patientInfo,
      });

      setBookingConfirmed(true);
      setActiveStep(3);

      if (onBookingComplete) {
        onBookingComplete(data.appointment);
      }
    } catch (error) {
      setError(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 2) {
      handleBookAppointment();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedDoctor !== null;
      case 1:
        return selectedSlot !== null;
      case 2:
        return patientInfo.name && patientInfo.email && patientInfo.phone && patientInfo.reason;
      default:
        return false;
    }
  };

  const renderDoctorSelection = () => (
    <Box>
      {showHeader && (
        <>
          <Typography variant={compact ? "h6" : "h5"} sx={{ fontWeight: 700, color: textColor, mb: 1 }}>
            Select a Doctor
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#9CA3AF' : '#6B7280', mb: 3 }}>
            Choose your preferred healthcare provider
          </Typography>
        </>
      )}

      <Grid container spacing={2}>
        {doctors.map((doctor) => (
          <Grid item xs={12} sm={compact ? 12 : 6} key={doctor._id}>
            <Card
              onClick={() => handleDoctorSelect(doctor)}
              sx={{
                cursor: 'pointer',
                border: `2px solid ${selectedDoctor?._id === doctor._id ? primaryColor : borderColor}`,
                borderRadius: '12px',
                bgcolor: selectedDoctor?._id === doctor._id ? `${primaryColor}10` : bgColor,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: primaryColor,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 16px ${primaryColor}40`,
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: compact ? 48 : 56,
                      height: compact ? 48 : 56,
                      bgcolor: primaryColor,
                      fontSize: compact ? '1.25rem' : '1.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {doctor.name?.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant={compact ? "body1" : "h6"} sx={{ fontWeight: 700, color: textColor }}>
                      Dr. {doctor.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      {doctor.specialty || 'General Physician'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDateTimeSelection = () => (
    <Box>
      {showHeader && (
        <>
          <Typography variant={compact ? "h6" : "h5"} sx={{ fontWeight: 700, color: textColor, mb: 1 }}>
            Choose Date & Time
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#9CA3AF' : '#6B7280', mb: 3 }}>
            Book with Dr. {selectedDoctor?.name}
          </Typography>
        </>
      )}

      <Stack spacing={3}>
        {/* Appointment Type */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textColor, mb: 1.5 }}>
            Appointment Type
          </Typography>
          <Grid container spacing={1.5}>
            {appointmentTypes.map((type) => (
              <Grid item xs={6} key={type._id}>
                <Button
                  fullWidth
                  variant={selectedType === type._id ? 'contained' : 'outlined'}
                  onClick={() => handleTypeSelect(type)}
                  sx={{
                    py: 1.5,
                    borderRadius: '10px',
                    borderWidth: 2,
                    borderColor: selectedType === type._id ? primaryColor : borderColor,
                    bgcolor: selectedType === type._id ? primaryColor : 'transparent',
                    color: selectedType === type._id ? '#FFF' : textColor,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: primaryColor,
                    },
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {type.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {type.duration} min
                    </Typography>
                  </Stack>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Date */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textColor, mb: 1.5 }}>
            Select Date
          </Typography>
          <TextField
            type="date"
            fullWidth
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            inputProps={{
              min: new Date().toISOString().split('T')[0],
              max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: isDark ? '#374151' : '#F9FAFB',
                '& fieldset': {
                  borderColor: borderColor,
                },
              },
            }}
          />
        </Box>

        {/* Time Slots */}
        {selectedDate && selectedType && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textColor, mb: 1.5 }}>
              Available Times
            </Typography>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={32} sx={{ color: primaryColor }} />
              </Box>
            ) : availableSlots.length > 0 ? (
              <Grid container spacing={1.5}>
                {availableSlots.map((slot) => (
                  <Grid item xs={4} sm={3} key={slot._id}>
                    <Button
                      fullWidth
                      variant={selectedSlot?._id === slot._id ? 'contained' : 'outlined'}
                      onClick={() => handleSlotSelect(slot)}
                      sx={{
                        py: 1.5,
                        borderRadius: '8px',
                        borderWidth: 2,
                        borderColor: selectedSlot?._id === slot._id ? primaryColor : borderColor,
                        bgcolor: selectedSlot?._id === slot._id ? primaryColor : 'transparent',
                        color: selectedSlot?._id === slot._id ? '#FFF' : textColor,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: primaryColor,
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
              <Alert severity="info" sx={{ borderRadius: '10px' }}>
                No slots available
              </Alert>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );

  const renderPatientInfo = () => (
    <Box>
      {showHeader && (
        <>
          <Typography variant={compact ? "h6" : "h5"} sx={{ fontWeight: 700, color: textColor, mb: 1 }}>
            Your Information
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#9CA3AF' : '#6B7280', mb: 3 }}>
            Please provide your contact details
          </Typography>
        </>
      )}

      <Stack spacing={2.5}>
        <TextField
          fullWidth
          label="Full Name"
          value={patientInfo.name}
          onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: primaryColor, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: isDark ? '#374151' : '#F9FAFB',
            },
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
                <EmailIcon sx={{ color: primaryColor, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: isDark ? '#374151' : '#F9FAFB',
            },
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
                <PhoneIcon sx={{ color: primaryColor, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: isDark ? '#374151' : '#F9FAFB',
            },
          }}
        />

        <TextField
          fullWidth
          label="Reason for Visit"
          value={patientInfo.reason}
          onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
          required
          multiline
          rows={2}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                <DescriptionIcon sx={{ color: primaryColor, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: isDark ? '#374151' : '#F9FAFB',
            },
          }}
        />
      </Stack>
    </Box>
  );

  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: '#10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
        }}
      >
        <CheckIcon sx={{ fontSize: 40, color: '#FFF' }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981', mb: 1 }}>
        Booking Confirmed!
      </Typography>
      <Typography variant="body2" sx={{ color: isDark ? '#9CA3AF' : '#6B7280', mb: 3 }}>
        Your appointment has been scheduled
      </Typography>

      <Paper
        sx={{
          p: 3,
          borderRadius: '12px',
          border: `2px solid #10B981`,
          bgcolor: isDark ? '#065F4620' : '#ECFDF5',
          textAlign: 'left',
        }}
      >
        <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280', display: 'block', mb: 1 }}>
          Booking ID
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: textColor }}>
          #{confirmationData?.appointmentId?.substring(0, 8).toUpperCase()}
        </Typography>

        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Doctor
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: textColor }}>
              Dr. {confirmationData?.doctor.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Date & Time
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: textColor }}>
              {new Date(confirmationData?.date).toLocaleDateString()} - {confirmationData?.time}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Button
        variant="outlined"
        onClick={() => window.location.reload()}
        sx={{
          mt: 3,
          borderRadius: '10px',
          px: 4,
          py: 1,
          borderColor: primaryColor,
          color: primaryColor,
          fontWeight: 600,
        }}
      >
        Book Another
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: compact ? 'auto' : '100vh',
        bgcolor: isDark ? '#111827' : '#F9FAFB',
        py: compact ? 2 : 4,
      }}
    >
      <Container maxWidth={compact ? "sm" : "md"}>
        {/* Stepper */}
        {!compact && !bookingConfirmed && (
          <Paper
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: '12px',
              bgcolor: bgColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: compact ? '0.75rem' : '0.875rem',
                        color: textColor,
                      },
                      '& .MuiStepIcon-root': {
                        color: borderColor,
                        '&.Mui-active': {
                          color: primaryColor,
                        },
                        '&.Mui-completed': {
                          color: '#10B981',
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {error}
          </Alert>
        )}

        {/* Content */}
        <Paper
          sx={{
            p: compact ? 2.5 : 3,
            borderRadius: '16px',
            bgcolor: bgColor,
            border: `1px solid ${borderColor}`,
            mb: 3,
          }}
        >
          {activeStep === 0 && renderDoctorSelection()}
          {activeStep === 1 && renderDateTimeSelection()}
          {activeStep === 2 && renderPatientInfo()}
          {activeStep === 3 && renderConfirmation()}
        </Paper>

        {/* Navigation */}
        {!bookingConfirmed && (
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              sx={{
                borderRadius: '10px',
                px: 3,
                color: textColor,
                fontWeight: 600,
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              endIcon={activeStep === 2 ? <CheckIcon /> : <ArrowForwardIcon />}
              onClick={handleNext}
              disabled={!canProceed() || loading}
              sx={{
                borderRadius: '10px',
                px: 4,
                bgcolor: primaryColor,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: primaryColor,
                  opacity: 0.9,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : activeStep === 2 ? (
                'Confirm'
              ) : (
                'Next'
              )}
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default AppointmentWidget;
