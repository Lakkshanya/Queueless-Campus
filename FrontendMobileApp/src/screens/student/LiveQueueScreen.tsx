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
  Zap,
  ShieldCheck,
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppSelector, useAppDispatch} from '../../store';
import {clearTokenData} from '../../store/slices/tokenSlice';
import {socketService} from '../../services/socket';
import messaging from '@react-native-firebase/messaging';

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

    // FCM Foreground Listener (Requirement: robust FCM listener for updates)
    const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
      console.log('FCM Update Received:', remoteMessage);
      // If it's a token update, refresh status
      if (remoteMessage.data?.type?.startsWith('token_')) {
        fetchStatus();
      }
    });

    if (user?.token) {
      socketService.connect(user.token);
      
      const userId = user._id || (user as any).id;
      if (userId) {
        socketService.joinUser(userId);
      }

      socketService.onQueueUpdate(() => {
        fetchStatus();
      });

      socketService.onTokenStarted((data) => {
        Alert.alert('Protocol Active', 'Your sequence has been initialized by the operator.');
        fetchStatus();
      });

      socketService.onTokenCompleted((data) => {
        Alert.alert('Protocol Complete', 'Your transaction session has been successfully closed.');
        dispatch(clearTokenData());
        navigation.navigate('Home');
      });
    }

    // High-impact pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      unsubscribeFCM();
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
      'Protocol Termination',
      'Terminate active queue position? This action is irreversible.',
      [
        {text: 'Maintain Hold', style: 'cancel'},
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/tokens/cancel/${activeToken?._id}`);
              dispatch(clearTokenData());
              navigation.navigate('Home');
            } catch (error) {
              Alert.alert('System Error', 'Failed to terminate token sequence.');
            }
          },
        },
      ],
    );
  };

  if (!activeToken) {
    return (
      <View className="flex-1 bg-[#0C0A09] items-center justify-center px-12">
        <Activity color="#292524" size={64} strokeWidth={1.5} />
        <Text className="text-stone-700 text-xl font-black mt-10 text-center uppercase tracking-tighter">No Active Sequence</Text>
        <Text className="text-stone-800 text-[10px] mt-6 text-center leading-relaxed font-black uppercase tracking-widest">
           Deploy a service node from the portal to monitor real-time queue synchronization.
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          className="mt-16 bg-stone-900 border border-stone-800 px-12 py-5 rounded-[24px] active:scale-95 transition-transform">
          <Text className="text-stone-500 font-black uppercase tracking-[0.4em] text-[9px]">Return to Portal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isServing = status?.token?.status === 'serving';

  return (
    <View className="flex-1 bg-[#0C0A09]">
      <View className="px-6 pt-16 flex-row items-center justify-between mb-12">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800 shadow-2xl">
          <ArrowLeft color="#78716C" size={24} strokeWidth={3} />
        </TouchableOpacity>
        <Text className="text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] ml-4">Live Monitor</Text>
        <TouchableOpacity onPress={onRefresh} className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800">
          <RefreshCw color="#EA580C" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 80}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />
        }>
        
        {/* Token Status Card */}
        <Animated.View 
          style={{transform: [{scale: pulseAnim}]}}
          className="mx-6 mb-12">
          <View className="bg-[#171412] border-2 border-orange-600/30 rounded-[72px] p-16 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.8)] items-center relative overflow-hidden">
            <View className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/[0.05] rounded-full -mr-48 -mt-48 pointer-events-none" />
            
            <Text className="text-stone-700 text-[10px] font-black uppercase tracking-[0.8em] mb-12 font-serif" style={{ fontFamily: 'Times New Roman' }}>Active Sequence</Text>
            <Text className="text-textPrimary text-[120px] font-bold tracking-tighter mb-16 leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>{activeToken.number}</Text>
            
            <View className={`px-12 py-5 rounded-[24px] border-2 flex-row items-center ${isServing ? 'bg-emerald-600/10 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-orange-600/10 border-orange-600/30'}`}>
              <Activity color={isServing ? "#10b981" : "#EA580C"} size={20} strokeWidth={3} className="animate-pulse" />
              <Text className={`font-black text-xs uppercase tracking-[0.5em] ml-5 font-serif ${isServing ? 'text-emerald-500' : 'text-orange-600'}`} style={{ fontFamily: 'Times New Roman' }}>
                {isServing ? 'NOW SERVING' : 'WAITING_IN_LINE'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Detailed Info Card */}
        <View className="mx-6 bg-[#171412] rounded-[60px] p-12 border border-stone-800/80 shadow-2xl mb-12 overflow-hidden relative">
          <View className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/[0.03] rounded-full -ml-32 -mb-32 pointer-events-none" />
          
          <View className="flex-row justify-between mb-16 pb-16 border-b border-stone-800/60">
            <View className="flex-1">
              <Text className="text-stone-700 text-[9px] font-black uppercase tracking-[0.4em] mb-4 font-serif" style={{ fontFamily: 'Times New Roman' }}>Allocation Unit</Text>
              <Text className="text-textPrimary text-3xl font-bold uppercase tracking-tighter font-serif" style={{ fontFamily: 'Times New Roman' }} numberOfLines={1}>{activeToken.service?.name}</Text>
            </View>
            <View className="items-end ml-6">
              <Text className="text-stone-700 text-[9px] font-black uppercase tracking-[0.4em] mb-4 font-serif" style={{ fontFamily: 'Times New Roman' }}>Terminal</Text>
              <View className="flex-row items-center bg-[#0C0A09] px-6 py-3 rounded-2xl border border-stone-800 shadow-inner">
                <Monitor color="#EA580C" size={20} strokeWidth={3} />
                <Text className="text-white text-2xl font-bold ml-4 tabular-nums font-serif" style={{ fontFamily: 'Times New Roman' }}>{status?.token?.counter?.number || '--'}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-x-8 mb-16 px-4">
            <View className="w-20 h-20 bg-[#0C0A09] rounded-[28px] items-center justify-center border border-stone-800 shadow-inner">
              <UserIcon color="#EA580C" size={32} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-stone-700 text-[9px] font-black uppercase tracking-[0.4em] mb-3 font-serif" style={{ fontFamily: 'Times New Roman' }}>Designated Operator</Text>
              <Text className="text-textPrimary text-xl font-bold uppercase tracking-tighter leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>
                {status?.token?.counter?.staff?.name || 'Awaiting Grid Link'}
              </Text>
            </View>
          </View>

          {/* Metric Grids */}
          <View className="flex-row gap-x-10">
            <View className="flex-1 bg-[#0C0A09] p-10 rounded-[48px] border border-stone-800 shadow-inner relative overflow-hidden">
               <View className="flex-row items-center gap-4 mb-5">
                  <Users color="#EA580C" size={18} strokeWidth={3} />
                  <Text className="text-stone-700 text-[10px] font-black uppercase tracking-[0.4em] leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>Position</Text>
               </View>
               <Text className="text-textPrimary text-5xl font-bold tracking-tighter leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>
                  {status?.ahead !== undefined ? status.ahead : '--'}
               </Text>
               <Text className="text-stone-800 text-[10px] font-black uppercase tracking-[0.3em] mt-5 font-serif" style={{ fontFamily: 'Times New Roman' }}>Users Ahead</Text>
            </View>
            <View className="flex-1 bg-[#0C0A09] p-10 rounded-[48px] border border-stone-800 shadow-inner relative overflow-hidden">
               <View className="flex-row items-center gap-4 mb-5">
                  <Timer color="#EA580C" size={18} strokeWidth={3} />
                  <Text className="text-stone-700 text-[10px] font-black uppercase tracking-[0.4em] leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>Synchronizing</Text>
               </View>
               <Text className="text-textPrimary text-5xl font-bold tracking-tighter leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>
                  {status?.wait !== undefined ? status.wait : '--'}
               </Text>
               <Text className="text-stone-800 text-[10px] font-black uppercase tracking-[0.3em] mt-5 font-serif" style={{ fontFamily: 'Times New Roman' }}>Minutes Left</Text>
            </View>
          </View>
        </View>

        {/* Vertical Progress Registry */}
        <View className="mx-16 space-y-4">
           {[
            {label: 'Sequence Initialized', sub: 'Protocol recorded in grid', done: true, icon: <CheckCircle2 size={14} color="#10b981" />},
            {label: 'Operator Handshake', sub: 'Handing over to workstation', active: status?.token?.status === 'waiting', done: status?.token?.status === 'serving' || status?.token?.status === 'completed'},
            {label: 'Service Session', sub: 'Real-time transaction active', active: status?.token?.status === 'serving', done: status?.token?.status === 'completed'},
            {label: 'Registry Closed', sub: 'Session successfully archived', active: status?.token?.status === 'completed', done: status?.token?.status === 'completed'}
          ].map((step, idx) => (
            <React.Fragment key={idx}>
               <View className="flex-row items-center gap-x-10">
                  <View className={`w-4 h-4 rounded-full border-2 ${step.active ? 'bg-orange-600 border-white shadow-[0_0_20px_rgba(234,88,12,0.6)]' : step.done ? 'bg-emerald-500 border-emerald-950/20' : 'bg-[#1C1917] border-stone-800'}`} />
                  <View className="flex-1">
                     <Text className={`font-black text-[11px] uppercase tracking-[0.4em] font-serif ${step.active ? 'text-white' : 'text-stone-800'}`} style={{ fontFamily: 'Times New Roman' }}>
                        {step.label}
                     </Text>
                     <Text className="text-stone-900 text-[8px] font-black uppercase tracking-widest mt-1 font-serif" style={{ fontFamily: 'Times New Roman' }}>{step.sub}</Text>
                  </View>
               </View>
               {idx < 3 && <View className="w-[2px] h-12 bg-stone-900 ml-[7px] my-1" />}
            </React.Fragment>
          ))}
        </View>

        {/* Terminate Button */}
        <TouchableOpacity 
          onPress={handleCancel}
          className="mx-6 mt-20 bg-red-950/10 border border-red-900/20 py-7 rounded-[32px] flex-row items-center justify-center active:scale-95 transition-transform overflow-hidden shadow-2xl">
          <View className="absolute top-0 left-0 w-1.5 h-full bg-red-900/40" />
          <XCircle color="#ef4444" size={20} strokeWidth={2.5} />
          <Text className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] ml-4">Terminate Sequence</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

};

export default LiveQueueScreen;
