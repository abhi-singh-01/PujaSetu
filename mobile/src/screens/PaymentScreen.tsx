import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { createPaymentOrder, verifyPayment } from '../api/bookingApi';
import type { Booking } from '../types';

interface Props {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
  route: { params: { booking: Booking } };
}

export default function PaymentScreen({ navigation, route }: Props) {
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(booking.payment?.advancePaid);

  const payAdvance = async () => {
    setLoading(true);
    try {
      const { data } = await createPaymentOrder(booking._id, 'advance');
      if (data.mock) {
        await verifyPayment({
          bookingId: booking._id,
          paymentType: 'advance',
          paymentId: `pay_mock_${Date.now()}`,
          orderId: data.order.id,
        });
        setPaid(true);
        Alert.alert('Success', 'Advance payment completed (mock mode)');
      } else {
        Alert.alert(
          'Razorpay',
          'Integrate react-native-razorpay with order details from API response',
          [{ text: 'Simulate Success', onPress: simulatePay }]
        );
      }
    } catch (e: unknown) {
      Alert.alert('Payment failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const simulatePay = async () => {
    await verifyPayment({
      bookingId: booking._id,
      paymentType: 'advance',
      paymentId: `pay_mock_${Date.now()}`,
      orderId: `order_mock_${Date.now()}`,
    });
    setPaid(true);
    Alert.alert('Success', 'Payment verified');
  };

  return (
    <View className="flex-1 bg-cream">
      <Header title="Payment" onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4 py-4">
        <Card>
          <Text className="text-gray-500">Total Amount</Text>
          <Text className="text-2xl font-bold text-gray-900">₹{booking.amount}</Text>
          <View className="border-t border-orange-100 my-3" />
          <Text className="text-gray-600">
            Advance ({booking.advancePercent ?? 15}%): ₹{booking.advanceAmount}
          </Text>
          <Text className="text-gray-600 mt-1">Remaining (85%): ₹{booking.remainingAmount}</Text>
        </Card>

        {paid ? (
          <Card className="mt-4 bg-green-50">
            <Text className="text-green-700 font-bold">✓ Advance Paid</Text>
            <Text className="text-gray-600 mt-2">Receipt: {booking.payment?.receiptNumber || 'Generated on payment'}</Text>
            <Button
              title="View Bookings"
              onPress={() => navigation.navigate('BookingHistory')}
              className="mt-4"
            />
          </Card>
        ) : (
          <Button title="Pay Advance via Razorpay" onPress={payAdvance} loading={loading} className="mt-6" />
        )}

        <Text className="text-gray-400 text-xs text-center mt-6 px-4">
          Pay 15% now to confirm booking. Remaining 85% is paid after OTP verification with your
          provider when service is complete.
        </Text>
      </ScrollView>
    </View>
  );
}
