export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  AUTH_GOOGLE_URL: 'auth/google/url',
  AUTH_GOOGLE_CALLBACK: 'auth/google/callback',
  AUTH_CURRENT_USER: 'auth/current-user',
  AUTH_LOGOUT: 'auth/logout',

  // Availability
  AVAILABILITY_INITIALIZE: 'availability/initialize',
  AVAILABILITY_GET: 'availability',
  AVAILABILITY_STANDARD: 'availability/standard',
  AVAILABILITY_TYPES: 'availability/appointment-types',
  AVAILABILITY_RULES: 'availability/rules',
  AVAILABILITY_BLOCKED_SLOTS: 'availability/blocked-slots',
  AVAILABILITY_DOCTORS: 'availability/doctors',

  // Calendar
  CALENDAR_SYNC: 'calendar/sync',
  CALENDAR_GENERATE_SLOTS: 'calendar/generate-slots',
  CALENDAR_SLOTS: 'calendar/slots',
  CALENDAR_SLOTS_BOOK: 'calendar/slots/book',
  CALENDAR_APPOINTMENT_CANCEL: 'calendar/appointments/:id/cancel',
  CALENDAR_APPOINTMENT_RESCHEDULE: 'calendar/appointments/:id/reschedule',

  // Appointments
  APPOINTMENTS: 'appointments',
  APPOINTMENT_BY_ID: 'appointments/:id',
  APPOINTMENT_STATUS: 'appointments/:id/status',

  // Users
  USERS_DOCTORS: 'users/doctors',
  USER_BY_ID: 'users/:id',
};