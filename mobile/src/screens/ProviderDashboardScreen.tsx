import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingScreen from '../components/LoadingScreen';
import { getMyProviderProfile } from '../api/providerApi';
import { getMyBookings, markServiceComplete } from '../api/bookingApi';
import type { Provider, Booking } from '../types';
import type { RootStackParamList } from '../navigation/types';

export default function ProviderDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([getMyProviderProfile(), getMyBookings()])
      .then(([p, b]) => {
        setProvider(p.data.provider);
        setBookings(b.data.bookings);
      })
      .catch((e: Error) => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkComplete = async (bookingId: string) => {
    try {
      const { data } = await markServiceComplete(bookingId);
      Alert.alert(
        'OTP Generated',
        `Share this OTP with customer: ${data.otpForProvider}\n\nBoth must verify before remaining payment.`,
        [
          {
            text: 'Verify OTP Now',
            onPress: () => {
              const b = bookings.find((x) => x._id === bookingId);
              if (b) navigation.navigate('RemainingPayment', { booking: b });
            },
          },
          { text: 'OK' },
        ]
      );
      load();
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!provider) {
    return (
      <View className="flex-1 bg-cream items-center justify-center px-6">
        <Text className="text-gray-600 text-center">Complete provider registration to access dashboard</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <Header title="Provider Dashboard" subtitle={provider.fullName} />
      <ScrollView className="flex-1 px-4 py-4">
        <Card>
          <Text className="text-gray-500">Status</Text>
          <Text className="font-bold text-lg capitalize text-saffron-600">
            {provider.verificationStatus}
          </Text>
          {provider.isVerified && <Text className="text-green-600 mt-1">✓ Verified Provider</Text>}
        </Card>

        <Button
          title="Set My Prices"
          onPress={() => navigation.navigate('ProviderPricing')}
          className="mt-4"
        />

        <View className="flex-row mt-4">
          <Card className="flex-1 mr-2 items-center">
            <Text className="text-2xl font-bold text-saffron-600">{provider.rating}</Text>
            <Text className="text-gray-500 text-sm">Rating</Text>
          </Card>
          <Card className="flex-1 items-center">
            <Text className="text-2xl font-bold text-saffron-600">{bookings.length}</Text>
            <Text className="text-gray-500 text-sm">Bookings</Text>
          </Card>
        </View>

        <Text className="font-bold text-gray-900 mt-6 mb-2">Bookings</Text>
        {bookings.slice(0, 10).map((b) => (
          <Card key={b._id} className="mb-2">
            <Text className="font-semibold">{b.eventType}</Text>
            <Text className="text-gray-500 text-sm">
              {new Date(b.scheduledDate).toLocaleDateString('en-IN')} • {b.status.replace(/_/g, ' ')}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              Advance: ₹{b.advanceAmount} • Remaining: ₹{b.remainingAmount}
            </Text>
            {b.payment?.advancePaid && !b.payment?.remainingPaid && (
              <View className="flex-row mt-2">
                <TouchableOpacity
                  onPress={() => handleMarkComplete(b._id)}
                  className="flex-1 bg-saffron-500 py-2 rounded-lg items-center mr-2"
                >
                  <Text className="text-white font-semibold text-sm">Complete & Generate OTP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RemainingPayment', { booking: b })}
                  className="flex-1 border border-saffron-500 py-2 rounded-lg items-center ml-1"
                >
                  <Text className="text-saffron-600 font-semibold text-sm">Verify OTP</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
