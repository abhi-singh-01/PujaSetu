import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { sendOtp, loginWithOtp, clearError } from '../store/authSlice';

interface Props {
  navigation: { navigate: (screen: string) => void };
}

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      await dispatch(sendOtp(mobile)).unwrap();
      setStep('otp');
      Alert.alert('OTP Sent', 'Use 123456 in development mode');
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    dispatch(clearError());
    try {
      await dispatch(
        loginWithOtp({
          mobile,
          otp,
          ...(isNewUser && name ? { name } : {}),
        })
      ).unwrap();
    } catch (e: unknown) {
      Alert.alert('Login failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FF8C00', '#FFFDF7']} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
          <View className="items-center mb-10">
            <Text className="text-5xl mb-2">🪔</Text>
            <Text className="text-3xl font-bold text-white">PujaSetu</Text>
            <Text className="text-orange-100 mt-2 text-center">
              Book Verified Pandits & Naus Across India
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {step === 'mobile' ? 'Login / Sign up' : 'Verify OTP'}
            </Text>
            <Text className="text-gray-500 mb-6">
              {step === 'mobile'
                ? 'Enter your mobile number to continue'
                : `OTP sent to +91 ${mobile}`}
            </Text>

            {step === 'mobile' ? (
              <>
                <Input
                  label="Mobile Number"
                  placeholder="10-digit mobile"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                />
                <Button title="Send OTP" onPress={handleSendOtp} loading={loading} />
              </>
            ) : (
              <>
                {isNewUser && (
                  <Input
                    label="Your Name"
                    placeholder="Full name"
                    value={name}
                    onChangeText={setName}
                  />
                )}
                <Input
                  label="OTP"
                  placeholder="6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
                <Button title="Verify & Login" onPress={handleVerify} loading={loading} />
                <Button
                  title="Change Number"
                  variant="ghost"
                  onPress={() => setStep('mobile')}
                  className="mt-2"
                />
              </>
            )}

            {step === 'mobile' && (
              <Button
                title="New user? Tap Send OTP, then enter your name"
                variant="outline"
                onPress={() => setIsNewUser(true)}
                className="mt-3"
                size="sm"
              />
            )}

            <Button
              title="Register as Pandit / Nau (login required)"
              variant="ghost"
              onPress={() => {
                Alert.alert(
                  'Login first',
                  'Complete OTP login first. After login, register from Profile → Become a Provider.',
                  [{ text: 'OK' }]
                );
              }}
              className="mt-4"
              size="sm"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
