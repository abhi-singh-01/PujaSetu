import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-cream">
      <ActivityIndicator size="large" color={colors.saffron} />
      <Text className="text-gray-500 mt-4">{message}</Text>
    </View>
  );
}
