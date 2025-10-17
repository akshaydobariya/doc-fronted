import api from './api';

export const calendarService = {
  syncCalendar: async () => {
    const { data } = await api.post('calendar/sync');
    return data;
  },

  generateSlots: async (startDate, endDate, appointmentTypeId, includeWeekends = false) => {
    const { data } = await api.post('calendar/generate-slots', {
      startDate,
      endDate,
      appointmentTypeId,
      includeWeekends,
    });
    return data;
  },

  createSlot: async (startTime, endTime, type) => {
    const { data } = await api.post('calendar/slots', { startTime, endTime, type });
    return data;
  },

  getAvailableSlots: async (doctorId, startDate, endDate, appointmentType) => {
    const params = { doctorId, startDate, endDate };
    if (appointmentType) params.appointmentType = appointmentType;
    const { data } = await api.get('calendar/slots', { params });
    return data;
  },

  bookSlot: async (slotId, bookingData) => {
    const { data } = await api.post('calendar/slots/book', {
      slotId,
      ...bookingData,
    });
    return data;
  },

  cancelAppointment: async (appointmentId, cancellationReason) => {
    const { data } = await api.post(`calendar/appointments/${appointmentId}/cancel`, {
      cancellationReason,
    });
    return data;
  },

  rescheduleAppointment: async (appointmentId, newSlotId) => {
    const { data } = await api.post(`calendar/appointments/${appointmentId}/reschedule`, {
      newSlotId,
    });
    return data;
  },

  clearAllCalendarEvents: async () => {
    const { data } = await api.delete('calendar/clear-all');
    return data;
  },

  checkTodaySlots: async () => {
    const { data } = await api.get('calendar/check-today-slots');
    return data;
  },
};

export default calendarService;