import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon
} from '@mui/icons-material';
import appointmentService from '../../services/appointmentService';

const STATUS_COLORS = {
  scheduled: 'primary',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'default',
  'no-show': 'warning',
  rescheduled: 'info'
};

const AppointmentsList = ({ appointments, onUpdate, showSnackbar }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const handleStatusChange = async () => {
    try {
      await appointmentService.updateAppointmentStatus(selectedAppointment._id, newStatus);
      setOpenStatusDialog(false);
      onUpdate();
      showSnackbar('Appointment status updated');
    } catch (error) {
      showSnackbar('Error updating appointment status', 'error');
    }
  };

  const filteredAppointments = appointments
    .filter(apt => filterStatus === 'all' || apt.status === filterStatus)
    .filter(apt =>
      searchTerm === '' ||
      apt.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const upcomingAppointments = filteredAppointments.filter(
    apt => apt.status === 'scheduled' || apt.status === 'confirmed'
  ).length;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Appointments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {filteredAppointments.length} | Upcoming: {upcomingAppointments}
        </Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="no-show">No Show</MenuItem>
              <MenuItem value="rescheduled">Rescheduled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Appointments Grid */}
      <Grid container spacing={2}>
        {filteredAppointments.length === 0 ? (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No appointments found
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredAppointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {appointment.client?.name || appointment.patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.client?.email || appointment.patientEmail}
                      </Typography>
                      {appointment.patientPhone && (
                        <Typography variant="body2" color="text.secondary">
                          {appointment.patientPhone}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={appointment.status.toUpperCase()}
                      color={STATUS_COLORS[appointment.status]}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(appointment.slot?.startTime).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Type:
                    </Typography>
                    <Typography variant="body2">
                      {appointment.slot?.type}
                    </Typography>
                  </Box>

                  {appointment.reasonForVisit && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Reason:
                      </Typography>
                      <Typography variant="body2">
                        {appointment.reasonForVisit}
                      </Typography>
                    </Box>
                  )}

                  {appointment.notes && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Notes:
                      </Typography>
                      <Typography variant="body2">
                        {appointment.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                    <>
                      <Button
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setNewStatus('completed');
                          setOpenStatusDialog(true);
                        }}
                      >
                        Complete
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setNewStatus('no-show');
                          setOpenStatusDialog(true);
                        }}
                      >
                        No Show
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <Typography>
            Change appointment status to <strong>{newStatus}</strong>?
          </Typography>
          {selectedAppointment && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2">
                Patient: {selectedAppointment.client?.name || selectedAppointment.patientName}
              </Typography>
              <Typography variant="body2">
                Time: {new Date(selectedAppointment.slot?.startTime).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AppointmentsList;