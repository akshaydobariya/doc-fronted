import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  Divider,
  Stack,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  AccessTime as TimeIcon,
  DeleteForever as DeleteForeverIcon,
  AutoAwesome as SparkleIcon,
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
import ModernCalendarView from './ModernCalendarView';

const DoctorDashboardModern = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [events, setEvents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    pending: 0,
  });

  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user]);

  // Reload events when availability changes (to update blocked slots)
  useEffect(() => {
    if (availability && events.length > 0) {
      loadEvents(availability);
    }
  }, [availability?.blockedSlots]);

  // Check URL parameters for slot generation requirement or initial check after login
  useEffect(() => {
    console.log('🔍 [URL CHECK] Checking URL parameters:', location.search);
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    const needSlots = params.get('needSlots');
    const checkSlots = params.get('checkSlots');

    console.log('🔍 [URL CHECK] Parameters:', { view, needSlots, checkSlots });

    if (view === 'generate' && needSlots === 'true') {
      // Switch to generate view and show message
      console.log('✅ [URL CHECK] Direct redirect to generate view');
      setActiveView('generate');
      showSnackbar('Please generate appointment slots for today', 'warning');
      // Clean up URL
      navigate('/doctor/dashboard', { replace: true });
    } else if (checkSlots === 'true') {
      // This comes from login - check slots after dashboard loads
      console.log('✅ [URL CHECK] checkSlots=true detected - will run slot check after init');
      // Clean up URL immediately
      navigate('/doctor/dashboard', { replace: true });
      // The actual check will run in initializeDashboard
    } else {
      console.log('ℹ️ [URL CHECK] No special parameters - normal dashboard load');
    }
  }, [location.search, navigate]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      // Load availability first, then load events and appointments
      const availData = await loadAvailability();
      await Promise.all([
        loadAppointments(),
        loadEvents(availData),
      ]);

      // Check if doctor has today's slots (every time they load the dashboard)
      await checkTodaySlots();
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodaySlots = async () => {
    console.log('🔍 [SLOT CHECK] Starting today slots check...');

    try {
      console.log('🔍 [SLOT CHECK] Making API call to /api/calendar/check-today-slots');
      const response = await calendarService.checkTodaySlots();
      console.log('🔍 [SLOT CHECK] API Response:', response);

      if (!response.hasTodaySlots) {
        // Switch to generate view if no slots for today
        console.log('⚠️ [SLOT CHECK] NO SLOTS FOUND - Switching to generate view');
        console.log('⚠️ [SLOT CHECK] Setting activeView to: generate');
        setActiveView('generate');
        showSnackbar(`No slots found for today (${response.todayDate}). Please generate slots.`, 'warning');
        console.log('✅ [SLOT CHECK] Redirect complete');
      } else {
        console.log(`✅ [SLOT CHECK] Found ${response.slotsCount} slots for today - staying on current view`);
      }
    } catch (error) {
      console.error('❌ [SLOT CHECK] ERROR checking slots:', error);
      console.error('❌ [SLOT CHECK] Error status:', error.response?.status);
      console.error('❌ [SLOT CHECK] Error response:', error.response?.data);

      // If there's an error, redirect to generate tab to be safe
      console.log('⚠️ [SLOT CHECK] Error occurred - switching to generate view as precaution');
      setActiveView('generate');
      showSnackbar('Unable to verify today\'s slots. Please check and generate if needed.', 'warning');
      console.log('✅ [SLOT CHECK] Error redirect complete');
    }
  };

  const loadAvailability = async () => {
    try {
      const availData = await availabilityService.getAvailability();
      setAvailability(availData.availability);
      return availData.availability;
    } catch (error) {
      const initData = await availabilityService.initialize();
      setAvailability(initData.availability);
      return initData.availability;
    }
  };

  const loadEvents = async (availabilityData = null) => {
    try {
      const { appointments: appts } = await appointmentService.getAppointments();
      const formattedEvents = appts
        .filter(apt => apt.slot && apt.status !== 'cancelled')
        .map(apt => ({
          id: apt._id,
          title: `${apt.patientName} - ${apt.slot.type}`,
          start: new Date(apt.slot.startTime),
          end: new Date(apt.slot.endTime),
          backgroundColor: getStatusColor(apt.status),
          borderColor: getStatusColor(apt.status),
          extendedProps: { appointment: apt },
        }));

      // Add blocked slots to calendar
      const currentAvailability = availabilityData || availability;
      const blockedEvents = (currentAvailability?.blockedSlots || []).map((slot, index) => ({
        id: `blocked-${slot._id || index}`,
        title: `🚫 ${slot.reason || 'Blocked'}`,
        start: new Date(slot.startTime),
        end: new Date(slot.endTime),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        display: 'background',
        extendedProps: {
          blocked: true,
          reason: slot.reason
        },
      }));

      setEvents([...formattedEvents, ...blockedEvents]);
    } catch (error) {
      console.error('Load events error:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const { appointments: appts } = await appointmentService.getAppointments();
      setAppointments(appts);
      calculateStats(appts);
    } catch (error) {
      console.error('Load appointments error:', error);
    }
  };

  const calculateStats = (appts) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    setStats({
      today: appts.filter(a => new Date(a.slot?.startTime) >= today && new Date(a.slot?.startTime) < new Date(today.getTime() + 86400000)).length,
      thisWeek: appts.filter(a => new Date(a.slot?.startTime) >= weekStart).length,
      thisMonth: appts.filter(a => new Date(a.slot?.startTime) >= monthStart).length,
      pending: appts.filter(a => a.status === 'scheduled').length,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#10B981',
      completed: '#6B7280',
      'no-show': '#F59E0B',
      scheduled: '#6366F1',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6366F1';
  };

  const handleSyncCalendar = async () => {
    try {
      setSyncing(true);
      await calendarService.syncCalendar();
      await loadEvents();
      showSnackbar('Calendar synced successfully', 'success');
    } catch (error) {
      showSnackbar('Error syncing calendar', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCalendar = async () => {
    const confirmed = window.confirm('Clear all calendar data? This cannot be undone.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await calendarService.clearAllCalendarEvents();
      await loadEvents();
      await loadAppointments();
      showSnackbar('Calendar cleared successfully', 'success');
    } catch (error) {
      showSnackbar('Error clearing calendar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const StatCard = ({ icon, title, value, color, trend }) => (
    <Card
        sx={{
          position: 'relative',
          overflow: 'visible',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${color}25`,
            border: `1px solid ${color}50`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                boxShadow: `0 8px 16px ${color}40`,
              }}
            >
              {icon}
            </Box>
            {trend && (
              <Chip
                label={trend}
                size="small"
                sx={{
                  background: `${color}20`,
                  color: color,
                  fontWeight: 700,
                  border: 'none',
                }}
              />
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: color }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
  );

  const NavigationDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '0 24px 24px 0',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Menu</Typography>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ px: 2, py: 2 }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
          { id: 'calendar', label: 'Calendar', icon: <CalendarIcon /> },
          { id: 'generate', label: 'Generate Slots', icon: <AddIcon /> },
          { id: 'appointments', label: 'Appointments', icon: <EventIcon /> },
          { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
        ].map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              setDrawerOpen(false);
            }}
            selected={activeView === item.id}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                background: 'rgba(255,255,255,0.2)',
                '&:hover': { background: 'rgba(255,255,255,0.3)' },
              },
              '&:hover': { background: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Loading Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      {/* Modern Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2.5,
          px: 3,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white', display: { md: 'none' } }}>
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={user?.picture}
                  sx={{
                    width: 48,
                    height: 48,
                    border: '3px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Dr. {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Medical Professional
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={handleSyncCalendar}
                disabled={syncing}
                startIcon={syncing ? <CircularProgress size={16} /> : <RefreshIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontWeight: 600,
                  px: 2.5,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {syncing ? 'Syncing' : 'Sync'}
              </Button>
              <IconButton
                onClick={logout}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.15)',
                  '&:hover': { background: 'rgba(255,255,255,0.25)' },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Navigation Pills - Desktop */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" spacing={1} sx={{ py: 2 }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
              { id: 'calendar', label: 'Calendar', icon: <CalendarIcon sx={{ fontSize: 20 }} /> },
              { id: 'generate', label: 'Generate Slots', icon: <AddIcon sx={{ fontSize: 20 }} /> },
              { id: 'appointments', label: 'Appointments', icon: <EventIcon sx={{ fontSize: 20 }} /> },
              { id: 'settings', label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
            ].map((item) => (
              <Button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                startIcon={item.icon}
                variant={activeView === item.id ? 'contained' : 'text'}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  ...(activeView === item.id
                    ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      }
                    : {
                        color: 'text.secondary',
                        '&:hover': { background: '#F3F4F6' },
                      }),
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
            <Box>
              {/* Stats Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={<TimeIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="Today's Appointments"
                    value={stats.today}
                    color="#6366F1"
                    
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={<CalendarIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="This Week"
                    value={stats.thisWeek}
                    color="#10B981"
                  
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={<TrendingUpIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="This Month"
                    value={stats.thisMonth}
                    color="#F59E0B"
                 
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={<PeopleIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="Pending"
                    value={stats.pending}
                    color="#8B5CF6"
                  />
                </Grid>
              </Grid>

              {/* Quick Actions */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  mb: 4,
                  background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
                  border: '1px solid #667eea30',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SparkleIcon sx={{ color: '#667eea' }} /> Quick Actions
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setActiveView('generate')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    Generate Slots
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => setActiveView('appointments')}
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    View Appointments
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteForeverIcon />}
                    onClick={handleClearCalendar}
                    sx={{
                      borderColor: '#EF4444',
                      color: '#EF4444',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Clear Calendar
                  </Button>
                </Stack>
              </Paper>

              {/* Recent Appointments */}
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Recent Appointments
                </Typography>
                <Stack spacing={2}>
                  {appointments.slice(0, 5).map((apt) => (
                    <Box
                      key={apt._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        transition: 'all 0.2s',
                        '&:hover': { background: '#F3F4F6', transform: 'translateX(4px)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getStatusColor(apt.status) }}>
                          {apt.patientName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {apt.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {apt.slot?.type} • {new Date(apt.slot?.startTime).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={apt.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(apt.status)}20`,
                          color: getStatusColor(apt.status),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <ModernCalendarView
            events={events}
            onEventClick={(info) => console.log('Event clicked:', info)}
            onDateSelect={(info) => console.log('Date selected:', info)}
          />
        )}

        {/* Generate Slots View */}
        {activeView === 'generate' && availability && (
            <QuickSlotGenerator
              availability={availability}
              onSlotsGenerated={async () => {
                await loadEvents();
                showSnackbar('Slots generated successfully', 'success');
              }}
              showSnackbar={showSnackbar}
            />
        )}

        {/* Appointments View */}
        {activeView === 'appointments' && (
            <AppointmentsList appointments={appointments} />
        )}

        {/* Settings View */}
        {activeView === 'settings' && availability && (
            <AvailabilitySettings
              availability={availability}
              onUpdate={async () => {
                const updatedAvailability = await loadAvailability();
                await loadEvents(updatedAvailability);
              }}
              showSnackbar={showSnackbar}
            />
        )}
      </Container>

      {/* Navigation Drawer */}
      <NavigationDrawer />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorDashboardModern;
