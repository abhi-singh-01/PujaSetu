import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import Header from '../components/Header';
import Button from '../components/Button';
import LoadingScreen from '../components/LoadingScreen';
import { getStates, getDistricts, getCities } from '../api/locationApi';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setLocation } from '../store/locationSlice';
import type { District, LocationState } from '../types';

interface Props {
  navigation: { goBack: () => void };
}

export default function LocationSelectionScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<LocationState[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<LocationState | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [step, setStep] = useState<'state' | 'district' | 'city'>('state');

  useEffect(() => {
    getStates()
      .then((res) => setStates(res.data.states))
      .catch(() => Alert.alert('Error', 'Failed to load states'))
      .finally(() => setLoading(false));
  }, []);

  const selectState = async (state: LocationState) => {
    setSelectedState(state);
    setLoading(true);
    try {
      const res = await getDistricts(state.code || state.name);
      setDistricts(res.data.districts);
      setStep('district');
    } catch {
      Alert.alert('Error', 'Failed to load districts');
    } finally {
      setLoading(false);
    }
  };

  const selectDistrict = async (district: District) => {
    setSelectedDistrict(district);
    setLoading(true);
    try {
      const res = await getCities(
        selectedState!.code || selectedState!.name,
        district.name
      );
      setCities(res.data.cities || []);
      setStep('city');
    } catch {
      Alert.alert('Error', 'Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const useGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location permission is required');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    dispatch(
      setLocation({
        coordinates: { lat: loc.coords.latitude, lng: loc.coords.longitude },
      })
    );
    navigation.goBack();
  };

  const confirmCity = (city: string) => {
    dispatch(
      setLocation({
        state: selectedState!.name,
        stateCode: selectedState!.code,
        district: selectedDistrict!.name,
        city,
      })
    );
    navigation.goBack();
  };

  if (loading && states.length === 0) return <LoadingScreen />;

  const items =
    step === 'state'
      ? states.map((s) => ({ key: s.code, label: s.name, onPress: () => selectState(s) }))
      : step === 'district'
        ? districts.map((d) => ({ key: d.code, label: d.name, onPress: () => selectDistrict(d) }))
        : cities.map((c) => ({ key: c, label: c, onPress: () => confirmCity(c) }));

  return (
    <View className="flex-1 bg-cream">
      <Header
        title="Select Location"
        subtitle={step === 'state' ? 'India → State' : step === 'district' ? selectedState?.name : selectedDistrict?.name}
        onBack={() => {
          if (step === 'district') setStep('state');
          else if (step === 'city') setStep('district');
          else navigation.goBack();
        }}
      />
      <View className="px-4 py-3">
        <Button title="Use Current Location (GPS)" variant="outline" onPress={useGPS} size="sm" />
      </View>
      <ScrollView className="flex-1 px-4">
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={item.onPress}
            className="bg-white p-4 rounded-xl mb-2 border border-orange-50"
          >
            <Text className="text-gray-800 font-medium">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
