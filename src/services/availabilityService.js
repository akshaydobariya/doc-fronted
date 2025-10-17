import api from './api';

export const availabilityService = {
  initialize: async () => {
    const { data } = await api.post('availability/initialize');
    return data;
  },

  getAvailability: async (doctorId) => {
    const params = doctorId ? { doctorId } : {};
    const { data } = await api.get('availability', { params });
    return data;
  },

  updateStandardAvailability: async (standardAvailability) => {
    const { data } = await api.put('availability/standard', { standardAvailability });
    return data;
  },

  updateAppointmentTypes: async (appointmentTypes) => {
    const { data } = await api.put('availability/appointment-types', { appointmentTypes });
    return data;
  },

  updateRules: async (rules) => {
    const { data } = await api.put('availability/rules', { rules });
    return data;
  },

  addBlockedSlot: async (blockedSlot) => {
    const { data } = await api.post('availability/blocked-slots', blockedSlot);
    return data;
  },

  removeBlockedSlot: async (slotId) => {
    const { data } = await api.delete(`availability/blocked-slots/${slotId}`);
    return data;
  },

  getAllDoctors: async () => {
    const { data } = await api.get('availability/doctors');
    return data;
  },
};

export default availabilityService;