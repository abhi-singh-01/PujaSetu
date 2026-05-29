import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { loadSession, setOnboarded } from '../store/authSlice';
import LoadingScreen from '../components/LoadingScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import MainTabs from './MainTabs';
import LocationSelectionScreen from '../screens/LocationSelectionScreen';
import ServiceCategoriesScreen from '../screens/ServiceCategoriesScreen';
import ProviderListScreen from '../screens/ProviderListScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RemainingPaymentScreen from '../screens/RemainingPaymentScreen';
import ProviderPricingScreen from '../screens/ProviderPricingScreen';
import ProviderRegisterScreen from '../screens/ProviderRegisterScreen';
import type { RootStackParamList } from './types';
import { registerForPushNotifications } from '../utils/notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, hasOnboarded } = useAppSelector((s) => s.auth);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    dispatch(loadSession());
    AsyncStorage.getItem('hasOnboarded').then((v) => {
      if (v === 'true') dispatch(setOnboarded(true));
    });
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) registerForPushNotifications();
  }, [isAuthenticated]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    dispatch(setOnboarded(true));
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading PujaSetu..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <>
            {!hasOnboarded ? (
              <Stack.Screen name="Onboarding">
                {() => <OnboardingScreen onComplete={completeOnboarding} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ProviderRegister" component={ProviderRegisterScreen} />
              </>
            )}
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
            <Stack.Screen name="ServiceCategories" component={ServiceCategoriesScreen} />
            <Stack.Screen name="ProviderList" component={ProviderListScreen} />
            <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="RemainingPayment" component={RemainingPaymentScreen} />
            <Stack.Screen name="ProviderPricing" component={ProviderPricingScreen} />
            <Stack.Screen name="ProviderRegister" component={ProviderRegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
