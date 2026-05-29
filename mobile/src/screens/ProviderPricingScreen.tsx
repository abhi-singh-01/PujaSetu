import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingScreen from '../components/LoadingScreen';
import { getPricing, updatePricing } from '../api/providerApi';

interface Props {
  navigation: { goBack: () => void };
}

export default function ProviderPricingScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hourly, setHourly] = useState('');
  const [halfDay, setHalfDay] = useState('');
  const [fullDay, setFullDay] = useState('');
  const [multiDay, setMultiDay] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<
    Record<string, { hourly: string; fullDay: string }>
  >({});

  useEffect(() => {
    getPricing()
      .then(({ data }) => {
        setHourly(String(data.charges?.hourly || ''));
        setHalfDay(String(data.charges?.halfDay || ''));
        setFullDay(String(data.charges?.fullDay || ''));
        setMultiDay(String(data.charges?.multiDay || ''));
        setServices(data.services || []);
        const map: Record<string, { hourly: string; fullDay: string }> = {};
        (data.servicePricing || []).forEach(
          (s: { serviceName: string; hourly: number; fullDay: number }) => {
            map[s.serviceName] = {
              hourly: String(s.hourly || ''),
              fullDay: String(s.fullDay || ''),
            };
          }
        );
        setServicePrices(map);
      })
      .catch((e: Error) => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updatePricing({
        charges: {
          hourly: parseInt(hourly, 10) || 0,
          halfDay: parseInt(halfDay, 10) || 0,
          fullDay: parseInt(fullDay, 10) || 0,
          multiDay: parseInt(multiDay, 10) || 0,
        },
        servicePricing: services.map((name) => ({
          serviceName: name,
          hourly: parseInt(servicePrices[name]?.hourly || hourly, 10) || 0,
          halfDay: parseInt(halfDay, 10) || 0,
          fullDay: parseInt(servicePrices[name]?.fullDay || fullDay, 10) || 0,
          multiDay: parseInt(multiDay, 10) || 0,
        })),
      });
      Alert.alert('Saved', 'Your pricing has been updated');
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-cream">
      <Header title="Set Your Prices" subtitle="Customers see your custom rates" onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4 py-4">
        <Card>
          <Text className="font-bold text-gray-900 mb-3">Base Rates (₹)</Text>
          <Input label="Hourly" keyboardType="numeric" value={hourly} onChangeText={setHourly} />
          <Input label="Half Day" keyboardType="numeric" value={halfDay} onChangeText={setHalfDay} />
          <Input label="Full Day" keyboardType="numeric" value={fullDay} onChangeText={setFullDay} />
          <Input label="Multi Day (per day)" keyboardType="numeric" value={multiDay} onChangeText={setMultiDay} />
        </Card>

        <Text className="font-bold text-gray-900 mt-4 mb-2">Per-Service Pricing</Text>
        {services.map((name) => (
          <Card key={name} className="mb-3">
            <Text className="font-semibold text-saffron-700 mb-2">{name}</Text>
            <Input
              label="Hourly override"
              keyboardType="numeric"
              value={servicePrices[name]?.hourly || ''}
              onChangeText={(v) =>
                setServicePrices((prev) => ({
                  ...prev,
                  [name]: { ...prev[name], hourly: v, fullDay: prev[name]?.fullDay || '' },
                }))
              }
            />
            <Input
              label="Full day override"
              keyboardType="numeric"
              value={servicePrices[name]?.fullDay || ''}
              onChangeText={(v) =>
                setServicePrices((prev) => ({
                  ...prev,
                  [name]: { hourly: prev[name]?.hourly || '', fullDay: v },
                }))
              }
            />
          </Card>
        ))}

        <Text className="text-gray-500 text-sm mb-4">
          Bookings require 15% advance. Remaining 85% is paid after OTP verification with the customer.
        </Text>
        <Button title="Save Pricing" onPress={save} loading={saving} className="mb-10" />
      </ScrollView>
    </View>
  );
}
