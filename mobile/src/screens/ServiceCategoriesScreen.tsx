import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/Header';
import ServiceCategoryCard from '../components/ServiceCategoryCard';
import { PANDIT_SERVICES, NAU_SERVICES } from '../constants/services';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setProviderType, setSelectedService } from '../store/locationSlice';

interface Props {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
  route: { params?: { type?: 'pandit' | 'nau' } };
}

export default function ServiceCategoriesScreen({ navigation, route }: Props) {
  const type = route.params?.type || 'pandit';
  const dispatch = useAppDispatch();
  const services = type === 'pandit' ? PANDIT_SERVICES : NAU_SERVICES;

  useEffect(() => {
    dispatch(setProviderType(type));
  }, [type, dispatch]);

  return (
    <View className="flex-1 bg-cream">
      <Header
        title={type === 'pandit' ? 'Pandit Services' : 'Nau Services'}
        subtitle="Choose a ceremony type"
        onBack={() => navigation.goBack()}
      />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row flex-wrap justify-between">
          {services.map((s) => (
            <ServiceCategoryCard
              key={s.id}
              label={s.label}
              icon={s.icon}
              onPress={() => {
                dispatch(setSelectedService(s.label));
                navigation.navigate('ProviderList');
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
