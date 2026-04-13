import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import {setActiveToken as setReduxToken} from '../../store/slices/tokenSlice';
import {useNavigation} from '@react-navigation/native';
import {
  Clock,
  Users,
  Activity,
  User,
  Ticket,
  MapPin,
  Sparkles,
  Monitor,
} from 'lucide-react-native';
import api from '../../services/api';
import {socketService} from '../../services/socket';

const ServiceCard = ({
  service,
  onBook,
}: {
  service: any;
  onBook: (id: string) => void;
}) => {
  const isFull = (service.queueCount || 0) >= (service.maxTokenLimit || 50);
  const counterAssigned = service.assignedCounter?.number;
  const staffName =
    service.staffAssigned !== 'NIL' && service.staffAssigned
      ? service.staffAssigned
      : service.assignedCounter?.staff?.name || 'Not Assigned';
  const isActive = !!counterAssigned;
  const canBook = isActive && !isFull;

  return (
    <View className="shadow-2xl shadow-black/30 elevation-20">
      <View
        className={`bg-[#171412] rounded-[48px] p-6 border ${
          isFull ? 'border-red-900/40 opacity-90' : 'border-stone-800/80'
        } overflow-hidden mb-8`}>
        <View className="flex-row justify-between items-center mb-10">
          <View className="flex-1 mr-4">
            <Text className="text-textPrimary text-3xl font-bold tracking-tight leading-tight mb-4">
              {service.name}
            </Text>
            <View className="flex-row items-center bg-stone-900/60 px-4 py-2 rounded-xl border border-stone-800 self-start">
              <MapPin color="#EA580C" size={10} strokeWidth={3} />
              <Text className="text-orange-600 text-[10px] font-bold tracking-tight ml-2 uppercase">
                NODE: {service.prefix?.toUpperCase()}
              </Text>
            </View>
          </View>
          <View
            className={`px-4 py-2 rounded-xl border-2 ${
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
            <Text
              className={`${
                isActive ? 'text-emerald-500' : 'text-red-500'
              } text-[10px] font-bold tracking-tight`}>
              {isActive ? 'ACTIVE' : 'OFFLINE'}
            </Text>
          </View>
        </View>
        <View className="bg-[#0C0A09] rounded-[32px] p-6 mb-10 border border-stone-800/60">
          <View className="flex-row justify-between items-center mb-8 border-b border-stone-800/40 pb-8">
            <View className="flex-1">
              <Text className="text-stone-700 text-[10px] font-bold tracking-tight mb-3 uppercase">
                Terminal Unit
              </Text>
              <View className="flex-row items-center">
                <Monitor color="#EA580C" size={16} strokeWidth={2.5} />
                <Text
                  className={`text-lg font-bold tracking-tight ml-3 ${
                    isActive ? 'text-white' : 'text-stone-800'
                  }`}>
                  {isActive
                    ? `TERM-${counterAssigned.toString().padStart(2, '0')}`
                    : 'UNLINKED'}
                </Text>
              </View>
            </View>
            <View className="w-[1px] h-10 bg-stone-800 mx-4" />
            <View className="flex-1">
              <Text className="text-stone-700 text-[10px] font-bold tracking-tight mb-3 uppercase">
                Time Factor
              </Text>
              <View className="flex-row items-center">
                <Clock color="#EA580C" size={16} strokeWidth={2.5} />
                <Text className="text-white text-lg font-bold tracking-tight ml-3">
                  {service.timePerStudent || '15'} MIN
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-stone-700 text-[10px] font-bold tracking-tight mb-3 uppercase">
                Designated Staff
              </Text>
              <View className="flex-row items-center">
                <User color="#EA580C" size={16} strokeWidth={2.5} />
                <Text
                  className={`text-sm font-bold tracking-tight ml-3 ${
                    isActive ? 'text-white' : 'text-stone-800'
                  }`}
                  numberOfLines={1}>
                  {staffName}
                </Text>
              </View>
            </View>
            <View className="bg-orange-600/5 border border-orange-600/20 px-4 py-2 rounded-2xl">
              <Text className="text-orange-600 text-[10px] font-bold tracking-tight">
                {service.queueCount || 0} / {service.maxTokenLimit || 50} TOKENS
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onBook(service._id)}
          disabled={!canBook}
          className={`${
            canBook ? 'bg-orange-600' : 'bg-stone-900 border border-stone-800'
          } flex-row items-center justify-center py-5 rounded-2xl active:scale-95 transition-all`}>
          <Ticket
            color={canBook ? '#FFF' : '#44403C'}
            size={20}
            strokeWidth={3}
          />
          <Text
            className={`${
              canBook ? 'text-white' : 'text-stone-700'
            } font-bold tracking-tight text-xs ml-3 uppercase`}>
            {isFull
              ? 'Tokens Full'
              : !isActive
              ? 'Node Offline'
              : 'Book Token'}
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
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    if (user?.token) {
      socketService.connect(user.token);
      socketService.onQueueUpdate(() => fetchData());
      socketService
        .getSocket()
        ?.on('staffAssignmentChanged', () => fetchData());
      socketService.getSocket()?.on('turnApproaching', () => fetchData());
    }
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleBookToken = async (serviceId: string) => {
    if (activeToken) {
      Alert.alert('Protocol Error', 'You already have an active sequence.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/tokens/create', {serviceId});
      dispatch(setReduxToken(response.data.token));
      Alert.alert('Protocol Success', 'Token generated successfully!', [
        {
          text: 'Monitor Live',
          onPress: () => navigation.navigate('Live Queue'),
        },
      ]);
      setTimeout(() => {
        navigation.navigate('Live Queue');
      }, 500);
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Unable to book token.',
      );
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
      contentContainerStyle={{paddingBottom: 120}}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#EA580C"
        />
      }>
      <View className="px-6 pt-16">
        <View className="flex-row justify-between items-center mb-12">
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <Activity color="#EA580C" size={12} strokeWidth={3} />
              <Text className="text-orange-600 text-xs font-bold tracking-tight">
                System Active
              </Text>
            </View>
            <Text className="text-textPrimary text-4xl font-bold tracking-tight leading-none">
              Portal
            </Text>
          </View>
          <View className="shadow-lg shadow-black/20 elevation-5">
            <View className="w-16 h-16 bg-[#171412] rounded-[24px] border border-stone-800 relative overflow-hidden">
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                className="w-full h-full items-center justify-center">
                {user?.profilePhoto ? (
                  <Image
                    source={{uri: user.profilePhoto}}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-orange-600 text-xl font-bold tracking-tight">
                      {user?.name?.charAt(0)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {activeToken && (
          <View className="shadow-2xl shadow-black/30 elevation-8">
            <Animated.View
              style={[{transform: [{scale: pulseAnim}]}]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Live Queue')}
                className="bg-[#1C1917] border-2 border-orange-600/30 rounded-[32px] p-12 relative overflow-hidden active:scale-[0.98] transition-all">
                <View className="absolute top-0 right-0 w-64 h-64 bg-orange-600/[0.03] rounded-full " />
                <View className="flex-row justify-between items-center mb-10">
                  <View className="px-5 py-2 rounded-full border border-orange-600/20 bg-orange-600/5">
                    <Text className="text-orange-600 font-bold tracking-tight text-xs">
                      Live Sequence
                    </Text>
                  </View>
                  <Activity color="#EA580C" size={24} strokeWidth={2.5} />
                </View>
                <View className="items-center py-6">
                  <Text className="text-textPrimary text-5xl font-bold tracking-tight leading-none">
                    {activeToken.number}
                  </Text>
                  <Text className="text-stone-600 text-xs font-bold tracking-tight mt-6">
                    Protocol Active
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        <View className="mb-10 flex-row items-center justify-between px-2 mt-10">
          <View className="flex-row items-center gap-4">
            <Sparkles color="#EA580C" size={20} strokeWidth={2.5} />
            <Text className="text-textPrimary text-2xl font-bold tracking-tight ">
              Available Services
            </Text>
          </View>
          <View className="bg-[#171412] px-4 py-1.5 rounded-full border border-stone-800">
            <Text className="text-stone-500 text-xs font-bold tracking-tight">
              {services.length} Nodes
            </Text>
          </View>
        </View>
        <View className="mb-20">
          {services.length > 0 ? (
            services.map(service => (
              <ServiceCard
                key={service._id}
                service={service}
                onBook={handleBookToken}
              />
            ))
          ) : (
            <View className="bg-[#171412] border-2 border-stone-800 border-dashed rounded-[48px] p-12 items-center">
              <Users color="#292524" size={64} strokeWidth={1} />
              <Text className="text-stone-700 text-xs mt-6 font-bold tracking-tight text-center">
                No active service nodes detected
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default StudentDashboard;
