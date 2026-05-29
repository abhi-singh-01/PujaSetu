import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { logout } from '../store/authSlice';
import { colors } from '../theme/colors';

interface Props {
  navigation: { navigate: (screen: string) => void };
}

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const menuItems = [
    { label: 'Edit Location', icon: 'location', screen: 'LocationSelection' },
    { label: 'Booking History', icon: 'calendar', screen: 'BookingHistory' },
    ...(user?.role === 'pandit' || user?.role === 'nau'
      ? [{ label: 'Provider Dashboard', icon: 'briefcase', screen: 'ProviderDashboard' }]
      : [{ label: 'Become a Provider', icon: 'person-add', screen: 'ProviderRegister' }]),
    ...(user?.role === 'admin'
      ? [{ label: 'Admin Dashboard', icon: 'shield', screen: 'AdminDashboard' }]
      : []),
  ];

  return (
    <View className="flex-1 bg-cream">
      <Header title="Profile" />
      <ScrollView className="flex-1 px-4">
        <Card className="items-center mt-4 py-6">
          <View className="w-20 h-20 rounded-full bg-saffron-100 items-center justify-center mb-3">
            <Text className="text-3xl">🙏</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{user?.name}</Text>
          <Text className="text-gray-500">+91 {user?.mobile}</Text>
          <Text className="text-saffron-600 capitalize font-medium mt-1">{user?.role}</Text>
        </Card>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => navigation.navigate(item.screen)}
            className="bg-white flex-row items-center p-4 rounded-xl mt-2 border border-orange-50"
          >
            <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.saffron} />
            <Text className="ml-3 flex-1 font-medium text-gray-800">{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        <Button
          title="Logout"
          variant="outline"
          onPress={() => {
            Alert.alert('Logout', 'Are you sure?', [
              { text: 'Cancel' },
              { text: 'Logout', onPress: () => dispatch(logout()) },
            ]);
          }}
          className="mt-8 mb-10"
        />
      </ScrollView>
    </View>
  );
}
