import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Block as BlockIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import calendarService from '../../services/calendarService';
import availabilityService from '../../services/availabilityService';

const QuickSlotGenerator = ({ availability, onSlotsGenerated, showSnackbar }) => {
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Individual appointment type configurations
  const [appointmentConfigs, setAppointmentConfigs] = useState([]);

  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [result, setResult] = useState(null);
  const [weekendDialog, setWeekendDialog] = useState({ open: false, weekendDates: [] });
  const [conflictDialog, setConflictDialog] = useState({ open: false, conflicts: [] });

  // Add appointment type with custom time
  const handleAddAppointmentConfig = (typeId) => {
    if (!typeId) return;

    const type = availability.appointmentTypes.find(t => t._id === typeId);
    if (!type) return;

    // Check if already added
    if (appointmentConfigs.find(c => c.typeId === typeId)) {
      showSnackbar('This appointment type is already added', 'warning');
      return;
    }

    const newConfig = {
      typeId: type._id,
      typeName: type.name,
      duration: type.duration,
      color: type.color,
      startTime: '09:00',
      endTime: '17:00'
    };

    setAppointmentConfigs([...appointmentConfigs, newConfig]);
  };

  const handleRemoveAppointmentConfig = (typeId) => {
    setAppointmentConfigs(appointmentConfigs.filter(c => c.typeId !== typeId));
  };

  const handleUpdateAppointmentTime = (typeId, field, value) => {
    setAppointmentConfigs(appointmentConfigs.map(config =>
      config.typeId === typeId
        ? { ...config, [field]: value }
        : config
    ));
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates([...blockedDates, newBlockedDate]);
      setNewBlockedDate('');
    }
  };

  const handleRemoveBlockedDate = (dateToRemove) => {
    setBlockedDates(blockedDates.filter(date => date !== dateToRemove));
  };

  const handleQuickGenerate = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const checkForWeekendsInRange = (start, end) => {
    const weekendDates = [];
    const current = new Date(start);
    const endDateObj = new Date(end);

    while (current <= endDateObj) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDates.push(new Date(current).toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    return weekendDates;
  };

  // Validate appointment time configurations
  const validateAppointmentConfigs = () => {
    const errors = [];

    for (const config of appointmentConfigs) {
      // Check if start time is before end time
      if (config.startTime >= config.endTime) {
        errors.push(`${config.typeName}: End time must be after start time`);
      }

      // Check if there's enough time for at least one appointment
      const startMinutes = parseInt(config.startTime.split(':')[0]) * 60 + parseInt(config.startTime.split(':')[1]);
      const endMinutes = parseInt(config.endTime.split(':')[0]) * 60 + parseInt(config.endTime.split(':')[1]);
      const availableMinutes = endMinutes - startMinutes;

      if (availableMinutes < config.duration) {
        errors.push(`${config.typeName}: Time range is too short (need at least ${config.duration} minutes)`);
      }
    }

    // Check for time conflicts between appointment types
    const conflicts = [];
    for (let i = 0; i < appointmentConfigs.length; i++) {
      for (let j = i + 1; j < appointmentConfigs.length; j++) {
        const config1 = appointmentConfigs[i];
        const config2 = appointmentConfigs[j];

        // Check if time ranges overlap
        if (!(config1.endTime <= config2.startTime || config2.endTime <= config1.startTime)) {
          conflicts.push({
            type1: config1.typeName,
            time1: `${config1.startTime} - ${config1.endTime}`,
            type2: config2.typeName,
            time2: `${config2.startTime} - ${config2.endTime}`
          });
        }
      }
    }

    if (conflicts.length > 0) {
      setConflictDialog({
        open: true,
        conflicts,
        errors
      });
      return false;
    }

    if (errors.length > 0) {
      errors.forEach(error => showSnackbar(error, 'error'));
      return false;
    }

    return true;
  };

  const handleGenerateSlots = async () => {
    if (!startDate || !endDate) {
      showSnackbar('Please select start and end dates', 'warning');
      return;
    }

    if (appointmentConfigs.length === 0) {
      showSnackbar('Please add at least one appointment type configuration', 'warning');
      return;
    }

    // Validate configurations
    if (!validateAppointmentConfigs()) {
      return;
    }

    // Check if multiple days and has weekends
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDifference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const isSingleDay = daysDifference === 0;

    // For single day, always proceed (including weekends)
    if (isSingleDay) {
      await proceedWithGeneration(true);
      return;
    }

    // For multiple days, check for weekends
    const weekendDates = checkForWeekendsInRange(start, end);

    if (weekendDates.length > 0) {
      // Show confirmation dialog
      setWeekendDialog({
        open: true,
        weekendDates
      });
      return;
    }

    // No weekends, proceed
    await proceedWithGeneration(false);
  };

  const handleWeekendDialogClose = (include) => {
    setWeekendDialog({ open: false, weekendDates: [] });
    if (include !== null) {
      proceedWithGeneration(include);
    }
  };

  const proceedWithGeneration = async (includeWeekends) => {
    try {
      setGenerating(true);
      setResult(null);

      // First, add blocked dates to availability
      if (blockedDates.length > 0) {
        for (const dateStr of blockedDates) {
          const blockStart = new Date(dateStr);
          blockStart.setHours(0, 0, 0, 0);
          const blockEnd = new Date(dateStr);
          blockEnd.setHours(23, 59, 59, 999);

          await availabilityService.addBlockedSlot({
            startTime: blockStart.toISOString(),
            endTime: blockEnd.toISOString(),
            reason: 'Holiday/Blocked Date'
          });
        }
      }

      // Update appointment types with custom time restrictions
      const updatedTypes = availability.appointmentTypes.map(t => {
        const config = appointmentConfigs.find(c => c.typeId === t._id);
        if (config) {
          return {
            ...t,
            timeRestrictions: [{
              startTime: config.startTime,
              endTime: config.endTime
            }]
          };
        }
        return t;
      });
      await availabilityService.updateAppointmentTypes(updatedTypes);

      // Generate slots for each configured type
      let totalGenerated = 0;
      const allSlots = [];
      const summary = {};

      for (const config of appointmentConfigs) {
        const response = await calendarService.generateSlots(
          new Date(startDate).toISOString(),
          new Date(endDate).toISOString(),
          config.typeId,
          includeWeekends
        );

        if (response.slots) {
          const slotsGenerated = response.slots.length;
          totalGenerated += slotsGenerated;
          allSlots.push(...response.slots);
          summary[config.typeName] = {
            count: slotsGenerated,
            time: `${config.startTime} - ${config.endTime}`
          };
        }
      }

      // Remove custom time restrictions
      const originalTypes = availability.appointmentTypes.map(t => {
        const config = appointmentConfigs.find(c => c.typeId === t._id);
        if (config) {
          return {
            ...t,
            timeRestrictions: []
          };
        }
        return t;
      });
      await availabilityService.updateAppointmentTypes(originalTypes);

      setResult({
        message: `Successfully generated ${totalGenerated} slots!`,
        slots: allSlots,
        summary
      });

      if (onSlotsGenerated) {
        onSlotsGenerated();
      }
      showSnackbar(`Generated ${totalGenerated} slots successfully!`, 'success');
    } catch (error) {
      console.error('Generate slots error:', error);
      showSnackbar(error.response?.data?.message || 'Error generating slots', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const availableTypes = availability.appointmentTypes.filter(t =>
    t.enabled !== false && !appointmentConfigs.find(c => c.typeId === t._id)
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CalendarIcon color="primary" fontSize="large" />
        <Typography variant="h5">
          Quick Slot Generation
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        Select date range, configure appointment types with specific times, and any blocked dates.
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Quick Date Range:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={() => handleQuickGenerate(1)}>
                Today
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickGenerate(7)}>
                Next 7 Days
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickGenerate(30)}>
                Next 30 Days
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickGenerate(90)}>
                Next 3 Months
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Date Range */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: getTodayDate() }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: startDate || getTodayDate() }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Appointment Type Configurations */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">
              Appointment Type Configurations
            </Typography>
            <Tooltip title="Configure each appointment type with specific time ranges. Conflicts will be detected automatically.">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Add New Appointment Type */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Add Appointment Type</InputLabel>
            <Select
              value=""
              onChange={(e) => handleAddAppointmentConfig(e.target.value)}
              label="Add Appointment Type"
            >
              {availableTypes.map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  {type.name} ({type.duration} min)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Display Configured Appointment Types */}
          {appointmentConfigs.length === 0 ? (
            <Alert severity="info">
              No appointment types configured yet. Add appointment types above to specify custom times.
            </Alert>
          ) : (
            <Box>
              {appointmentConfigs.map((config) => (
                <Accordion key={config.typeId} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Chip
                        label={config.typeName}
                        sx={{ bgcolor: config.color, color: 'white' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {config.startTime} - {config.endTime} ({config.duration} min slots)
                      </Typography>
                      <Box flexGrow={1} />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAppointmentConfig(config.typeId);
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Start Time"
                          type="time"
                          value={config.startTime}
                          onChange={(e) => handleUpdateAppointmentTime(config.typeId, 'startTime', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          helperText="When this appointment type slots should start"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="End Time"
                          type="time"
                          value={config.endTime}
                          onChange={(e) => handleUpdateAppointmentTime(config.typeId, 'endTime', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          helperText="When this appointment type slots should end"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                          <strong>Estimated slots:</strong> ~
                          {Math.floor(
                            (parseInt(config.endTime.split(':')[0]) * 60 + parseInt(config.endTime.split(':')[1]) -
                            (parseInt(config.startTime.split(':')[0]) * 60 + parseInt(config.startTime.split(':')[1]))) /
                            config.duration
                          )} slots per day for this appointment type
                        </Alert>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Grid>

        {/* Blocked Dates / Holidays */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            <BlockIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Block Dates (Holidays/Off Days):
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Select Date to Block"
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddBlockedDate}
              disabled={!newBlockedDate}
            >
              Add
            </Button>
          </Box>

          {blockedDates.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {blockedDates.map((date) => (
                <Chip
                  key={date}
                  label={new Date(date).toLocaleDateString()}
                  onDelete={() => handleRemoveBlockedDate(date)}
                  color="error"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No blocked dates added
            </Typography>
          )}
        </Grid>

        {/* Summary Info */}
        {startDate && endDate && appointmentConfigs.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Summary:</strong>
                <br />
                • Date Range: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                <br />
                • Appointment Types Configured: {appointmentConfigs.length}
                <br />
                {appointmentConfigs.map(config => (
                  <span key={config.typeId}>
                    &nbsp;&nbsp;- {config.typeName}: {config.startTime} - {config.endTime}
                    <br />
                  </span>
                ))}
                • Blocked Dates: {blockedDates.length}
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Generate Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleGenerateSlots}
            disabled={generating || !startDate || !endDate || appointmentConfigs.length === 0}
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          >
            {generating ? 'Generating Slots...' : 'Generate Slots'}
          </Button>
        </Grid>

        {/* Results */}
        {result && (
          <Grid item xs={12}>
            <Alert severity="success">
              <Typography variant="h6" gutterBottom>
                {result.message}
              </Typography>
              {result.summary && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Breakdown by Appointment Type:</strong>
                  </Typography>
                  {Object.entries(result.summary).map(([typeName, info]) => (
                    <Typography key={typeName} variant="body2">
                      • {typeName}: {info.count} slots ({info.time})
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          </Grid>
        )}

        {/* Info */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="caption">
              <strong>Note:</strong> Each appointment type can have its own time range.
              Conflicts between overlapping time ranges will be detected automatically.
              Existing slots won't be duplicated.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Weekend Confirmation Dialog */}
      <Dialog
        open={weekendDialog.open}
        onClose={() => handleWeekendDialogClose(null)}
      >
        <DialogTitle>Weekend Dates Detected</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your selected date range includes the following weekend dates:
          </DialogContentText>
          <Box sx={{ mt: 2, mb: 2 }}>
            {weekendDialog.weekendDates.map((date) => {
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
              return (
                <Chip
                  key={date}
                  label={`${dayName}, ${dateObj.toLocaleDateString()}`}
                  color="warning"
                  sx={{ m: 0.5 }}
                />
              );
            })}
          </Box>
          <DialogContentText>
            Do you want to include these weekend dates when generating slots?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleWeekendDialogClose(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={() => handleWeekendDialogClose(false)} variant="outlined" color="primary">
            Skip Weekends
          </Button>
          <Button onClick={() => handleWeekendDialogClose(true)} variant="contained" color="primary">
            Include Weekends
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Detection Dialog */}
      <Dialog
        open={conflictDialog.open}
        onClose={() => setConflictDialog({ open: false, conflicts: [] })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle color="error">Time Conflicts Detected</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            The following appointment types have overlapping time ranges. Please adjust the times to avoid conflicts.
          </Alert>
          {conflictDialog.conflicts.map((conflict, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Conflict {index + 1}:
              </Typography>
              <Typography variant="body2">
                • {conflict.type1}: {conflict.time1}
              </Typography>
              <Typography variant="body2">
                • {conflict.type2}: {conflict.time2}
              </Typography>
            </Box>
          ))}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> Make sure each appointment type has a distinct time range,
              or adjust the times so they don't overlap.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConflictDialog({ open: false, conflicts: [] })}
            variant="contained"
          >
            Close and Fix
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuickSlotGenerator;
