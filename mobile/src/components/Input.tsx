import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps & { className?: string }) {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 font-medium mb-1.5">{label}</Text>}
      <TextInput
        className={`bg-white border rounded-xl px-4 py-3.5 text-base text-gray-900 ${error ? 'border-red-400' : 'border-orange-100'} ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
