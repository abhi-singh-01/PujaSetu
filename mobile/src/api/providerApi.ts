import api from './client';

export const searchProviders = (params: Record<string, string | number | boolean>) =>
  api.get('/providers/search', { params });

export const getProvider = (id: string) => api.get(`/providers/${id}`);

export const registerProvider = (data: Record<string, unknown>) =>
  api.post('/providers/register', data);

export const getMyProviderProfile = () => api.get('/providers/profile/me');

export const updateProvider = (data: Record<string, unknown>) =>
  api.put('/providers/profile/me', data);

export const updateAvailability = (availability: unknown[]) =>
  api.put('/providers/availability', { availability });

export const getPricing = () => api.get('/providers/profile/me/pricing');

export const updatePricing = (data: {
  charges?: { hourly?: number; halfDay?: number; fullDay?: number; multiDay?: number };
  servicePricing?: Array<{
    serviceName: string;
    hourly?: number;
    halfDay?: number;
    fullDay?: number;
    multiDay?: number;
  }>;
}) => api.put('/providers/profile/me/pricing', data);

export const listPendingProviders = () => api.get('/providers/admin/pending');

export const verifyProvider = (id: string, data: { status: string; rejectionReason?: string }) =>
  api.put(`/providers/admin/${id}/verify`, data);
