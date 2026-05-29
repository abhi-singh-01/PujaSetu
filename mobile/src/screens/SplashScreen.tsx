import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreenExpo from 'expo-splash-screen';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    SplashScreenExpo.hideAsync();
    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <LinearGradient colors={['#FF8C00', '#FFB366', '#FFFDF7']} className="flex-1">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-28 h-28 rounded-full bg-white/30 items-center justify-center mb-6">
          <Text className="text-6xl">🪔</Text>
        </View>
        <Text className="text-white text-4xl font-bold tracking-wide">PujaSetu</Text>
        <Text className="text-orange-50 text-center mt-3 text-lg">
          Book Verified Pandits & Naus Across India
        </Text>
      </View>
    </LinearGradient>
  );
}
