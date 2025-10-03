import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import availabilityService from '../../services/availabilityService';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AvailabilitySettings = ({ availability, onUpdate, showSnackbar }) => {
  const [editingAvailability, setEditingAvailability] = useState(availability);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [openBlockedDialog, setOpenBlockedDialog] = useState(false);
  const [newBlocked, setNewBlocked] = useState({ startTime: '', endTime: '', reason: '' });

  const handleDayToggle = (dayIndex) => {
    const updated = editingAvailability.standardAvailability.map(day =>
      day.dayOfWeek === dayIndex ? { ...day, enabled: !day.enabled } : day
    );
    setEditingAvailability({ ...editingAvailability, standardAvailability: updated });
  };

  const handleTimeChange = (dayIndex, field, value) => {
    const updated = editingAvailability.standardAvailability.map(day =>
      day.dayOfWeek === dayIndex ? { ...day, [field]: value } : day
    );
    setEditingAvailability({ ...editingAvailability, standardAvailability: updated });
  };

  const handleSaveSchedule = async () => {
    try {
      await availabilityService.updateStandardAvailability(editingAvailability.standardAvailability);
      onUpdate();
      showSnackbar('Schedule updated successfully');
    } catch (error) {
      showSnackbar('Error updating schedule', 'error');
    }
  };

  const handleAddAppointmentType = () => {
    setEditingType({ name: '', duration: 30, color: '#4CAF50', description: '', enabled: true });
    setOpenTypeDialog(true);
  };

  const handleEditAppointmentType = (type) => {
    setEditingType({ ...type });
    setOpenTypeDialog(true);
  };

  const handleSaveAppointmentType = async () => {
    try {
      let updatedTypes = [...editingAvailability.appointmentTypes];

      if (editingType._id) {
        // Update existing
        updatedTypes = updatedTypes.map(t => t._id === editingType._id ? editingType : t);
      } else {
        // Add new
        updatedTypes.push(editingType);
      }

      await availabilityService.updateAppointmentTypes(updatedTypes);
      setOpenTypeDialog(false);
      onUpdate();
      showSnackbar('Appointment type saved successfully');
    } catch (error) {
      showSnackbar('Error saving appointment type', 'error');
    }
  };

  const handleDeleteAppointmentType = async (typeId) => {
    try {
      const updatedTypes = editingAvailability.appointmentTypes.filter(t => t._id !== typeId);
      await availabilityService.updateAppointmentTypes(updatedTypes);
      onUpdate();
      showSnackbar('Appointment type deleted');
    } catch (error) {
      showSnackbar('Error deleting appointment type', 'error');
    }
  };

  const handleRuleChange = (field, value) => {
    setEditingAvailability({
      ...editingAvailability,
      rules: { ...editingAvailability.rules, [field]: value }
    });
  };

  const handleSaveRules = async () => {
    try {
      await availabilityService.updateRules(editingAvailability.rules);
      onUpdate();
      showSnackbar('Rules updated successfully');
    } catch (error) {
      showSnackbar('Error updating rules', 'error');
    }
  };

  const handleAddBlockedSlot = async () => {
    try {
      await availabilityService.addBlockedSlot(newBlocked);
      setOpenBlockedDialog(false);
      setNewBlocked({ startTime: '', endTime: '', reason: '' });
      onUpdate();
      showSnackbar('Blocked slot added');
    } catch (error) {
      showSnackbar('Error adding blocked slot', 'error');
    }
  };

  const handleRemoveBlockedSlot = async (slotId) => {
    try {
      await availabilityService.removeBlockedSlot(slotId);
      onUpdate();
      showSnackbar('Blocked slot removed');
    } catch (error) {
      showSnackbar('Error removing blocked slot', 'error');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Weekly Schedule */}
      <Grid item xs={12}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Weekly Schedule</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              {editingAvailability.standardAvailability.map((day) => {
                const dayName = DAYS[day.dayOfWeek];
                return (
                  <Box key={day.dayOfWeek} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={day.enabled}
                              onChange={() => handleDayToggle(day.dayOfWeek)}
                            />
                          }
                          label={<Typography variant="body1" fontWeight="bold">{dayName}</Typography>}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="Start Time"
                          type="time"
                          value={day.startTime}
                          onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                          disabled={!day.enabled}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="End Time"
                          type="time"
                          value={day.endTime}
                          onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                          disabled={!day.enabled}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSchedule}
                sx={{ mt: 2 }}
              >
                Save Schedule
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Appointment Types */}
      <Grid item xs={12}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Appointment Types</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                {editingAvailability.appointmentTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type._id}>
                    <Paper sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={type.name}
                          sx={{ bgcolor: type.color, color: 'white' }}
                        />
                        <Box>
                          <IconButton size="small" onClick={() => handleEditAppointmentType(type)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteAppointmentType(type._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Duration: {type.duration} minutes
                      </Typography>
                      {type.description && (
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddAppointmentType}
                sx={{ mt: 2 }}
              >
                Add Appointment Type
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Booking Rules */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Booking Rules</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Buffer Time Before (minutes)"
                  type="number"
                  value={editingAvailability.rules.bufferTimeBefore}
                  onChange={(e) => handleRuleChange('bufferTimeBefore', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Buffer Time After (minutes)"
                  type="number"
                  value={editingAvailability.rules.bufferTimeAfter}
                  onChange={(e) => handleRuleChange('bufferTimeAfter', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Min Lead Time (hours)"
                  type="number"
                  value={editingAvailability.rules.minLeadTime}
                  onChange={(e) => handleRuleChange('minLeadTime', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Advance Booking (days)"
                  type="number"
                  value={editingAvailability.rules.maxAdvanceBooking}
                  onChange={(e) => handleRuleChange('maxAdvanceBooking', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Appointments Per Day"
                  type="number"
                  value={editingAvailability.rules.maxAppointmentsPerDay || ''}
                  onChange={(e) => handleRuleChange('maxAppointmentsPerDay', e.target.value ? parseInt(e.target.value) : null)}
                  fullWidth
                  placeholder="Unlimited"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Min Cancellation Notice (hours)"
                  type="number"
                  value={editingAvailability.rules.minCancellationNotice}
                  onChange={(e) => handleRuleChange('minCancellationNotice', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveRules}
                >
                  Save Rules
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Blocked Slots */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Blocked Slots (Holidays / Breaks)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {editingAvailability.blockedSlots?.map((slot, index) => (
                <Paper key={index} sx={{ p: 2, mb: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1">{slot.reason || 'Blocked'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => handleRemoveBlockedSlot(slot._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenBlockedDialog(true)}
                sx={{ mt: 2 }}
              >
                Add Blocked Slot
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Appointment Type Dialog */}
      <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingType?._id ? 'Edit' : 'Add'} Appointment Type</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  value={editingType?.name || ''}
                  onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={editingType?.duration || 30}
                  onChange={(e) => setEditingType({ ...editingType, duration: parseInt(e.target.value) })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Color"
                  type="color"
                  value={editingType?.color || '#4CAF50'}
                  onChange={(e) => setEditingType({ ...editingType, color: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={editingType?.description || ''}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTypeDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAppointmentType} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Blocked Slot Dialog */}
      <Dialog open={openBlockedDialog} onClose={() => setOpenBlockedDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Blocked Slot</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Start Date & Time"
                  type="datetime-local"
                  value={newBlocked.startTime}
                  onChange={(e) => setNewBlocked({ ...newBlocked, startTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="End Date & Time"
                  type="datetime-local"
                  value={newBlocked.endTime}
                  onChange={(e) => setNewBlocked({ ...newBlocked, endTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reason"
                  value={newBlocked.reason}
                  onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
                  fullWidth
                  placeholder="e.g., Holiday, Conference, Personal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlockedDialog(false)}>Cancel</Button>
          <Button onClick={handleAddBlockedSlot} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AvailabilitySettings;