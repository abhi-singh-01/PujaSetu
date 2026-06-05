import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

function resolveApiBaseUrl(): string {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return url.replace(/localhost|127\.0\.0\.1/g, '10.0.2.2');
  }

  if (
    Platform.OS !== 'web' &&
    Constants.isDevice &&
    (url.includes('localhost') || url.includes('127.0.0.1'))
  ) {
    const debuggerHost =
      Constants.expoGoConfig?.debuggerHost ??
      Constants.expoConfig?.hostUri ??
      Constants.manifest2?.extra?.expoClient?.hostUri;
    const host = debuggerHost?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return url.replace(/localhost|127\.0\.0\.1/g, host);
    }
  }

  return url;
}

// Android emulator: 10.0.2.2 | iOS simulator: localhost | Physical device: auto LAN IP in Expo Go
export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
