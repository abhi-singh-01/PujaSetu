import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../hooks/useAppDispatch';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAppSelector((s) => s.auth);
  const { selected } = useAppSelector((s) => s.location);

  return (
    <View className="flex-1 bg-cream">
      <Header
        title={`Namaste, ${user?.name?.split(' ')[0] || 'Guest'} 🙏`}
        subtitle="Book sacred services with trust"
      />
      <ScrollView className="flex-1 px-4 -mt-2" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LocationSelection')}
          className="bg-white rounded-2xl p-4 flex-row items-center border border-orange-100 mb-4"
        >
          <Ionicons name="location" size={22} color={colors.saffron} />
          <View className="ml-3 flex-1">
            <Text className="text-gray-500 text-xs">Your location</Text>
            <Text className="text-gray-900 font-semibold">
              {selected.city
                ? `${selected.city}, ${selected.district}`
                : selected.state || 'Select State → District → City'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-900 mb-3">Book Services</Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            className="w-[48%] mb-3"
            onPress={() => navigation.navigate('ServiceCategories', { type: 'pandit' })}
            activeOpacity={0.85}
          >
            <Card className="items-center py-6">
              <Text className="text-4xl mb-2">🕉️</Text>
              <Text className="font-bold text-gray-900">Pandit</Text>
              <Text className="text-gray-500 text-xs text-center mt-1">Puja & ceremonies</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[48%] mb-3"
            onPress={() => navigation.navigate('ServiceCategories', { type: 'nau' })}
            activeOpacity={0.85}
          >
            <Card className="items-center py-6">
              <Text className="text-4xl mb-2">✂️</Text>
              <Text className="font-bold text-gray-900">Nau</Text>
              <Text className="text-gray-500 text-xs text-center mt-1">Mundan & grooming</Text>
            </Card>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
        {[
          { label: 'Find Nearby', icon: 'navigate', screen: 'ProviderList', params: { nearby: true } },
          { label: 'My Bookings', icon: 'calendar', screen: 'BookingHistory' },
          { label: 'Become a Provider', icon: 'person-add', screen: 'ProviderRegister' },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            onPress={() => navigation.navigate(action.screen, action.params)}
            className="bg-white rounded-xl p-4 flex-row items-center mb-2 border border-orange-50"
          >
            <View className="w-10 h-10 rounded-full bg-saffron-50 items-center justify-center">
              <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.saffron} />
            </View>
            <Text className="ml-3 font-semibold text-gray-800 flex-1">{action.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
