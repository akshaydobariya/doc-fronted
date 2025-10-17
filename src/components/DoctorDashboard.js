import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarService } from '../services/calendarService';
import { useAuth } from '../contexts/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [openSlotDialog, setOpenSlotDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotType, setSlotType] = useState('');

  useEffect(() => {
    if (user) {
      syncCalendar();
      fetchEvents();
    }
  }, [user]);

  const syncCalendar = async () => {
    try {
      await calendarService.syncCalendar();
    } catch (error) {
      console.error('Calendar sync failed:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const response = await calendarService.getAvailableSlots(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      );

      const formattedEvents = response.slots.map(slot => ({
        id: slot._id,
        title: slot.isAvailable ? `Available: ${slot.type}` : `Booked: ${slot.type}`,
        start: new Date(slot.startTime),
        end: new Date(slot.endTime),
        backgroundColor: slot.isAvailable ? '#4CAF50' : '#F44336'
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Fetch events failed:', error);
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end
    });
    setOpenSlotDialog(true);
  };

  const handleCreateSlot = async () => {
    try {
      await calendarService.createSlot(
        selectedSlot.start,
        selectedSlot.end,
        slotType
      );

      setOpenSlotDialog(false);
      setSlotType('');
      fetchEvents();
    } catch (error) {
      console.error('Create slot failed:', error);
    }
  };

  return (
    <Container sx={{ flexGrow: 1, padding: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, Dr. {user?.name}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <div sx={{ '& .fc': { height: '70vh' } }}>
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
              />
            </div>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openSlotDialog} onClose={() => setOpenSlotDialog(false)}>
        <DialogTitle>Create Available Slot</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Appointment Type"
            fullWidth
            value={slotType}
            onChange={(e) => setSlotType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSlotDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateSlot} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorDashboard;