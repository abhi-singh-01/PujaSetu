import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import LoadingScreen from '../components/LoadingScreen';
import { getDashboardStats } from '../api/adminApi';
import { listPendingProviders, verifyProvider } from '../api/providerApi';
import type { Provider } from '../types';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [pending, setPending] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, p] = await Promise.all([getDashboardStats(), listPendingProviders()]);
      setStats(s.data.stats);
      setPending(p.data.providers);
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await verifyProvider(id, {
        status,
        rejectionReason: status === 'rejected' ? 'Documents incomplete' : undefined,
      });
      load();
      Alert.alert('Done', `Provider ${status}`);
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-cream">
      <Header title="Admin Dashboard" subtitle="PujaSetu Management" />
      <ScrollView className="flex-1 px-4 py-4">
        <View className="flex-row flex-wrap justify-between">
          {[
            { label: 'Users', value: stats?.totalUsers },
            { label: 'Providers', value: stats?.totalProviders },
            { label: 'Bookings', value: stats?.totalBookings },
            { label: 'Revenue ₹', value: stats?.totalRevenue },
          ].map((item) => (
            <Card key={item.label} className="w-[48%] mb-3 items-center py-4">
              <Text className="text-2xl font-bold text-saffron-600">{item.value ?? 0}</Text>
              <Text className="text-gray-500 text-sm">{item.label}</Text>
            </Card>
          ))}
        </View>

        <Text className="font-bold text-gray-900 mt-4 mb-2">
          Pending Verifications ({pending.length})
        </Text>
        {pending.map((p) => (
          <Card key={p._id} className="mb-3">
            <Text className="font-bold">{p.fullName}</Text>
            <Text className="text-gray-500 capitalize">{p.providerType}</Text>
            <Text className="text-gray-500 text-sm">{p.location?.district}, {p.location?.state}</Text>
            <View className="flex-row mt-3">
              <TouchableOpacity
                onPress={() => handleVerify(p._id, 'approved')}
                className="flex-1 bg-green-500 py-2 rounded-lg mr-2 items-center"
              >
                <Text className="text-white font-bold">Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleVerify(p._id, 'rejected')}
                className="flex-1 bg-red-500 py-2 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Reject</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
