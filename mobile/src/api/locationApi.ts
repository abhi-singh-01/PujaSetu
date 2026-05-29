import api from './client';

export const getStates = () => api.get('/locations/states');

export const getDistricts = (stateCode: string) =>
  api.get(`/locations/states/${encodeURIComponent(stateCode)}/districts`);

export const getCities = (stateCode: string, districtName: string) =>
  api.get(
    `/locations/states/${encodeURIComponent(stateCode)}/districts/${encodeURIComponent(districtName)}/cities`
  );

export const getAllLocations = () => api.get('/locations/all');
