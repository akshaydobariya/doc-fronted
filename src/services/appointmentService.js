import api from './api';

export const appointmentService = {
  getAppointments: async () => {
    const { data } = await api.get('/api/appointments');
    return data;
  },

  getAppointmentById: async (id) => {
    const { data } = await api.get(`/api/appointments/${id}`);
    return data;
  },

  updateAppointmentStatus: async (id, status) => {
    const { data } = await api.patch(`/api/appointments/${id}/status`, { status });
    return data;
  },
};

export default appointmentService;