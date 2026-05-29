import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../components/Header';
import Card from '../components/Card';
import LoadingScreen from '../components/LoadingScreen';
import { getMyBookings } from '../api/bookingApi';
import type { Booking } from '../types';
import type { RootStackParamList } from '../navigation/types';

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'text-orange-600',
  confirmed: 'text-green-600',
  in_progress: 'text-blue-600',
  awaiting_otp_verification: 'text-orange-600',
  ready_for_remaining_payment: 'text-saffron-600',
  completed: 'text-blue-600',
  cancelled: 'text-red-600',
};

export default function BookingHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data.bookings);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-cream">
      <Header title="My Bookings" />
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
      >
        {bookings.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">No bookings yet</Text>
        ) : (
          bookings.map((b) => (
            <Card key={b._id} className="mb-3">
              <Text className="font-bold text-gray-900">{b.eventType}</Text>
              <Text className="text-gray-500 text-sm mt-1">
                {new Date(b.scheduledDate).toLocaleDateString('en-IN')} at {b.startTime}
              </Text>
              <Text
                className={`font-semibold mt-2 capitalize ${STATUS_COLORS[b.status] || 'text-gray-600'}`}
              >
                {b.status.replace(/_/g, ' ')}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                Paid: ₹{b.payment?.advancePaid ? b.advanceAmount : 0} / ₹{b.amount}
              </Text>
              {b.provider && (
                <Text className="text-gray-500 text-sm mt-1">
                  Provider: {(b.provider as { fullName?: string }).fullName}
                </Text>
              )}
              {b.payment?.advancePaid && !b.payment?.remainingPaid && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('RemainingPayment', { booking: b })}
                  className="mt-3 bg-saffron-500 py-2.5 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold">
                    {b.status === 'awaiting_otp_verification'
                      ? 'Verify OTP & Pay Remaining'
                      : 'Pay Remaining 85%'}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
