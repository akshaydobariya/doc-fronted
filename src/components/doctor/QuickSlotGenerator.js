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
  DialogActions
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Block as BlockIcon,
  Add as AddIcon
} from '@mui/icons-material';
import calendarService from '../../services/calendarService';
import availabilityService from '../../services/availabilityService';

const QuickSlotGenerator = ({ availability, onSlotsGenerated, showSnackbar }) => {
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [result, setResult] = useState(null);
  const [weekendDialog, setWeekendDialog] = useState({ open: false, weekendDates: [] });
  const [includeWeekends, setIncludeWeekends] = useState(false);

  const handleTypeChange = (event) => {
    const value = event.target.value;
    setSelectedTypes(typeof value === 'string' ? value.split(',') : value);
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

  const handleGenerateSlots = async () => {
    if (!startDate || !endDate) {
      showSnackbar('Please select start and end dates', 'warning');
      return;
    }

    if (selectedTypes.length === 0) {
      showSnackbar('Please select at least one appointment type', 'warning');
      return;
    }

    if (startTime >= endTime) {
      showSnackbar('End time must be after start time', 'warning');
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

      // Generate slots for each selected type
      let totalGenerated = 0;
      const allSlots = [];
      const useCustomHours = startTime !== '09:00' || endTime !== '17:00';

      // OPTIMIZATION: Apply custom hours to ALL selected types at once (not in loop)
      if (useCustomHours) {
        const updatedTypes = availability.appointmentTypes.map(t => {
          if (selectedTypes.includes(t._id)) {
            return {
              ...t,
              timeRestrictions: [{ startTime, endTime }]
            };
          }
          return t;
        });
        await availabilityService.updateAppointmentTypes(updatedTypes);
      }

      // Generate slots for each type (no updateAppointmentTypes calls in loop)
      for (const typeId of selectedTypes) {
        const type = availability.appointmentTypes.find(t => t._id === typeId);
        if (!type) continue;

        const response = await calendarService.generateSlots(
          new Date(startDate).toISOString(),
          new Date(endDate).toISOString(),
          typeId,
          includeWeekends
        );

        if (response.slots) {
          totalGenerated += response.slots.length;
          allSlots.push(...response.slots);
        }
      }

      // OPTIMIZATION: Remove custom hours from ALL types at once (not in loop)
      if (useCustomHours) {
        const originalTypes = availability.appointmentTypes.map(t => {
          if (selectedTypes.includes(t._id)) {
            return {
              ...t,
              timeRestrictions: []
            };
          }
          return t;
        });
        await availabilityService.updateAppointmentTypes(originalTypes);
      }

      setResult({
        message: `Successfully generated ${totalGenerated} slots!`,
        slots: allSlots
      });

      // OPTIMIZATION: Only call callback once at the end
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

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CalendarIcon color="primary" fontSize="large" />
        <Typography variant="h5">
          Quick Slot Generation
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        Select date range, working hours, appointment types, and any blocked dates to generate slots.
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

        {/* Time Range */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Daily Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Working hours start time"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Daily End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Working hours end time"
          />
        </Grid>

        {/* Appointment Types Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Select Appointment Types</InputLabel>
            <Select
              multiple
              value={selectedTypes}
              onChange={handleTypeChange}
              input={<OutlinedInput label="Select Appointment Types" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((typeId) => {
                    const type = availability.appointmentTypes.find(t => t._id === typeId);
                    return type ? (
                      <Chip
                        key={typeId}
                        label={type.name}
                        size="small"
                        sx={{ bgcolor: type.color, color: 'white' }}
                      />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {availability.appointmentTypes.filter(t => t.enabled !== false).map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  <Checkbox checked={selectedTypes.indexOf(type._id) > -1} />
                  <ListItemText
                    primary={type.name}
                    secondary={`${type.duration} min`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
        {startDate && endDate && selectedTypes.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Summary:</strong>
                <br />
                • Date Range: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                <br />
                • Daily Hours: {startTime} - {endTime}
                <br />
                • Appointment Types: {selectedTypes.length} selected
                <br />
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
            disabled={generating || !startDate || !endDate || selectedTypes.length === 0}
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
              {result.slots && result.slots.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Sample generated slots (first 5):
                  </Typography>
                  {result.slots.slice(0, 5).map((slot, index) => (
                    <Chip
                      key={index}
                      label={`${slot.type}: ${new Date(slot.startTime).toLocaleString()}`}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                  {result.slots.length > 5 && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      ...and {result.slots.length - 5} more
                    </Typography>
                  )}
                </Box>
              )}
            </Alert>
          </Grid>
        )}

        {/* Info */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="caption">
              <strong>Note:</strong> Slots will be generated based on your configured buffer times and rules.
              Blocked dates will have no slots. Existing slots won't be duplicated.
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
    </Paper>
  );
};

export default QuickSlotGenerator;