import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchMyAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/doctors', {
        withCredentials: true
      });
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Fetch doctors failed:', error);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments', {
        params: { clientId: user.id },
        withCredentials: true
      });
      setMyAppointments(response.data.appointments);
    } catch (error) {
      console.error('Fetch appointments failed:', error);
    }
  };

  const fetchAvailableSlots = async (doctorId) => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const response = await axios.get('http://localhost:5000/api/calendar/slots', {
        params: {
          doctorId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        withCredentials: true
      });
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Fetch slots failed:', error);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    fetchAvailableSlots(doctor._id);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setOpenConfirmDialog(true);
  };

  const handleBookSlot = async () => {
    try {
      await axios.post('http://localhost:5000/api/calendar/slots/book', {
        slotId: selectedSlot._id
      }, {
        withCredentials: true
      });

      setOpenConfirmDialog(false);
      setSelectedSlot(null);
      fetchAvailableSlots(selectedDoctor._id);
      fetchMyAppointments();
    } catch (error) {
      console.error('Book slot failed:', error);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Container sx={{ flexGrow: 1, padding: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.name}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select a Doctor
            </Typography>
            <Grid container spacing={2}>
              {doctors.map((doctor) => (
                <Grid item xs={12} key={doctor._id}>
                  <Card sx={{ marginBottom: 2 }}>
                    <CardContent>
                      <Typography variant="h6">
                        Dr. {doctor.name}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        color="primary"
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        View Available Slots
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedDoctor ? `Available Slots - Dr. ${selectedDoctor.name}` : 'Select a doctor to view slots'}
            </Typography>
            <Grid container spacing={2}>
              {availableSlots.map((slot) => (
                <Grid item xs={12} key={slot._id}>
                  <Card sx={{ marginBottom: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {slot.type}
                      </Typography>
                      <Typography color="textSecondary">
                        {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        color="primary"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        Book Appointment
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Appointments
            </Typography>
            <Grid container spacing={2}>
              {myAppointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment._id}>
                  <Card sx={{ marginBottom: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Appointment with Dr. {appointment.doctor.name}
                      </Typography>
                      <Typography color="textSecondary">
                        {formatDateTime(appointment.slot.startTime)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Status: {appointment.status}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to book an appointment for:
            <br />
            {selectedSlot && (
              <>
                Type: {selectedSlot.type}
                <br />
                Time: {formatDateTime(selectedSlot.startTime)}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleBookSlot} color="primary">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientDashboard;