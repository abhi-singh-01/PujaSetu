import api from './client';

export const getDashboardStats = () => api.get('/admin/dashboard');

export const getAllUsers = () => api.get('/admin/users');

export const getAllBookings = () => api.get('/admin/bookings');

export const toggleUserActive = (id: string) =>
  api.patch(`/admin/users/${id}/toggle`);
