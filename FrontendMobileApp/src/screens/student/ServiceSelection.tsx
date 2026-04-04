import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Info,
  Clock,
  Users,
  ChevronRight,
  Check,
  Hammer,
  ArrowLeft,
  Activity,
} from 'lucide-react-native';
import api from '../../services/api';

interface Service {
  _id: string;
  name: string;
  department: string;
  description: string;
  estimatedTimePerToken: number;
  count: number;
  status: 'active' | 'maintenance' | 'inactive';
}

const ServiceSelection = () => {
  const navigation = useNavigation<any>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceSelect = (service: Service) => {
    navigation.navigate('TokenBooking', {service});
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <View>
          <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter">
            Campus Services
          </Text>
          <Text className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">
            Select a service to continue
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchServices}
            tintColor="#C2410C"
          />
        }>
        {services.map(service => (
          <TouchableOpacity
            key={service._id}
            disabled={service.status === 'maintenance'}
            className={`bg-[#1C1917] rounded-[32px] p-6 mb-5 border border-stone-800 active:scale-95 transition-transform shadow-xl ${
              service.status === 'maintenance' ? 'opacity-50' : ''
            }`}
            onPress={() => handleServiceSelect(service)}>
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-primary font-bold text-xs uppercase tracking-widest">
                  {service.department || 'General'}
                </Text>
                <Text className="text-textPrimary text-xl font-bold mt-1">
                  {service.name}
                </Text>
              </View>
              {service.status === 'maintenance' ? (
                <View className="bg-orange-950 px-3 py-1 rounded-full border border-orange-800 flex-row items-center">
                  <Hammer color="#FB923C" size={12} />
                  <Text className="text-orange-400 text-[10px] font-black uppercase ml-1">
                    Temporarily Paused
                  </Text>
                </View>
              ) : (
                <View className="bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
                  <Text className="text-buttonSecondary text-xs font-bold">
                    {service.estimatedTimePerToken}m
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-textSecondary text-sm mb-4" numberOfLines={2}>
              {service.description}
            </Text>

            <View className="flex-row items-center pt-4 border-t border-stone-800/50">
              <View className="flex-row items-center">
                <Users color="#78716C" size={14} />
                <Text className="text-textSecondary text-[11px] font-bold ml-1.5">
                  {service.count} waiting
                </Text>
              </View>
              <View className="flex-1" />
              <View
                className={`px-3 py-1 rounded-full border flex-row items-center mr-4 ${
                  service.count < 5
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : service.count < 15
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                <Activity
                  size={10}
                  color={
                    service.count < 5
                      ? '#10b981'
                      : service.count < 15
                      ? '#f59e0b'
                      : '#f43f5e'
                  }
                />
                <Text
                  className={`text-[9px] font-black uppercase ml-1 ${
                    service.count < 5
                      ? 'text-emerald-500'
                      : service.count < 15
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}>
                  {service.count < 5
                    ? 'Available'
                    : service.count < 15
                    ? 'Moderate'
                    : 'Busy'}
                </Text>
              </View>
              <ChevronRight color="#C2410C" size={18} />
            </View>
          </TouchableOpacity>
        ))}
        {services.length === 0 && !loading && (
          <View className="mt-20 items-center bg-stone-900/50 p-10 rounded-[40px] border border-stone-800 border-dashed shadow-2xl">
            <Info color="#78716C" size={64} />
            <Text className="text-textPrimary text-lg font-black mt-6 uppercase tracking-widest">
              No Services
            </Text>
            <Text className="text-textSecondary text-[10px] mt-2 text-center leading-5 uppercase tracking-[2px]">
              No active services found at this time. Please pull down to refresh.
            </Text>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default ServiceSelection;
