import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import {setActiveToken as setReduxToken} from '../../store/slices/tokenSlice';
import {useNavigation} from '@react-navigation/native';
import {
  Clock,
  Users,
  Activity,
  ChevronRight,
  User as UserIcon,
  Bell,
  Ticket,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import api from '../../services/api';

const ServiceCard = ({service, onBook}: {service: any; onBook: (id: string) => void}) => {
  return (
    <View className="bg-card rounded-[32px] p-6 border border-stone-800 mb-6 shadow-sm overflow-hidden">
      <View className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
      
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1">
          <Text className="text-textPrimary text-xl font-bold mb-1">{service.name}</Text>
          <View className="flex-row items-center">
            <MapPin color="#78716C" size={12} />
            <Text className="text-textSecondary text-xs ml-1">Counter {service.counter?.number || 'TBD'}</Text>
          </View>
        </View>
        <View className="bg-stone-900 px-3 py-1.5 rounded-2xl border border-stone-800 flex-row items-center">
          <Clock color="#C2410C" size={14} />
          <Text className="text-primary font-bold text-xs ml-1.5">{service.estimatedTimePerToken}m</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-8 gap-x-6">
        <View>
          <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1">Staff Assigned</Text>
          <Text className="text-textPrimary text-sm font-bold">{service.staff?.name || 'Assigned Soon'}</Text>
        </View>
        <View className="w-[1px] h-8 bg-stone-800" />
        <View>
          <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1">Live Queue</Text>
          <Text className="text-primary text-sm font-black">{service.count || 0} Waiting</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => onBook(service._id)}
        className="bg-primary flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-orange-950/20 active:scale-95 transition-transform">
        <Ticket color="#FFF" size={18} />
        <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">Book Token</Text>
      </TouchableOpacity>
    </View>
  );
};

const StudentDashboard = () => {
  const {user} = useAppSelector(state => state.auth);
  const {activeToken} = useAppSelector(state => state.tokens);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tokenRes, servicesRes] = await Promise.all([
        api.get('/tokens/status'),
        api.get('/services'),
      ]);
      if (tokenRes.data && tokenRes.data.active) {
        dispatch(setReduxToken(tokenRes.data.token));
      } else {
        dispatch(setReduxToken(null));
      }
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleBookToken = async (serviceId: string) => {
    if (activeToken) {
      Alert.alert('Active Token Found', 'You already have an active token. Complete or cancel it before booking a new one.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/tokens/create', {serviceId});
      dispatch(setReduxToken(response.data.token));
      Alert.alert('Success', 'Token generated successfully!', [
        {text: 'Go to Live Queue', onPress: () => navigation.navigate('Live Queue')}
      ]);
    } catch (error: any) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Unable to book token at this time.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C2410C" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#C2410C"
        />
      }>
      <View className="px-6 pt-16">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">QueueLess Campus</Text>
            <Text className="text-textPrimary text-3xl font-black tracking-tighter">
              Hello, {user?.name?.split(' ')[0] || 'Student'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="w-14 h-14 bg-card rounded-3xl items-center justify-center border border-stone-800 shadow-sm overflow-hidden">
            {user?.profilePhoto ? (
              <Image source={{uri: user.profilePhoto}} className="w-full h-full" />
            ) : (
              <UserIcon color="#C2410C" size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Token Preview */}
        {activeToken && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Live Queue')}
            className="bg-[#1C1917] border-2 border-primary/20 rounded-[40px] p-8 mb-12 shadow-2xl relative overflow-hidden">
            <View className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20" />
            <View className="flex-row justify-between items-center mb-6">
              <View className="bg-primary/20 px-4 py-1.5 rounded-full">
                <Text className="text-primary font-black text-[10px] uppercase tracking-widest">Live Now</Text>
              </View>
              <Activity color="#C2410C" size={20} />
            </View>
            
            <View className="items-center py-4">
              <Text className="text-textPrimary text-7xl font-black tracking-tighter">
                {activeToken.number}
              </Text>
              <Text className="text-stone-500 text-[10px] uppercase font-black tracking-[4px] mt-2">Active Token</Text>
            </View>

            <View className="flex-row justify-between mt-8 pt-8 border-t border-stone-800/50">
              <View className="items-center flex-1">
                <Text className="text-stone-600 text-[8px] font-black uppercase mb-1">Service</Text>
                <Text className="text-textPrimary font-bold text-xs uppercase" numberOfLines={1}>{activeToken.service?.name}</Text>
              </View>
              <View className="items-center flex-1 border-x border-stone-800/50">
                <Text className="text-stone-600 text-[8px] font-black uppercase mb-1">Status</Text>
                <Text className="text-primary font-bold text-xs uppercase">{activeToken.status}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-stone-600 text-[8px] font-black uppercase mb-1">Wait Time</Text>
                <Text className="text-textPrimary font-bold text-xs">{activeToken.estimatedWaitTime || '15'}m</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Services Section */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Sparkles color="#C2410C" size={20} />
            <Text className="text-textPrimary text-xl font-black ml-3 uppercase tracking-tighter">Available Services</Text>
          </View>
          <View className="bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
            <Text className="text-stone-500 text-[10px] font-black">{services.length}</Text>
          </View>
        </View>

        <View className="mb-12">
          {services.length > 0 ? (
            services.map((service) => (
              <ServiceCard 
                key={service._id} 
                service={service} 
                onBook={handleBookToken} 
              />
            ))
          ) : (
            <View className="bg-card/30 border border-stone-800 border-dashed rounded-[32px] p-12 items-center">
              <Users color="#44403C" size={48} />
              <Text className="text-textSecondary text-sm mt-4 font-bold">No active services found</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default StudentDashboard;
