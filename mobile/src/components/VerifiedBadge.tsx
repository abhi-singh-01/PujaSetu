import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <View className={`flex-row items-center bg-green-50 rounded-full ${small ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
      <Ionicons name="checkmark-circle" size={small ? 12 : 14} color="#16A34A" />
      <Text className={`text-green-700 font-semibold ml-0.5 ${small ? 'text-xs' : 'text-xs'}`}>
        Verified
      </Text>
    </View>
  );
}
