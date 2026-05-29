import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingScreen from '../components/LoadingScreen';
import {
  getCompletionOtpStatus,
  verifyCompletionOtp,
  createPaymentOrder,
  verifyPayment,
} from '../api/bookingApi';
import type { Booking } from '../types';
import { useAppSelector } from '../hooks/useAppDispatch';

interface Props {
  navigation: { goBack: () => void };
  route: { params: { booking: Booking } };
}

export default function RemainingPaymentScreen({ navigation, route }: Props) {
  const { booking: initial } = route.params;
  const { user } = useAppSelector((s) => s.auth);
  const isProvider = user?.role === 'pandit' || user?.role === 'nau';

  const [booking, setBooking] = useState(initial);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    customerVerified?: boolean;
    providerVerified?: boolean;
    remainingPaymentUnlocked?: boolean;
    code?: string;
  }>({});

  const refresh = async () => {
    const { data } = await getCompletionOtpStatus(booking._id);
    setStatus({
      customerVerified: data.completionOtp?.customerVerified,
      providerVerified: data.completionOtp?.providerVerified,
      remainingPaymentUnlocked: data.remainingPaymentUnlocked,
      code: data.completionOtp?.code,
    });
    if (data.booking) setBooking(data.booking);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const verifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert('OTP required', 'Enter the 6-digit OTP shared with your service provider');
      return;
    }
    setLoading(true);
    try {
      const role = isProvider ? 'provider' : 'customer';
      const { data } = await verifyCompletionOtp(booking._id, { otp, role });
      Alert.alert('Verified', data.message);
      await refresh();
    } catch (e: unknown) {
      Alert.alert('Verification failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const payRemaining = async () => {
    setLoading(true);
    try {
      const { data } = await createPaymentOrder(booking._id, 'remaining');
      if (data.mock) {
        await verifyPayment({
          bookingId: booking._id,
          paymentType: 'remaining',
          paymentId: `pay_mock_${Date.now()}`,
          orderId: data.order.id,
        });
        Alert.alert('Success', 'Remaining payment completed');
        navigation.goBack();
      } else {
        Alert.alert('Razorpay', 'Integrate Razorpay for remaining payment');
      }
    } catch (e: unknown) {
      Alert.alert('Payment failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const advancePercent = booking.advancePercent ?? 15;

  return (
    <View className="flex-1 bg-cream">
      <Header title="Remaining Payment" onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4 py-4">
        <Card>
          <Text className="text-gray-500">Total</Text>
          <Text className="text-xl font-bold">₹{booking.amount}</Text>
          <Text className="text-gray-600 mt-2">
            Advance paid ({advancePercent}%): ₹{booking.advanceAmount}
          </Text>
          <Text className="text-saffron-600 font-bold mt-1">
            Remaining (85%): ₹{booking.remainingAmount}
          </Text>
        </Card>

        <Card className="mt-4">
          <Text className="font-bold text-gray-900 mb-2">OTP Verification</Text>
          <Text className="text-gray-600 text-sm mb-3">
            After service, your provider shares a 6-digit OTP. Both of you must enter it to unlock
            remaining payment.
          </Text>
          <View className="flex-row justify-between mb-3">
            <Text className={status.customerVerified ? 'text-green-600' : 'text-gray-400'}>
              Customer {status.customerVerified ? '✓' : '○'}
            </Text>
            <Text className={status.providerVerified ? 'text-green-600' : 'text-gray-400'}>
              Provider {status.providerVerified ? '✓' : '○'}
            </Text>
          </View>
          {isProvider && status.code && (
            <Text className="text-saffron-700 font-bold mb-2">Your OTP: {status.code}</Text>
          )}
          <Input
            label="Completion OTP"
            placeholder="6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <Button
            title={isProvider ? 'Verify as Provider' : 'Verify as Customer'}
            onPress={verifyOtp}
            loading={loading}
            variant="outline"
          />
        </Card>

        {!isProvider && status.remainingPaymentUnlocked && !booking.payment?.remainingPaid && (
          <Button
            title={`Pay Remaining ₹${booking.remainingAmount}`}
            onPress={payRemaining}
            loading={loading}
            className="mt-4"
          />
        )}

        {booking.payment?.remainingPaid && (
          <Card className="mt-4 bg-green-50">
            <Text className="text-green-700 font-bold">✓ Fully Paid</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
