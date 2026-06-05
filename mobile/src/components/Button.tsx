import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
} from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  title,
  variant = 'primary',
  loading,
  size = 'md',
  disabled,
  className = '',
  ...props
}: ButtonProps & { className?: string }) {
  const base = 'rounded-xl items-center justify-center flex-row cursor-pointer';
  const sizes = { sm: 'py-2 px-4', md: 'py-3.5 px-6', lg: 'py-4 px-8' };
  const variants = {
    primary: 'bg-saffron-500',
    outline: 'border-2 border-saffron-500 bg-transparent',
    ghost: 'bg-saffron-50',
  };
  const textVariants = {
    primary: 'text-white font-bold',
    outline: 'text-saffron-600 font-bold',
    ghost: 'text-saffron-700 font-semibold',
  };

  return (
    <Pressable
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || loading}
      accessibilityRole="button"
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#FF8C00'} />
      ) : (
        <Text className={`${textVariants[variant]} text-base`}>{title}</Text>
      )}
    </Pressable>
  );
}
