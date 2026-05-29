import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import VerifiedBadge from '../components/VerifiedBadge';
import LoadingScreen from '../components/LoadingScreen';
import { getProvider } from '../api/providerApi';
import { getProviderReviews } from '../api/reviewApi';
import type { Provider } from '../types';
import { colors } from '../theme/colors';

interface Props {
  navigation: { navigate: (screen: string, params: object) => void; goBack: () => void };
  route: { params: { providerId: string } };
}

export default function ProviderProfileScreen({ navigation, route }: Props) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Array<{ rating: number; comment?: string; customer?: { name: string } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProvider(route.params.providerId),
      getProviderReviews(route.params.providerId),
    ])
      .then(([pRes, rRes]) => {
        setProvider(pRes.data.provider);
        setReviews(rRes.data.reviews);
      })
      .catch((e: Error) => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [route.params.providerId]);

  if (loading || !provider) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-cream">
      <Header title={provider.fullName} onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4">
        <Card className="items-center mt-2">
          <Image
            source={{
              uri:
                provider.profilePhoto ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.fullName)}&background=FF8C00&color=fff&size=128`,
            }}
            className="w-28 h-28 rounded-full mb-3"
          />
          {provider.isVerified && <VerifiedBadge />}
          <Text className="text-gray-500 capitalize mt-2">{provider.providerType}</Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="star" color={colors.saffron} size={18} />
            <Text className="ml-1 font-bold">
              {provider.rating} ({provider.reviewCount} reviews)
            </Text>
          </View>
          <Text className="text-gray-600 mt-2 text-center">{provider.bio}</Text>
        </Card>

        <Text className="font-bold text-gray-900 mt-4 mb-2">Services</Text>
        <View className="flex-row flex-wrap">
          {provider.services.map((s) => (
            <View key={s} className="bg-saffron-50 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-saffron-700 text-sm">{s}</Text>
            </View>
          ))}
        </View>

        <Text className="font-bold text-gray-900 mt-4 mb-2">Charges</Text>
        <Card>
          <Text>Hourly: ₹{provider.charges.hourly}</Text>
          <Text className="mt-1">Half Day: ₹{provider.charges.halfDay}</Text>
          <Text className="mt-1">Full Day: ₹{provider.charges.fullDay}</Text>
          <Text className="mt-1">Multi Day: ₹{provider.charges.multiDay}/day</Text>
        </Card>

        <Text className="font-bold text-gray-900 mt-4 mb-2">Reviews</Text>
        {reviews.slice(0, 3).map((r, i) => (
          <Card key={i} className="mb-2">
            <Text className="font-semibold">{r.customer?.name || 'Customer'}</Text>
            <Text className="text-saffron-500">{'★'.repeat(r.rating)}</Text>
            {r.comment && <Text className="text-gray-600 mt-1">{r.comment}</Text>}
          </Card>
        ))}

        <Button
          title="Book Now"
          onPress={() => navigation.navigate('Booking', { provider })}
          className="my-6"
        />
      </ScrollView>
    </View>
  );
}
