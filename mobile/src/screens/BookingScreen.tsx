import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { BOOKING_TYPES } from '../constants/services';
import { createBooking } from '../api/bookingApi';
import type { Provider } from '../types';

interface Props {
  navigation: { navigate: (screen: string, params: object) => void; goBack: () => void };
  route: { params: { provider: Provider } };
}

export default function BookingScreen({ navigation, route }: Props) {
  const { provider } = route.params;
  const [bookingType, setBookingType] = useState('full_day');
  const [eventType, setEventType] = useState(provider.services[0] || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationHours, setDurationHours] = useState('4');
  const [durationDays, setDurationDays] = useState('1');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState(provider.location.city);
  const [pincode, setPincode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!scheduledDate || !addressLine) {
      Alert.alert('Required', 'Please fill date and address');
      return;
    }
    setLoading(true);
    try {
      const { data } = await createBooking({
        providerId: provider._id,
        bookingType,
        eventType,
        scheduledDate: new Date(scheduledDate).toISOString(),
        startTime,
        durationHours: parseInt(durationHours, 10),
        durationDays: parseInt(durationDays, 10),
        address: {
          line1: addressLine,
          city,
          state: provider.location.state,
          district: provider.location.district,
          pincode,
        },
        specialInstructions: instructions,
      });
      navigation.navigate('Payment', { booking: data.booking });
    } catch (e: unknown) {
      Alert.alert('Booking failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-cream">
      <Header title="Book Service" subtitle={provider.fullName} onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4 py-4">
        <Input label="Event Type" value={eventType} onChangeText={setEventType} />
        <Input label="Date (YYYY-MM-DD)" placeholder="2026-06-15" value={scheduledDate} onChangeText={setScheduledDate} />
        <Input label="Start Time" value={startTime} onChangeText={setStartTime} />
        <Input label="Duration (hours)" keyboardType="numeric" value={durationHours} onChangeText={setDurationHours} />
        <Input label="Duration (days)" keyboardType="numeric" value={durationDays} onChangeText={setDurationDays} />
        <View className="mb-4">
          {BOOKING_TYPES.map((bt) => (
            <Button
              key={bt.id}
              title={bt.label}
              variant={bookingType === bt.id ? 'primary' : 'outline'}
              onPress={() => setBookingType(bt.id)}
              className="mb-2"
              size="sm"
            />
          ))}
        </View>
        <Input label="Address" value={addressLine} onChangeText={setAddressLine} multiline />
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="Pincode" keyboardType="numeric" value={pincode} onChangeText={setPincode} />
        <Input label="Special Instructions" value={instructions} onChangeText={setInstructions} multiline />
        <Button title="Proceed to Payment" onPress={handleBook} loading={loading} className="mb-8" />
      </ScrollView>
    </View>
  );
}
