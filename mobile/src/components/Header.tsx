import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function Header({ title, subtitle, onBack, rightAction }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="bg-saffron-500 px-4 pb-4 rounded-b-3xl"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {onBack && (
            <TouchableOpacity onPress={onBack} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{title}</Text>
            {subtitle && <Text className="text-orange-100 text-sm mt-0.5">{subtitle}</Text>}
          </View>
        </View>
        {rightAction}
      </View>
    </View>
  );
}
