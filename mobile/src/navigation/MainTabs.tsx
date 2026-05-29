import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import { useAppSelector } from '../hooks/useAppDispatch';
import { colors } from '../theme/colors';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const { user } = useAppSelector((s) => s.auth);
  const isProvider = user?.role === 'pandit' || user?.role === 'nau';
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.saffron,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#F3E8D8', paddingBottom: 4, height: 60 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Bookings: 'calendar',
            Profile: 'person',
            ProviderDashboard: 'briefcase',
            AdminDashboard: 'shield',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Bookings" component={BookingHistoryScreen} options={{ title: 'Bookings' }} />
      {isProvider && (
        <Tab.Screen name="ProviderDashboard" component={ProviderDashboardScreen} options={{ title: 'Dashboard' }} />
      )}
      {isAdmin && (
        <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
