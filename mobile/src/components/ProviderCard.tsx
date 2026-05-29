import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import VerifiedBadge from './VerifiedBadge';
import type { Provider } from '../types';

interface ProviderCardProps {
  provider: Provider;
  onPress: () => void;
}

export default function ProviderCard({ provider, onPress }: ProviderCardProps) {
  const roleLabel = provider.providerType === 'pandit' ? 'Pandit' : 'Nau';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card className="mb-3 flex-row">
        <Image
          source={{
            uri:
              provider.profilePhoto ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.fullName)}&background=FF8C00&color=fff`,
          }}
          className="w-20 h-20 rounded-xl bg-orange-100"
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-gray-900 text-base flex-1" numberOfLines={1}>
              {provider.fullName}
            </Text>
            {provider.isVerified && <VerifiedBadge small />}
          </View>
          <Text className="text-saffron-600 text-sm font-medium">{roleLabel}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={14} color="#FF8C00" />
            <Text className="text-gray-700 text-sm ml-1">
              {provider.rating.toFixed(1)} ({provider.reviewCount})
            </Text>
            <Text className="text-gray-400 mx-2">•</Text>
            <Text className="text-gray-500 text-sm">{provider.experienceYears} yrs</Text>
          </View>
          <Text className="text-gray-500 text-sm mt-1">
            {provider.location.district}, {provider.location.state}
          </Text>
          <Text className="text-saffron-600 font-bold mt-1">
            ₹{provider.charges.hourly}/hr • ₹{provider.charges.fullDay}/day
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
