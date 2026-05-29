import api from './client';

export const getProviderReviews = (providerId: string) =>
  api.get(`/reviews/provider/${providerId}`);

export const createReview = (data: {
  bookingId: string;
  rating: number;
  comment?: string;
}) => api.post('/reviews', data);

export const reportReview = (id: string, reason: string) =>
  api.post(`/reviews/${id}/report`, { reason });
