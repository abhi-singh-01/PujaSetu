import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ONBOARDING_SLIDES } from '../constants/onboarding';
import Button from '../components/Button';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const next = () => {
    if (index < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View className="flex-1 bg-cream">
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8 pt-20">
            <View className="w-24 h-24 rounded-full bg-saffron-100 items-center justify-center mb-8">
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={48}
                color={colors.saffron}
              />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center">{item.title}</Text>
            <Text className="text-gray-500 text-center mt-4 text-base leading-6">
              {item.description}
            </Text>
          </View>
        )}
      />
      <View className="flex-row justify-center mb-4">
        {ONBOARDING_SLIDES.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full mx-1 ${i === index ? 'w-6 bg-saffron-500' : 'w-2 bg-orange-200'}`}
          />
        ))}
      </View>
      <View className="px-6 pb-10">
        <Button title={index === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'} onPress={next} />
        {index < ONBOARDING_SLIDES.length - 1 && (
          <TouchableOpacity onPress={onComplete} className="mt-4 items-center">
            <Text className="text-gray-500">Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
