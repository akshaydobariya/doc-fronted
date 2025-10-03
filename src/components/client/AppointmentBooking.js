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
  InputAdornment,
  Avatar,
  Chip,
  Stack,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  Description as NotesIcon,
  CheckCircle as CheckIcon,
  LocalHospital as HospitalIcon,
  Event as EventIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import availabilityService from '../../services/availabilityService';
import calendarService from '../../services/calendarService';

// Custom Stepper Connector with medical theme
const MedicalConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: 'linear-gradient(90deg, #4A90E2 0%, #50C878 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: '#50C878',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
  },
}));

// Custom Step Icon
const MedicalStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed ? '#50C878' : ownerState.active ? '#4A90E2' : '#E0E0E0',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: ownerState.active || ownerState.completed ? '0 4px 10px 0 rgba(74,144,226,0.35)' : 'none',
  transition: 'all 0.3s ease',
}));

function MedicalStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <HospitalIcon />,
    2: <CalendarIcon />,
    3: <PersonIcon />,
    4: <CheckIcon />,
  };

  return (
    <MedicalStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </MedicalStepIconRoot>
  );
}

const steps = ['Choose Doctor', 'Select Date & Time', 'Your Information', 'Confirmation'];

const AppointmentBooking = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    reason: '',
    notes: '',
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
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
      const response = await availabilityService.getAvailability(doctorId);
      setAppointmentTypes(response.availability?.appointmentTypes || []);
    } catch (error) {
      console.error('Error loading availability:', error);
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

      const typeName = appointmentTypes.find(t => t._id === typeId)?.name;
      const filtered = response.slots?.filter(
        slot => slot.isAvailable && slot.type === typeName
      ) || [];

      setAvailableSlots(filtered);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    await loadAvailability(doctor._id);
    handleNext();
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

      const bookingData = {
        slotId: selectedSlot._id,
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        reason: patientInfo.reason,
        notes: patientInfo.notes,
      };

      const response = await calendarService.bookSlot(bookingData);

      setConfirmationData({
        appointmentId: response.appointment._id,
        doctor: selectedDoctor,
        date: selectedSlot.startTime,
        time: `${new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: selectedSlot.type,
        patient: patientInfo,
      });

      setBookingConfirmed(true);
      handleNext();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
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

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Step 1: Doctor Selection
  const renderDoctorSelection = () => (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
        Find Your Doctor
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose from our qualified healthcare professionals
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by doctor name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#4A90E2' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#F8F9FA',
            '&:hover': {
              backgroundColor: '#FFF',
            },
          },
        }}
      />

      <Grid container spacing={3}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} sm={6} md={4} key={doctor._id}>
            <Card
              onClick={() => handleDoctorSelect(doctor)}
              sx={{
                cursor: 'pointer',
                border: selectedDoctor?._id === doctor._id ? '3px solid #4A90E2' : '1px solid #E0E0E0',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(74,144,226,0.15)',
                },
                backgroundColor: selectedDoctor?._id === doctor._id ? '#F0F7FF' : '#FFF',
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 90,
                      height: 90,
                      bgcolor: '#4A90E2',
                      fontSize: '2rem',
                      fontWeight: 700,
                      border: '4px solid #FFF',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    {doctor.name?.charAt(0)}
                  </Avatar>
                  {doctor.hasCalendarIntegration && (
                    <VerifiedIcon
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        color: '#50C878',
                        bgcolor: '#FFF',
                        borderRadius: '50%',
                        fontSize: 28,
                      }}
                    />
                  )}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50', mb: 0.5 }}>
                  Dr. {doctor.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {doctor.specialty || 'General Physician'}
                </Typography>

                <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 1 }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: '#FFB800' }} />
                  ))}
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  150+ patients treated
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Step 2: Date & Time Selection
  const renderDateTimeSelection = () => (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
        Select Date & Time
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Book your appointment with Dr. {selectedDoctor?.name}
      </Typography>

      {/* Appointment Type */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
          <EventIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#4A90E2' }} />
          Appointment Type
        </Typography>
        <Grid container spacing={2}>
          {appointmentTypes.map((type) => (
            <Grid item xs={12} sm={6} key={type._id}>
              <Card
                onClick={() => handleTypeSelect(type)}
                sx={{
                  cursor: 'pointer',
                  border: selectedType === type._id ? '2px solid #4A90E2' : '1px solid #E0E0E0',
                  borderRadius: '12px',
                  backgroundColor: selectedType === type._id ? '#F0F7FF' : '#FFF',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#4A90E2',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                    {type.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {type.duration} minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Date Selection */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
          <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#4A90E2' }} />
          Choose Date
        </Typography>
        <TextField
          type="date"
          fullWidth
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          InputProps={{
            inputProps: {
              min: new Date().toISOString().split('T')[0],
              max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: '1rem',
            },
          }}
        />
      </Paper>

      {/* Time Slots */}
      {selectedDate && selectedType && (
        <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E0E0E0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
            <ClockIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#4A90E2' }} />
            Available Time Slots
          </Typography>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
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
                      py: 1.5,
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      borderWidth: 2,
                      backgroundColor: selectedSlot?._id === slot._id ? '#4A90E2' : '#FFF',
                      borderColor: selectedSlot?._id === slot._id ? '#4A90E2' : '#E0E0E0',
                      color: selectedSlot?._id === slot._id ? '#FFF' : '#2C3E50',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#4A90E2',
                        backgroundColor: selectedSlot?._id === slot._id ? '#3A7BC8' : '#F0F7FF',
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
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              No slots available for this date. Please select another date.
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );

  // Step 3: Patient Information
  const renderPatientInfo = () => (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
        Your Information
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please provide your details for the appointment
      </Typography>

      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #E0E0E0' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#4A90E2' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={patientInfo.email}
              onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#4A90E2' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={patientInfo.phone}
              onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#4A90E2' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          <Grid item xs={12}>
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
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                    <NotesIcon sx={{ color: '#4A90E2' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              value={patientInfo.notes}
              onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Summary */}
        <Box sx={{ bgcolor: '#F8F9FA', p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50', mb: 2 }}>
            Appointment Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Doctor:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Dr. {selectedDoctor?.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Type:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedSlot?.type}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Date:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Time:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(selectedSlot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );

  // Step 4: Confirmation
  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: '#50C878',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(80,200,120,0.3)',
        }}
      >
        <CheckIcon sx={{ fontSize: 50, color: '#FFF' }} />
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 700, color: '#50C878', mb: 1 }}>
        Appointment Confirmed!
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Your booking has been successfully completed
      </Typography>

      <Paper
        sx={{
          p: 4,
          maxWidth: 600,
          margin: '0 auto',
          borderRadius: '16px',
          border: '2px solid #50C878',
          backgroundColor: '#F0FFF4',
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
          Booking ID
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2C3E50' }}>
          #{confirmationData?.appointmentId?.substring(0, 8).toUpperCase()}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} sx={{ textAlign: 'left' }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Doctor</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Dr. {confirmationData?.doctor.name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {new Date(confirmationData?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Time</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{confirmationData?.time}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="success" sx={{ mt: 3, maxWidth: 600, margin: '24px auto 0', borderRadius: '12px' }}>
        <Typography variant="body2">
          📧 Confirmation email sent to {confirmationData?.patient.email}
        </Typography>
        <Typography variant="body2">
          📱 SMS notification sent to {confirmationData?.patient.phone}
        </Typography>
      </Alert>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => window.location.reload()}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            borderColor: '#4A90E2',
            color: '#4A90E2',
          }}
        >
          Book Another
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.location.href = '/client/dashboard'}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: '#4A90E2',
            '&:hover': { bgcolor: '#3A7BC8' },
          }}
        >
          View My Appointments
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <HospitalIcon sx={{ fontSize: 60, color: '#4A90E2', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#2C3E50', mb: 1 }}>
            Book Your Appointment
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Quick and easy scheduling with healthcare professionals
          </Typography>
        </Box>

        {/* Stepper */}
        {!bookingConfirmed && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              connector={<MedicalConnector />}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={MedicalStepIcon}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {activeStep === 0 && renderDoctorSelection()}
          {activeStep === 1 && renderDateTimeSelection()}
          {activeStep === 2 && renderPatientInfo()}
          {activeStep === 3 && renderConfirmation()}
        </Box>

        {/* Navigation */}
        {!bookingConfirmed && (
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#4A90E2',
                }}
              >
                Back
              </Button>

              <Button
                variant="contained"
                size="large"
                endIcon={activeStep === 2 ? <CheckIcon /> : <ArrowForwardIcon />}
                onClick={handleNext}
                disabled={!canProceed() || loading}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: activeStep === 2 ? '#50C878' : '#4A90E2',
                  '&:hover': {
                    bgcolor: activeStep === 2 ? '#40B868' : '#3A7BC8',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeStep === 2 ? (
                  'Confirm Booking'
                ) : (
                  'Next'
                )}
              </Button>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AppointmentBooking;
