import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  heart: 'heart',
  home: 'home',
  book: 'book',
  flame: 'flame',
  baby: 'happy',
  ribbon: 'ribbon',
  flower: 'flower',
  business: 'business',
  cut: 'cut',
  sparkles: 'sparkles',
  people: 'people',
};

interface ServiceCategoryCardProps {
  label: string;
  icon: string;
  onPress: () => void;
}

export default function ServiceCategoryCard({ label, icon, onPress }: ServiceCategoryCardProps) {
  const iconName = ICON_MAP[icon] || 'star';
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 items-center border border-orange-50 w-[47%] mb-3"
      activeOpacity={0.8}
    >
      <View className="w-12 h-12 rounded-full bg-saffron-50 items-center justify-center mb-2">
        <Ionicons name={iconName} size={24} color={colors.saffron} />
      </View>
      <Text className="text-gray-800 font-semibold text-center text-sm">{label}</Text>
    </TouchableOpacity>
  );
}
