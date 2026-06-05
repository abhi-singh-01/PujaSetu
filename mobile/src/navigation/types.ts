import type { Provider, Booking } from '../types';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  LocationSelection: undefined;
  ServiceCategories: { type?: 'pandit' | 'nau' };
  ProviderList: { nearby?: boolean };
  ProviderProfile: { providerId: string };
  Booking: { provider: Provider };
  Payment: { booking: Booking };
  RemainingPayment: { booking: Booking };
  ProviderPricing: undefined;
  ProviderRegister: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
  ProviderDashboard: undefined;
  AdminDashboard: undefined;
};
