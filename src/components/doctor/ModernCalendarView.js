import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  CalendarMonth as MonthIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notes as NotesIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './ModernCalendarView.css';

const ModernCalendarView = ({ events, onEventClick, onDateSelect }) => {
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [statusFilter, setStatusFilter] = useState('all');
  const calendarRef = React.useRef(null);

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps.appointment);
    setOpenEventDialog(true);
    if (onEventClick) onEventClick(info);
  };

  const handleDateClick = (info) => {
    if (onDateSelect) onDateSelect(info);
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handleNavigate = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    if (direction === 'prev') calendarApi.prev();
    else if (direction === 'next') calendarApi.next();
    else calendarApi.today();

    setCurrentDate(calendarApi.getDate());
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setFilterAnchor(null);

    if (status === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((e) => e.extendedProps?.appointment?.status === status)
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#6366F1',
      confirmed: '#10B981',
      completed: '#6B7280',
      'no-show': '#F59E0B',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6366F1';
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const EventDetailsDialog = () => {
    if (!selectedEvent) return null;

    return (
      <Dialog
        open={openEventDialog}
        onClose={() => setOpenEventDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${getStatusColor(selectedEvent.status)} 0%, ${getStatusColor(selectedEvent.status)}DD 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'rgba(255,255,255,0.25)',
                fontSize: '1.5rem',
                fontWeight: 700,
                border: '3px solid rgba(255,255,255,0.4)',
              }}
            >
              {selectedEvent.patientName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selectedEvent.patientName}
              </Typography>
              <Chip
                label={selectedEvent.status?.toUpperCase()}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
          </Box>
          <IconButton onClick={() => setOpenEventDialog(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Stack spacing={3}>
            {/* Appointment Type */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
                border: '1px solid #667eea30',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EventIcon sx={{ color: '#667eea' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Appointment Type
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {selectedEvent.slot?.type}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                }}
              >
                <TimeIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Scheduled Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDateTime(selectedEvent.slot?.startTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Duration: {selectedEvent.slot?.duration} minutes
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Patient Contact Info */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
                Patient Information
              </Typography>
              <Stack spacing={2}>
                {selectedEvent.patientEmail && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: '#6B7280' }} />
                    <Typography variant="body2">{selectedEvent.patientEmail}</Typography>
                  </Box>
                )}
                {selectedEvent.patientPhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon sx={{ color: '#6B7280' }} />
                    <Typography variant="body2">{selectedEvent.patientPhone}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Reason & Notes */}
            {(selectedEvent.reasonForVisit || selectedEvent.notes) && (
              <>
                <Divider />
                <Box>
                  {selectedEvent.reasonForVisit && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                        Reason for Visit
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                        }}
                      >
                        {selectedEvent.reasonForVisit}
                      </Typography>
                    </Box>
                  )}
                  {selectedEvent.notes && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                        Notes
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                        }}
                      >
                        {selectedEvent.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenEventDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    
      <Box>
        {/* Modern Calendar Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            {/* Navigation Controls */}
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={() => handleNavigate('prev')}
                    sx={{
                      color: 'white',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                      '&:hover': { background: 'rgba(255,255,255,0.25)' },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleNavigate('next')}
                    sx={{
                      color: 'white',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                      '&:hover': { background: 'rgba(255,255,255,0.25)' },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                <Button
                  onClick={() => handleNavigate('today')}
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.15)',
                    '&:hover': { background: 'rgba(255,255,255,0.25)' },
                    textTransform: 'lowercase',
                    fontSize: '0.95rem',
                    minHeight: 40,
                  }}
                >
                  today
                </Button>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}, {currentDate.getFullYear()}
                </Typography>
              </Stack>
            </Grid>

            {/* View Controls */}
            <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              >
                <Tooltip title="Month View">
                  <IconButton
                    onClick={() => handleViewChange('dayGridMonth')}
                    sx={{
                      color: 'white',
                      background: calendarView === 'dayGridMonth' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                      '&:hover': { background: 'rgba(255,255,255,0.25)' },
                      ...(calendarView === 'dayGridMonth' && {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }),
                    }}
                  >
                    <MonthIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Week View">
                  <IconButton
                    onClick={() => handleViewChange('timeGridWeek')}
                    sx={{
                      color: 'white',
                      background: calendarView === 'timeGridWeek' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                      '&:hover': { background: 'rgba(255,255,255,0.25)' },
                      ...(calendarView === 'timeGridWeek' && {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }),
                    }}
                  >
                    <WeekIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Day View">
                  <IconButton
                    onClick={() => handleViewChange('timeGridDay')}
                    sx={{
                      color: 'white',
                      background: calendarView === 'timeGridDay' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                      '&:hover': { background: 'rgba(255,255,255,0.25)' },
                      ...(calendarView === 'timeGridDay' && {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }),
                    }}
                  >
                    <DayIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filter">
                  <Badge badgeContent={statusFilter !== 'all' ? 1 : 0} color="error">
                    <IconButton
                      onClick={(e) => setFilterAnchor(e.currentTarget)}
                      sx={{
                        color: 'white',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 2,
                        width: 40,
                        height: 40,
                        '&:hover': { background: 'rgba(255,255,255,0.25)' },
                      }}
                    >
                      <FilterIcon fontSize="small" />
                    </IconButton>
                  </Badge>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
          PaperProps={{
            sx: { borderRadius: 2, minWidth: 200 },
          }}
        >
          <MenuItem onClick={() => handleFilterChange('all')} selected={statusFilter === 'all'}>
            <Chip label="All" size="small" sx={{ mr: 1, bgcolor: '#E5E7EB' }} />
            All Appointments
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange('scheduled')} selected={statusFilter === 'scheduled'}>
            <Chip label="•" size="small" sx={{ mr: 1, bgcolor: '#6366F1', color: 'white' }} />
            Scheduled
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange('confirmed')} selected={statusFilter === 'confirmed'}>
            <Chip label="•" size="small" sx={{ mr: 1, bgcolor: '#10B981', color: 'white' }} />
            Confirmed
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange('completed')} selected={statusFilter === 'completed'}>
            <Chip label="•" size="small" sx={{ mr: 1, bgcolor: '#6B7280', color: 'white' }} />
            Completed
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange('cancelled')} selected={statusFilter === 'cancelled'}>
            <Chip label="•" size="small" sx={{ mr: 1, bgcolor: '#EF4444', color: 'white' }} />
            Cancelled
          </MenuItem>
        </Menu>

        {/* Calendar Container */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: 'white',
            '& .fc': {
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            },
            '& .fc-toolbar-title': {
              fontSize: '1.5rem',
              fontWeight: 700,
            },
            '& .fc-button': {
              textTransform: 'capitalize',
              fontWeight: 600,
            },
            '& .fc-event': {
              borderRadius: '6px',
              border: 'none',
              padding: '2px 6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            },
            '& .fc-daygrid-day-number': {
              fontWeight: 600,
              fontSize: '0.95rem',
            },
            '& .fc-col-header-cell': {
              padding: '12px 0',
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
            '& .fc-day-today': {
              backgroundColor: 'rgba(102, 126, 234, 0.05) !important',
            },
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView}
            headerToolbar={false}
            events={filteredEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            expandRows={true}
            dayMaxEvents={3}
            moreLinkText={(num) => `+${num} more`}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short',
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            nowIndicator={true}
            navLinks={true}
            editable={false}
            selectable={true}
            selectMirror={true}
          />
        </Paper>

        {/* Event Details Dialog */}
        <EventDetailsDialog />
      </Box>
    
  );
};

export default ModernCalendarView;
