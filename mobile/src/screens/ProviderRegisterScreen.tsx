import React, { useState } from 'react';
import { View, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAppSelector } from '../hooks/useAppDispatch';
import { registerProvider } from '../api/providerApi';
import { PANDIT_SERVICES, NAU_SERVICES } from '../constants/services';

interface Props {
  navigation: { goBack: () => void; navigate: (screen: string) => void };
}

export default function ProviderRegisterScreen({ navigation }: Props) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [providerType, setProviderType] = useState<'pandit' | 'nau'>('pandit');
  const [fullName, setFullName] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [languages, setLanguages] = useState('Hindi, Sanskrit');
  const [hourly, setHourly] = useState('1000');
  const [fullDay, setFullDay] = useState('5000');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Mumbai City');
  const [city, setCity] = useState('Mumbai');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const services = providerType === 'pandit'
    ? PANDIT_SERVICES.map((s) => s.label)
    : NAU_SERVICES.map((s) => s.label);

  const submit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login with OTP first, then register as a provider.', [
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (!fullName) {
      Alert.alert('Required', 'Full name is required');
      return;
    }
    setLoading(true);
    try {
      await registerProvider({
        providerType,
        fullName,
        experienceYears: parseInt(experienceYears, 10),
        languages: languages.split(',').map((l) => l.trim()),
        services,
        charges: {
          hourly: parseInt(hourly, 10),
          halfDay: parseInt(hourly, 10) * 4,
          fullDay: parseInt(fullDay, 10),
          multiDay: parseInt(fullDay, 10) * 0.9,
        },
        location: { state, district, city },
        bio,
        documents: [{ type: 'aadhaar', documentNumber: 'XXXX-XXXX-XXXX', verified: false }],
      });
      Alert.alert(
        'Submitted',
        'Your application is pending admin verification. You will receive a notification once approved.'
      );
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-cream">
      <Header title="Provider Registration" onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4 py-4">
        <View className="flex-row mb-4">
          {(['pandit', 'nau'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setProviderType(t)}
              className={`flex-1 py-3 rounded-xl mr-2 items-center ${providerType === t ? 'bg-saffron-500' : 'bg-white border border-orange-100'}`}
            >
              <Text className={providerType === t ? 'text-white font-bold capitalize' : 'text-gray-600 capitalize'}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Full Name" value={fullName} onChangeText={setFullName} />
        <Input label="Experience (years)" keyboardType="numeric" value={experienceYears} onChangeText={setExperienceYears} />
        <Input label="Languages (comma separated)" value={languages} onChangeText={setLanguages} />
        <Input label="Hourly Charge (₹)" keyboardType="numeric" value={hourly} onChangeText={setHourly} />
        <Input label="Full Day Charge (₹)" keyboardType="numeric" value={fullDay} onChangeText={setFullDay} />
        <Input label="State" value={state} onChangeText={setState} />
        <Input label="District" value={district} onChangeText={setDistrict} />
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline />
        <Text className="text-gray-500 text-sm mb-4">
          Upload Aadhaar/PAN and complete DigiLocker verification from your provider dashboard after approval.
        </Text>
        <Button title="Submit for Verification" onPress={submit} loading={loading} className="mb-10" />
      </ScrollView>
    </View>
  );
}
