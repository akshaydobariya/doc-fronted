import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  Divider,
  Alert,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import calendarService from '../../services/calendarService';
import availabilityService from '../../services/availabilityService';

const FirstTimeSlotSetup = ({ open, onClose, availability, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Buffer times, 2: Time restrictions, 3: Generate
  const [days, setDays] = useState(7);

  // Buffer times per appointment type
  const [typeSettings, setTypeSettings] = useState(
    availability?.appointmentTypes?.map(type => ({
      typeId: type._id,
      name: type.name,
      duration: type.duration,
      color: type.color,
      bufferBefore: 10,
      bufferAfter: 5,
      timeRestrictions: [] // Array of {startTime, endTime}
    })) || []
  );

  const handleBufferChange = (typeId, field, value) => {
    setTypeSettings(prev =>
      prev.map(t =>
        t.typeId === typeId ? { ...t, [field]: parseInt(value) || 0 } : t
      )
    );
  };

  const addTimeRestriction = (typeId) => {
    setTypeSettings(prev =>
      prev.map(t =>
        t.typeId === typeId
          ? {
              ...t,
              timeRestrictions: [
                ...t.timeRestrictions,
                { startTime: '09:00', endTime: '12:00' }
              ]
            }
          : t
      )
    );
  };

  const updateTimeRestriction = (typeId, index, field, value) => {
    setTypeSettings(prev =>
      prev.map(t =>
        t.typeId === typeId
          ? {
              ...t,
              timeRestrictions: t.timeRestrictions.map((tr, i) =>
                i === index ? { ...tr, [field]: value } : tr
              )
            }
          : t
      )
    );
  };

  const removeTimeRestriction = (typeId, index) => {
    setTypeSettings(prev =>
      prev.map(t =>
        t.typeId === typeId
          ? {
              ...t,
              timeRestrictions: t.timeRestrictions.filter((_, i) => i !== index)
            }
          : t
      )
    );
  };

  const handleGenerateSlots = async () => {
    try {
      setLoading(true);

      // Step 1: Update buffer times for each appointment type
      const updatedTypes = availability.appointmentTypes.map(type => {
        const settings = typeSettings.find(t => t.typeId === type._id);
        return {
          ...type,
          bufferBefore: settings?.bufferBefore || 10,
          bufferAfter: settings?.bufferAfter || 5,
          timeRestrictions: settings?.timeRestrictions || []
        };
      });

      await availabilityService.updateAppointmentTypes(updatedTypes);

      // Step 2: Generate slots for each type
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      let totalGenerated = 0;

      for (const typeSetting of typeSettings) {
        const response = await calendarService.generateSlots(
          startDate.toISOString(),
          endDate.toISOString(),
          typeSetting.typeId
        );
        totalGenerated += response.slots?.length || 0;
      }

      onComplete({
        success: true,
        message: `Successfully generated ${totalGenerated} slots for ${days} days`,
        totalSlots: totalGenerated
      });

      onClose();
    } catch (error) {
      console.error('Generate slots error:', error);
      onComplete({
        success: false,
        message: error.response?.data?.message || 'Error generating slots'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarIcon color="primary" />
          <Typography variant="h5">
            Setup Your Appointment Slots
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Step {step} of 3: {step === 1 ? 'Buffer Times' : step === 2 ? 'Time Restrictions' : 'Generate Slots'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Step 1: Buffer Times */}
        {step === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Set buffer time before and after appointments for each appointment type. This creates gaps between appointments for preparation and cleanup.
            </Alert>

            <Grid container spacing={3}>
              {typeSettings.map((type) => (
                <Grid item xs={12} key={type.typeId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Chip
                          label={type.name}
                          sx={{ bgcolor: type.color, color: 'white' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({type.duration} minutes)
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Buffer Before (minutes)"
                            value={type.bufferBefore}
                            onChange={(e) =>
                              handleBufferChange(type.typeId, 'bufferBefore', e.target.value)
                            }
                            inputProps={{ min: 0, max: 60 }}
                            helperText="Time before appointment starts"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Buffer After (minutes)"
                            value={type.bufferAfter}
                            onChange={(e) =>
                              handleBufferChange(type.typeId, 'bufferAfter', e.target.value)
                            }
                            inputProps={{ min: 0, max: 60 }}
                            helperText="Time after appointment ends"
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Example timeline:
                        </Typography>
                        <Typography variant="body2">
                          {type.bufferBefore} min prep → {type.duration} min appointment → {type.bufferAfter} min cleanup
                        </Typography>
                        <Typography variant="caption" color="primary">
                          Total slot duration: {type.bufferBefore + type.duration + type.bufferAfter} minutes
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Step 2: Time Restrictions */}
        {step === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Optional: Restrict specific appointment types to certain time windows. For example, only offer Consultations from 9 AM to 12 PM.
            </Alert>

            <Grid container spacing={3}>
              {typeSettings.map((type) => (
                <Grid item xs={12} key={type.typeId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={type.name}
                            sx={{ bgcolor: type.color, color: 'white' }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Time Restrictions
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => addTimeRestriction(type.typeId)}
                        >
                          Add Restriction
                        </Button>
                      </Box>

                      {type.timeRestrictions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No restrictions - available during all working hours
                        </Typography>
                      ) : (
                        <Grid container spacing={2}>
                          {type.timeRestrictions.map((restriction, index) => (
                            <Grid item xs={12} key={index}>
                              <Paper variant="outlined" sx={{ p: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={5}>
                                    <TextField
                                      fullWidth
                                      type="time"
                                      label="From"
                                      value={restriction.startTime}
                                      onChange={(e) =>
                                        updateTimeRestriction(type.typeId, index, 'startTime', e.target.value)
                                      }
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </Grid>
                                  <Grid item xs={5}>
                                    <TextField
                                      fullWidth
                                      type="time"
                                      label="To"
                                      value={restriction.endTime}
                                      onChange={(e) =>
                                        updateTimeRestriction(type.typeId, index, 'endTime', e.target.value)
                                      }
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <IconButton
                                      color="error"
                                      onClick={() => removeTimeRestriction(type.typeId, index)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Step 3: Generate */}
        {step === 3 && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ready to Generate Slots!
              </Typography>
              <Typography variant="body2">
                Review your settings and choose how many days of slots to generate.
              </Typography>
            </Alert>

            {/* Summary */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Summary of Settings:
              </Typography>
              <Grid container spacing={2}>
                {typeSettings.map((type) => (
                  <Grid item xs={12} key={type.typeId}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={type.name}
                          size="small"
                          sx={{ bgcolor: type.color, color: 'white' }}
                        />
                        <Typography variant="body2">
                          {type.duration} min + {type.bufferBefore} min before + {type.bufferAfter} min after
                        </Typography>
                      </Box>
                      {type.timeRestrictions.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Time restrictions: {type.timeRestrictions.map(tr => `${tr.startTime}-${tr.endTime}`).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Days Selection */}
            <FormControl fullWidth>
              <InputLabel>Generate Slots For</InputLabel>
              <Select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                label="Generate Slots For"
              >
                <MenuItem value={1}>Today Only</MenuItem>
                <MenuItem value={7}>Next 7 Days</MenuItem>
                <MenuItem value={14}>Next 2 Weeks</MenuItem>
                <MenuItem value={30}>Next 30 Days (1 Month)</MenuItem>
                <MenuItem value={90}>Next 90 Days (3 Months)</MenuItem>
                <MenuItem value={365}>Next 365 Days (1 Year)</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="caption">
                This will generate approximately {Math.round((days * 8 * typeSettings.length) / (typeSettings.reduce((sum, t) => sum + t.duration + t.bufferBefore + t.bufferAfter, 0) / typeSettings.length / 60))} slots total.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Skip for Now
        </Button>
        <Box sx={{ flex: 1 }} />
        {step > 1 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleGenerateSlots}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CalendarIcon />}
          >
            {loading ? 'Generating...' : 'Generate Slots'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FirstTimeSlotSetup;