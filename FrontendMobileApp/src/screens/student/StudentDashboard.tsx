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
  Ticket,
  MapPin,
  Sparkles,
  Monitor,
  Zap,
} from 'lucide-react-native';
import api from '../../services/api';

const ServiceCard = ({service, onBook}: {service: any; onBook: (id: string) => void}) => {
  const isFull = (service.count || 0) >= (service.maxTokenLimit || 50);
  const counterAssigned = service.assignedCounter?.number;
  const staffName = service.assignedCounter?.staff?.name || 'Not Assigned';
  const isActive = !!counterAssigned;
  const canBook = isActive && !isFull;

  return (
    <View className="mb-8 relative overflow-hidden">
      <View 
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 40, elevation: 20 }}
        className={`bg-[#171412] rounded-[48px] p-10 border ${isFull ? 'border-red-900/40 opacity-90' : 'border-stone-800/80 shadow-2xl'}`}
      >
      
      {/* Service Header */}
      <View className="flex-row justify-between items-start mb-12">
        <View className="flex-1">
          <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter leading-tight mb-4 font-serif" style={{ fontFamily: 'Times New Roman' }}>
             {service.name}
          </Text>
          <View className="flex-row items-center bg-stone-900/60 px-4 py-2 rounded-2xl border border-stone-800 w-fit">
             <MapPin color="#EA580C" size={12} strokeWidth={3} />
             <Text className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] ml-2 leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>
                {service.prefix} GRID_NODE
             </Text>
          </View>
        </View>
        <View className="items-end">
           <View className={`px-4 py-2 rounded-xl border-2 ${isActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <Text className={`${isActive ? 'text-emerald-500' : 'text-red-500'} text-[8px] font-black uppercase tracking-[0.2em] font-serif`} style={{ fontFamily: 'Times New Roman' }}>
                 {isActive ? 'STATUS: ACTIVE' : 'STATUS: OFFLINE'}
              </Text>
           </View>
        </View>
      </View>

      {/* Primary Metrics Group */}
      <View className="bg-[#0C0A09] rounded-[32px] p-8 mb-10 border border-stone-800/60">
        <View className="flex-row justify-between items-center mb-8 border-b border-stone-800/40 pb-8">
           <View className="flex-1">
              <Text className="text-stone-700 text-[9px] font-black uppercase tracking-[0.4em] mb-3 font-serif" style={{ fontFamily: 'Times New Roman' }}>Counter Number</Text>
              <View className="flex-row items-center">
                 <Monitor color="#EA580C" size={18} strokeWidth={2.5} />
                 <Text className={`text-2xl font-black uppercase tracking-widest ml-4 font-serif ${isActive ? 'text-white' : 'text-stone-800'}`} style={{ fontFamily: 'Times New Roman' }}>
                    {isActive ? `UNIT-${counterAssigned.toString().padStart(2, '0')}` : 'UNASSIGNED'}
                 </Text>
              </View>
           </View>
           <View className="w-[1px] h-10 bg-stone-800" />
           <View className="flex-1 pl-8">
              <Text className="text-stone-700 text-[9px] font-black uppercase tracking-[0.4em] mb-3 font-serif" style={{ fontFamily: 'Times New Roman' }}>Avg per Student</Text>
              <View className="flex-row items-center">
                 <Clock color="#EA580C" size={18} strokeWidth={2.5} />
                 <Text className="text-white text-2xl font-black uppercase tracking-widest ml-4 font-serif" style={{ fontFamily: 'Times New Roman' }}>
                    {service.estimatedTimePerStudent || '15'}M
                 </Text>
              </View>
           </View>
        </View>

        <View className="flex-row items-center justify-between">
           <View className="flex-1">
              <Text className="text-stone-700 text-[9px] font-black uppercase tracking-[0.4em] mb-3 font-serif" style={{ fontFamily: 'Times New Roman' }}>Staff Name</Text>
              <View className="flex-row items-center">
                 <UserIcon color="#EA580C" size={18} strokeWidth={2.5} />
                 <Text className={`text-sm font-black uppercase tracking-widest ml-3 font-serif ${isActive ? 'text-white' : 'text-stone-800'}`} style={{ fontFamily: 'Times New Roman' }}>
                    {staffName}
                 </Text>
              </View>
           </View>
           <View className="items-end bg-orange-600/5 border border-orange-600/20 px-5 py-3 rounded-2xl">
              <Text className="text-orange-600 text-[10px] font-black uppercase tracking-widest font-serif" style={{ fontFamily: 'Times New Roman' }}>
                 {service.queueCount || 0} / {service.maxTokenLimit || 50} TOKENS
              </Text>
           </View>
        </View>
      </View>

      {/* Book Button */}
      <TouchableOpacity 
        onPress={() => onBook(service._id)}
        disabled={!canBook}
        className={`${canBook ? 'bg-orange-600 shadow-2xl shadow-orange-950/40' : 'bg-stone-900 border border-stone-800'} flex-row items-center justify-center py-8 rounded-[32px] active:scale-95 transition-all`}>
        <Ticket color={canBook ? "#FFF" : "#44403C"} size={22} strokeWidth={3} />
        <Text className={`${canBook ? 'text-white' : 'text-stone-700'} font-black text-sm uppercase tracking-[0.4em] ml-4 font-serif`} style={{ fontFamily: 'Times New Roman' }}>
          {isFull ? 'CAPACITY_REACHED' : !isActive ? 'TERMINAL_OFFLINE' : 'BOOK TOKEN'}
        </Text>
      </TouchableOpacity>
    </View>
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
      Alert.alert('Protocol Error', 'You already have an active sequence. Terminate it before initializing a new booking.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/tokens/create', {serviceId});
      dispatch(setReduxToken(response.data.token));
      Alert.alert('Protocol Success', 'Token generated successfully!', [
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
      <View className="flex-1 bg-[#0C0A09] items-center justify-center">
        <ActivityIndicator color="#EA580C" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#0C0A09]"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#EA580C"
        />
      }>
      <View className="px-6 pt-16">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-12">
          <View>
            <View className="flex-row items-center gap-2 mb-3">
               <Activity color="#EA580C" size={12} strokeWidth={3} />
               <Text className="text-orange-600 text-[9px] font-black uppercase tracking-[0.5em]">System_Active</Text>
            </View>
            <Text className="text-textPrimary text-4xl font-black tracking-tighter uppercase leading-none">
              Portal
            </Text>
          </View>
          <View
            className="w-16 h-16 bg-[#171412] rounded-[24px] border border-stone-800 relative overflow-hidden">
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="w-full h-full items-center justify-center">
            {user?.profilePhoto ? (
              <Image source={{uri: user.profilePhoto}} className="w-full h-full" />
            ) : (
                <View className="w-full h-full items-center justify-center">
                    <Text className="text-orange-600 text-xl font-black">{user?.name?.charAt(0)}</Text>
                </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

        {/* Active Token Preview */}
        {activeToken && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Live Queue')}
            className="bg-[#1C1917] border-2 border-orange-600/30 rounded-[60px] p-12 mb-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden active:scale-[0.98] transition-all">
            <View className="absolute top-0 right-0 w-64 h-64 bg-orange-600/[0.03] rounded-full -mr-32 -mt-32" />
            
            <View className="flex-row justify-between items-center mb-10">
              <View className="px-5 py-2 rounded-full border border-orange-600/20 bg-orange-600/5">
                <Text className="text-orange-600 font-black text-[9px] uppercase tracking-[0.4em]">Live Sequence</Text>
              </View>
              <Activity color="#EA580C" size={24} strokeWidth={2.5} />
            </View>
            
            <View className="items-center py-6">
              <Text className="text-textPrimary text-8xl font-black tracking-tighter leading-none">
                {activeToken.number}
              </Text>
              <Text className="text-stone-600 text-[10px] uppercase font-black tracking-[0.6em] mt-6">Protocol Active</Text>
            </View>

            <View className="flex-row justify-between mt-12 pt-10 border-t border-stone-800/40">
              <View className="items-center flex-1">
                <Text className="text-stone-700 text-[8px] font-black uppercase tracking-widest mb-2">Service</Text>
                <Text className="text-textPrimary font-black text-[10px] uppercase tracking-tighter" numberOfLines={1}>{activeToken.service?.name}</Text>
              </View>
              <View className="items-center flex-1 border-x border-stone-800/40">
                <Text className="text-stone-700 text-[8px] font-black uppercase tracking-widest mb-2">Status</Text>
                <Text className="text-orange-600 font-black text-[10px] uppercase tracking-widest">{activeToken.status}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-stone-700 text-[8px] font-black uppercase tracking-widest mb-2">Wait</Text>
                <Text className="text-textPrimary font-black text-[10px] uppercase tracking-widest">{activeToken.estimatedWaitTime || '15'}M</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Services Section */}
        <View className="mb-10 flex-row items-center justify-between px-2">
          <View className="flex-row items-center gap-4">
            <Sparkles color="#EA580C" size={20} strokeWidth={2.5} />
            <Text className="text-textPrimary text-2xl font-black uppercase tracking-tighter">Available Services</Text>
          </View>
          <View className="bg-[#171412] px-4 py-1.5 rounded-full border border-stone-800">
            <Text className="text-stone-500 text-[10px] font-black uppercase tracking-widest">{services.length} Nodes</Text>
          </View>
        </View>

        <View className="mb-20">
          {services.length > 0 ? (
            services.map((service) => (
              <ServiceCard 
                key={service._id} 
                service={service} 
                onBook={handleBookToken} 
              />
            ))
          ) : (
            <View className="bg-[#171412] border-2 border-stone-800 border-dashed rounded-[48px] p-20 items-center">
              <Users color="#292524" size={64} strokeWidth={1} />
              <Text className="text-stone-700 text-xs mt-6 font-black uppercase tracking-[0.3em] text-center">No active service nodes detected</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default StudentDashboard;
