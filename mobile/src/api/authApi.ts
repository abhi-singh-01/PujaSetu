import api from './client';

export const sendOtp = (mobile: string) =>
  api.post('/auth/send-otp', { mobile });

export const verifyOtp = (data: {
  mobile: string;
  otp: string;
  name?: string;
  role?: string;
}) => api.post('/auth/verify-otp', data);

export const getMe = () => api.get('/auth/me');

export const updateProfile = (data: Record<string, unknown>) =>
  api.put('/auth/profile', data);
