import api from './client';

export const createBooking = (data: Record<string, unknown>) =>
  api.post('/bookings', data);

export const getMyBookings = () => api.get('/bookings');

export const getBooking = (id: string) => api.get(`/bookings/${id}`);

export const createPaymentOrder = (id: string, paymentType: 'advance' | 'remaining') =>
  api.post(`/bookings/${id}/payment/order`, { paymentType });

export const verifyPayment = (data: Record<string, unknown>) =>
  api.post('/bookings/payment/verify', data);

export const markServiceComplete = (id: string) =>
  api.post(`/bookings/${id}/mark-service-complete`);

export const verifyCompletionOtp = (
  id: string,
  data: { otp: string; role: 'customer' | 'provider' }
) => api.post(`/bookings/${id}/verify-completion-otp`, data);

export const getCompletionOtpStatus = (id: string) =>
  api.get(`/bookings/${id}/completion-otp/status`);
