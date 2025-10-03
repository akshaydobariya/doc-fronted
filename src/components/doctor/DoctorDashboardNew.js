import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Event as EventIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../contexts/AuthContext';
import availabilityService from '../../services/availabilityService';
import calendarService from '../../services/calendarService';
import appointmentService from '../../services/appointmentService';
import AvailabilitySettings from './AvailabilitySettings';
import QuickSlotGenerator from './QuickSlotGenerator';
import AppointmentsList from './AppointmentsList';
import FirstTimeSlotSetup from './FirstTimeSlotSetup';

const DoctorDashboardNew = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [events, setEvents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Initialize or get availability
      try {
        const availData = await availabilityService.getAvailability();
        setAvailability(availData.availability);

        // Check if this looks like first login (no blocked slots, default rules)
        if (availData.availability.blockedSlots.length === 0) {
          setIsFirstTime(true);
          showSnackbar('Welcome! Your calendar has been synced and default availability rules are set. You can customize them in Settings.', 'info');
        }
      } catch (error) {
        // If not found, initialize with default settings
        try {
          const initData = await availabilityService.initialize();
          setAvailability(initData.availability);
          setIsFirstTime(true);
        } catch (initError) {
          console.error('Failed to initialize availability:', initError);
          // Continue anyway - user can set up later
        }
      }

      // Load appointments (with error handling)
      try {
        await loadAppointments();
      } catch (error) {
        console.error('Failed to load appointments:', error);
        // Continue anyway
      }

      // Load calendar events (with error handling)
      try {
        await loadEvents();
      } catch (error) {
        console.error('Failed to load events:', error);
        // Continue anyway
      }

      // Check if today's slots exist
      await checkTodaySlots();

      showSnackbar('Dashboard loaded', 'info');
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      // Don't show error snackbar to avoid triggering refresh
    } finally {
      setLoading(false);
    }
  };

  const checkTodaySlots = async () => {
    try {
      // Check if ANY slots exist (not just today - for first time only)
      const checkDate = new Date();
      checkDate.setMonth(checkDate.getMonth() - 1); // Check last month to now
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Check up to next month

      const { slots } = await calendarService.getAvailableSlots(
        user.id,
        checkDate.toISOString(),
        endDate.toISOString()
      );

      // If NO slots at all exist, show first-time setup dialog (ONLY ONCE)
      if (!slots || slots.length === 0) {
        // Check if user has ever completed setup before
        const hasCompletedSetup = localStorage.getItem(`doctor_${user.id}_setup_complete`);
        if (!hasCompletedSetup) {
          setShowSetupDialog(true);
        }
      }
    } catch (error) {
      console.error('Check slots error:', error);
    }
  };

  const loadEvents = async () => {
    try {
      // Load appointments to show only booked slots in calendar
      const { appointments: appts } = await appointmentService.getAppointments();

      // Filter and format only booked appointments for calendar display
      const formattedEvents = appts
        .filter(apt => apt.slot && apt.status !== 'cancelled')
        .map(apt => ({
          id: apt._id,
          title: `${apt.patientName} - ${apt.slot.type}`,
          start: new Date(apt.slot.startTime),
          end: new Date(apt.slot.endTime),
          backgroundColor: apt.status === 'confirmed' ? '#10B981' :
                          apt.status === 'completed' ? '#6B7280' :
                          apt.status === 'no-show' ? '#F59E0B' : '#6366F1',
          extendedProps: {
            appointment: apt,
            slot: apt.slot,
            patient: apt.patientName,
            status: apt.status
          }
        }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Load events error:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const { appointments: appts } = await appointmentService.getAppointments();
      setAppointments(appts);
    } catch (error) {
      console.error('Load appointments error:', error);
    }
  };

  const handleSyncCalendar = async () => {
    try {
      setSyncing(true);
      await calendarService.syncCalendar();
      await loadEvents();
      showSnackbar('Calendar synced successfully', 'success');
    } catch (error) {
      console.error('Sync error:', error);
      showSnackbar('Error syncing calendar', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCalendar = async () => {
    // Confirm before clearing
    const confirmed = window.confirm(
      'Are you sure you want to clear all calendar events, slots, and appointments? This action cannot be undone.\n\n' +
      'This will:\n' +
      '• Delete all events from Google Calendar\n' +
      '• Delete all slots from database\n' +
      '• Delete all appointments\n' +
      '• Clear all blocked slots'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const result = await calendarService.clearAllCalendarEvents();

      // Refresh data
      await loadEvents();
      await loadAppointments();

      showSnackbar(
        `Calendar cleared! ${result.summary.calendarEventsDeleted} Google Calendar events and ${result.summary.slotsDeleted} slots deleted.`,
        'success'
      );
    } catch (error) {
      console.error('Clear calendar error:', error);
      showSnackbar(
        error.response?.data?.message || 'Error clearing calendar. Make sure Google Calendar is connected.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAvailabilityUpdate = async () => {
    const availData = await availabilityService.getAvailability();
    setAvailability(availData.availability);
    showSnackbar('Availability updated successfully', 'success');
  };

  const handleSlotsGenerated = async () => {
    await loadEvents();
    showSnackbar('Slots generated successfully', 'success');
  };

  const handleSetupComplete = async (result) => {
    if (result.success) {
      // Mark setup as completed for this doctor (won't show again)
      localStorage.setItem(`doctor_${user.id}_setup_complete`, 'true');

      showSnackbar(result.message, 'success');
      await loadEvents();
      await loadAppointments();
    } else {
      showSnackbar(result.message, 'error');
    }
  };

  const handleDateSelect = (selectInfo) => {
    // Future: Handle manual slot creation
    console.log('Date selected:', selectInfo);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              mr: 2,
            }}
          >
            <CalendarIcon sx={{ color: 'white' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'white' }}>
              Dr. {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Dashboard
            </Typography>
          </Box>
          <Button
            color="inherit"
            onClick={handleSyncCalendar}
            disabled={syncing}
            startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <CalendarIcon />}
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            {syncing ? 'Syncing...' : 'Sync'}
          </Button>
          <Button
            color="inherit"
            onClick={handleClearCalendar}
            disabled={loading}
            startIcon={<DeleteForeverIcon />}
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              borderRadius: 2,
              background: 'rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(10px)',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.35)',
              },
            }}
          >
            Clear Calendar
          </Button>
          <IconButton
            color="inherit"
            onClick={logout}
            sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Container maxWidth="xl">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'text.secondary',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              },
            }}
          >
            <Tab label="Calendar" icon={<CalendarIcon />} iconPosition="start" />
            <Tab label="Generate Slots" icon={<AddIcon />} iconPosition="start" />
            <Tab label="Appointments" icon={<EventIcon />} iconPosition="start" />
            <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Banner for First Time Users */}
        {isFirstTime && (
          <Alert
            severity="info"
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
              border: '2px solid',
              borderColor: 'info.light',
              '& .MuiAlert-icon': {
                fontSize: 28,
              },
            }}
            onClose={() => setIsFirstTime(false)}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Welcome to Your Dashboard! 🎉
            </Typography>
            <Typography variant="body2" paragraph sx={{ mb: 2 }}>
              Your Google Calendar has been synced and default availability settings have been created.
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Next steps:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 3 }}>
              <li><Typography variant="body2" sx={{ mb: 0.5 }}>Go to <strong>Settings</strong> tab to customize your working hours and appointment types</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 0.5 }}>Use <strong>Generate Slots</strong> tab to create available appointment slots</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 0.5 }}>View all bookings in the <strong>Appointments</strong> tab</Typography></li>
              <li><Typography variant="body2">Your calendar stays in sync automatically via webhook</Typography></li>
            </Box>
          </Alert>
        )}

        {/* Tab 0: Calendar View */}
        {tabValue === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  mr: 2,
                }}
              >
                <CalendarIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Calendar View
              </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                select={handleDateSelect}
                height="auto"
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
              />
            </Box>
          </Paper>
        )}

        {/* Tab 1: Slot Generator */}
        {tabValue === 1 && availability && (
          <QuickSlotGenerator
            availability={availability}
            onSlotsGenerated={handleSlotsGenerated}
            showSnackbar={showSnackbar}
          />
        )}

        {/* Tab 2: Appointments */}
        {tabValue === 2 && (
          <AppointmentsList
            appointments={appointments}
            onUpdate={loadAppointments}
            showSnackbar={showSnackbar}
          />
        )}

        {/* Tab 3: Settings */}
        {tabValue === 3 && availability && (
          <AvailabilitySettings
            availability={availability}
            onUpdate={handleAvailabilityUpdate}
            showSnackbar={showSnackbar}
          />
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* First Time Slot Setup Dialog */}
      {availability && (
        <FirstTimeSlotSetup
          open={showSetupDialog}
          onClose={() => setShowSetupDialog(false)}
          availability={availability}
          onComplete={handleSetupComplete}
        />
      )}
    </Box>
  );
};

export default DoctorDashboardNew;