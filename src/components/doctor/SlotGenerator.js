import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import { Add as AddIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import calendarService from '../../services/calendarService';

const SlotGenerator = ({ availability, onSlotsGenerated, showSnackbar }) => {
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [result, setResult] = useState(null);

  const handleGenerateSlots = async () => {
    if (!startDate || !endDate) {
      showSnackbar('Please select start and end dates', 'warning');
      return;
    }

    if (!selectedTypeId) {
      showSnackbar('Please select an appointment type', 'warning');
      return;
    }

    try {
      setGenerating(true);
      setResult(null);

      const start = new Date(startDate).toISOString();
      const end = new Date(endDate).toISOString();

      // If "All Types" selected, generate for each type
      if (selectedTypeId === 'all') {
        let totalSlots = [];
        for (const type of availability.appointmentTypes.filter(t => t.enabled)) {
          const data = await calendarService.generateSlots(start, end, type._id);
          if (data.slots) {
            totalSlots = [...totalSlots, ...data.slots];
          }
        }
        setResult({
          message: `Successfully generated ${totalSlots.length} slots for all appointment types`,
          slots: totalSlots
        });
      } else {
        const data = await calendarService.generateSlots(start, end, selectedTypeId);
        setResult(data);
      }

      onSlotsGenerated();
      showSnackbar('Slots generated successfully!', 'success');
    } catch (error) {
      console.error('Generate slots error:', error);
      showSnackbar(error.response?.data?.message || 'Error generating slots', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickGenerate = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const selectedType = selectedTypeId === 'all'
    ? { name: 'All Types', duration: 'Various', description: 'Generating slots for all appointment types' }
    : availability.appointmentTypes.find(t => t._id === selectedTypeId);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Appointment Slots
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Automatically generate available slots based on your schedule and appointment types.
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Quick Generate:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickGenerate(7)}
                color="primary"
              >
                Next 7 Days
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickGenerate(30)}
                color="primary"
              >
                Next 30 Days (1 Month)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickGenerate(90)}
                color="secondary"
              >
                Next 90 Days (3 Months)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickGenerate(365)}
                color="success"
              >
                Next 365 Days (1 Year)
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Date Range */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split('T')[0]
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startDate || new Date().toISOString().split('T')[0]
            }}
          />
        </Grid>

        {/* Appointment Type Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Appointment Type</InputLabel>
            <Select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              label="Appointment Type"
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label="All Types"
                    color="success"
                  />
                  <Typography variant="body2" color="text.secondary">
                    (Generate slots for all appointment types)
                  </Typography>
                </Box>
              </MenuItem>
              {availability.appointmentTypes.filter(t => t.enabled !== false).map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={type.name}
                      sx={{ bgcolor: type.color, color: 'white' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({type.duration} min)
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Selected Type Info */}
        {selectedType && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>{selectedType.name}</strong> appointments will be generated
                ({selectedType.duration} minutes each)
              </Typography>
              {selectedType.description && (
                <Typography variant="caption" display="block">
                  {selectedType.description}
                </Typography>
              )}
            </Alert>
          </Grid>
        )}

        {/* Current Rules Info */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Active Rules:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Buffer Before:
                </Typography>
                <Typography variant="body2">
                  {availability.rules.bufferTimeBefore} min
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Buffer After:
                </Typography>
                <Typography variant="body2">
                  {availability.rules.bufferTimeAfter} min
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Lead Time:
                </Typography>
                <Typography variant="body2">
                  {availability.rules.minLeadTime} hours
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Max Daily:
                </Typography>
                <Typography variant="body2">
                  {availability.rules.maxAppointmentsPerDay || 'Unlimited'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Generate Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleGenerateSlots}
            disabled={generating || !startDate || !endDate || !selectedTypeId}
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          >
            {generating ? 'Generating Slots...' : 'Generate Slots'}
          </Button>
        </Grid>

        {/* Progress */}
        {generating && (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        )}

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
                    Sample generated slots:
                  </Typography>
                  {result.slots.slice(0, 5).map((slot, index) => (
                    <Chip
                      key={index}
                      label={new Date(slot.startTime).toLocaleString()}
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
              <strong>Note:</strong> Slots will be generated based on your weekly schedule,
              respecting blocked slots and buffer times. Overlapping slots will be automatically skipped.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SlotGenerator;