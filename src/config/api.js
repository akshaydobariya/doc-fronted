export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  AUTH_GOOGLE_URL: '/api/auth/google/url',
  AUTH_GOOGLE_CALLBACK: '/api/auth/google/callback',
  AUTH_CURRENT_USER: '/api/auth/current-user',
  AUTH_LOGOUT: '/api/auth/logout',

  // Availability
  AVAILABILITY_INITIALIZE: '/api/availability/initialize',
  AVAILABILITY_GET: '/api/availability',
  AVAILABILITY_STANDARD: '/api/availability/standard',
  AVAILABILITY_TYPES: '/api/availability/appointment-types',
  AVAILABILITY_RULES: '/api/availability/rules',
  AVAILABILITY_BLOCKED_SLOTS: '/api/availability/blocked-slots',
  AVAILABILITY_DOCTORS: '/api/availability/doctors',

  // Calendar
  CALENDAR_SYNC: '/api/calendar/sync',
  CALENDAR_GENERATE_SLOTS: '/api/calendar/generate-slots',
  CALENDAR_SLOTS: '/api/calendar/slots',
  CALENDAR_SLOTS_BOOK: '/api/calendar/slots/book',
  CALENDAR_APPOINTMENT_CANCEL: '/api/calendar/appointments/:id/cancel',
  CALENDAR_APPOINTMENT_RESCHEDULE: '/api/calendar/appointments/:id/reschedule',

  // Appointments
  APPOINTMENTS: '/api/appointments',
  APPOINTMENT_BY_ID: '/api/appointments/:id',
  APPOINTMENT_STATUS: '/api/appointments/:id/status',

  // Users
  USERS_DOCTORS: '/api/users/doctors',
  USER_BY_ID: '/api/users/:id',
};