import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Clock,
  Users,
  ArrowLeft,
  RefreshCw,
  XCircle,
  Activity,
  CheckCircle2,
  Timer,
  User as UserIcon,
  Monitor,
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppSelector, useAppDispatch} from '../../store';
import {clearTokenData} from '../../store/slices/tokenSlice';
import {socketService} from '../../services/socket';

const LiveQueueScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const {activeToken} = useAppSelector(state => state.tokens);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [pulseAnim] = useState(new Animated.Value(1));
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    if (!activeToken?._id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const response = await api.get(`/tokens/status/${activeToken._id}`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching token status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    if (user?.token) {
      socketService.connect(user.token);
      
      const userId = user._id || (user as any).id;
      if (userId) {
        socketService.joinUser(userId);
      }

      socketService.onQueueUpdate(() => {
        console.log('Real-time queue update received');
        fetchStatus();
      });

      socketService.onTokenStarted((data) => {
        Alert.alert('Your Turn!', 'You are now being served.');
        fetchStatus();
      });

      socketService.onTokenCompleted((data) => {
        Alert.alert('Completed', 'Service has been completed.');
        dispatch(clearTokenData());
        navigation.navigate('Home');
      });
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      socketService.off('queueUpdated');
      socketService.off('tokenStarted');
      socketService.off('tokenCompleted');
    };
  }, [activeToken?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Token',
      'Are you sure you want to cancel your queue position?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/tokens/cancel/${activeToken?._id}`);
              dispatch(clearTokenData());
              navigation.navigate('Home');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel token');
            }
          },
        },
      ],
    );
  };

  if (!activeToken) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-10">
        <Users color="#44403C" size={64} />
        <Text className="text-textPrimary text-xl font-bold mt-6 text-center">No Active Token</Text>
        <Text className="text-textSecondary text-sm mt-2 text-center">Book a service from the home page to see live updates.</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          className="mt-10 bg-primary px-8 py-4 rounded-2xl">
          <Text className="text-white font-black uppercase tracking-widest text-xs">Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-black uppercase tracking-tighter">Live Status</Text>
        <TouchableOpacity onPress={onRefresh} className="w-10 h-10 items-center justify-center">
          <RefreshCw color="#C2410C" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C2410C" />
        }>
        
        {/* Token Status Card */}
        <Animated.View 
          style={{transform: [{scale: pulseAnim}]}}
          className="mx-6 bg-[#1C1917] border-2 border-primary/20 rounded-[48px] p-10 shadow-2xl items-center relative overflow-hidden mb-10">
          <View className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20" />
          
          <Text className="text-stone-500 text-[10px] font-black uppercase tracking-[6px] mb-6">Your Token</Text>
          <Text className="text-textPrimary text-8xl font-black tracking-tighter mb-8">{activeToken.number}</Text>
          
          <View className="bg-stone-900 px-6 py-2 rounded-full border border-stone-800 flex-row items-center">
            <Activity color="#C2410C" size={14} />
            <Text className="text-primary font-black text-xs ml-2 uppercase tracking-widest">
              {status?.token?.status === 'serving' ? 'Now Serving' : 'Waiting'}
            </Text>
          </View>
        </Animated.View>

        {/* Detailed Info Card */}
        <View className="mx-6 bg-card rounded-[40px] p-8 border border-stone-800 shadow-sm mb-8">
          <View className="flex-row justify-between mb-8 pb-8 border-b border-stone-800/50">
            <View>
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1">Service Name</Text>
              <Text className="text-textPrimary text-lg font-bold">{activeToken.service?.name}</Text>
            </View>
            <View className="items-end">
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1">Counter</Text>
              <View className="flex-row items-center">
                <Monitor color="#78716C" size={16} />
                <Text className="text-textPrimary text-lg font-black ml-2">#{activeToken.counter?.number || '--'}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-x-4 mb-8">
            <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800">
              <UserIcon color="#C2410C" size={20} />
            </View>
            <View>
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1">Assigned Staff</Text>
              <Text className="text-textPrimary font-bold">{activeToken.staff?.name || 'Waiting for assignment'}</Text>
            </View>
          </View>

          {/* Position Tracker */}
          <View className="flex-row gap-x-4">
            <View className="flex-1 bg-stone-900/50 p-5 rounded-3xl border border-stone-800">
              <Users color="#9A3412" size={24} className="mb-2" />
              <Text className="text-stone-500 text-[8px] font-black uppercase tracking-widest">Tokens Ahead</Text>
              <Text className="text-textPrimary text-2xl font-black mt-1">{(status?.ahead !== undefined ? status.ahead : '..')}</Text>
            </View>
            <View className="flex-1 bg-stone-900/50 p-5 rounded-3xl border border-stone-800">
              <Timer color="#C2410C" size={24} className="mb-2" />
              <Text className="text-stone-500 text-[8px] font-black uppercase tracking-widest">Est. Wait</Text>
              <Text className="text-textPrimary text-2xl font-black mt-1">{(status?.wait !== undefined ? status.wait : '..')}m</Text>
            </View>
          </View>
        </View>

        {/* Live Status Indicator List */}
        <View className="mx-8">
          <View className="flex-row items-center mb-6">
            <View className={`w-3 h-3 rounded-full mr-4 ${status?.token?.status === 'waiting' ? 'bg-primary' : 'bg-stone-800'}`} />
            <Text className={`font-black text-xs uppercase tracking-widest ${status?.token?.status === 'waiting' ? 'text-textPrimary' : 'text-stone-600'}`}>Waiting in Line</Text>
          </View>
          <View className="w-[2px] h-6 bg-stone-800 ml-[5px] mb-6" />
          <View className="flex-row items-center mb-6">
            <View className={`w-3 h-3 rounded-full mr-4 ${status?.token?.status === 'serving' ? 'bg-emerald-500' : 'bg-stone-800'}`} />
            <Text className={`font-black text-xs uppercase tracking-widest ${status?.token?.status === 'serving' ? 'text-textPrimary' : 'text-stone-600'}`}>Now Serving</Text>
          </View>
          <View className="w-[2px] h-6 bg-stone-800 ml-[5px] mb-6" />
          <View className="flex-row items-center">
            <View className={`w-3 h-3 rounded-full mr-4 ${status?.token?.status === 'completed' ? 'bg-blue-500' : 'bg-stone-800'}`} />
            <Text className={`font-black text-xs uppercase tracking-widest ${status?.token?.status === 'completed' ? 'text-textPrimary' : 'text-stone-600'}`}>Service Completed</Text>
          </View>
        </View>

        {/* Drop Button */}
        <TouchableOpacity 
          onPress={handleCancel}
          className="mx-6 mt-12 bg-red-500/10 border border-red-500/20 py-5 rounded-3xl flex-row items-center justify-center active:scale-95 transition-transform">
          <XCircle color="#ef4444" size={20} />
          <Text className="text-red-500 font-black text-xs uppercase tracking-widest ml-2">Cancel My Token</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default LiveQueueScreen;
