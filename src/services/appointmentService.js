import api from './api';

export const appointmentService = {
  getAppointments: async () => {
    const { data } = await api.get('appointments');
    return data;
  },

  getAppointmentById: async (id) => {
    const { data } = await api.get(`appointments/${id}`);
    return data;
  },

  updateAppointmentStatus: async (id, status) => {
    const { data } = await api.patch(`appointments/${id}/status`, { status });
    return data;
  },
};

export default appointmentService;