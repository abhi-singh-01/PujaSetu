import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import Header from '../components/Header';
import ProviderCard from '../components/ProviderCard';
import LoadingScreen from '../components/LoadingScreen';
import Input from '../components/Input';
import { searchProviders } from '../api/providerApi';
import { useAppSelector } from '../hooks/useAppDispatch';
import type { Provider } from '../types';

interface Props {
  navigation: { navigate: (screen: string, params: object) => void; goBack: () => void };
  route: { params?: { nearby?: boolean } };
}

export default function ProviderListScreen({ navigation, route }: Props) {
  const { selected, providerType, selectedService } = useAppSelector((s) => s.location);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxCharge, setMaxCharge] = useState('');
  const [minRating, setMinRating] = useState('');

  const fetchProviders = async (coords?: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        providerType: providerType || 'pandit',
        verified: true,
      };
      if (selected.state) params.state = selected.state;
      if (selected.district) params.district = selected.district;
      if (selectedService) params.service = selectedService;
      if (maxCharge) params.maxHourlyCharge = parseInt(maxCharge, 10);
      if (minRating) params.minRating = parseFloat(minRating);
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        params.radiusKm = 50;
      }
      const { data } = await searchProviders(params);
      setProviders(data.providers);
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (route.params?.nearby || selected.coordinates) {
        let coords = selected.coordinates;
        if (!coords) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          }
        }
        await fetchProviders(coords);
      } else {
        await fetchProviders();
      }
    };
    load();
  }, []);

  return (
    <View className="flex-1 bg-cream">
      <Header
        title="Providers"
        subtitle={selectedService || 'All services'}
        onBack={() => navigation.goBack()}
      />
      <View className="px-4 py-2">
        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Input
              placeholder="Max ₹/hr"
              keyboardType="numeric"
              value={maxCharge}
              onChangeText={setMaxCharge}
              className="mb-0 py-2"
            />
          </View>
          <View className="flex-1">
            <Input
              placeholder="Min rating"
              keyboardType="decimal-pad"
              value={minRating}
              onChangeText={setMinRating}
              className="mb-0 py-2"
            />
          </View>
        </View>
        <Text
          className="text-saffron-600 font-semibold text-center py-2"
          onPress={() => fetchProviders(selected.coordinates)}
        >
          Apply Filters
        </Text>
      </View>
      {loading ? (
        <LoadingScreen message="Finding providers..." />
      ) : (
        <ScrollView className="flex-1 px-4">
          {providers.length === 0 ? (
            <Text className="text-center text-gray-500 mt-10">No providers found. Try another location.</Text>
          ) : (
            providers.map((p) => (
              <ProviderCard
                key={p._id}
                provider={p}
                onPress={() => navigation.navigate('ProviderProfile', { providerId: p._id })}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
