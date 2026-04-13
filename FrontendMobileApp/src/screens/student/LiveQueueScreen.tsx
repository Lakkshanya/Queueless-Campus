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
  User,
  Monitor,
  Zap,
  ShieldCheck,
  MapPin,
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
    // FCM Foreground Listener
    const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
      console.log('FCM Update Received:', remoteMessage);
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
      socketService.getSocket()?.on('turnApproaching', data => {
        if (data.message) {
          Alert.alert('Queue Synchronization', data.message);
        }
        fetchStatus();
      });
      socketService.onTokenStarted(data => {
        Alert.alert(
          'Protocol Active',
          'Your sequence has been initialized by the operator.',
        );
        fetchStatus();
      });
      socketService.onTokenCompleted(data => {
        Alert.alert(
          'Protocol Complete',
          'Your transaction session has been successfully closed.',
        );
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
              Alert.alert(
                'System Error',
                'Failed to terminate token sequence.',
              );
            }
          },
        },
      ],
    );
  };

  if (!activeToken) {
    return (
      <View className="flex-1 bg-[#0C0A09] items-center justify-center px-12"><Activity color="#292524" size={64} strokeWidth={1.5} /><Text className="text-stone-700 text-xl font-bold tracking-tight mt-10 text-center ">
          No Active Ticket
        </Text><Text className="text-stone-800 text-xs mt-6 text-center leading-relaxed font-bold tracking-tight">
          
          Book a service from the home screen to monitor your real-time 
          queue position.
        </Text><TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          className="mt-12 bg-stone-900 border border-stone-800 px-10 py-4 rounded-2xl active:scale-95 transition-transform"><Text className="text-stone-500 font-bold tracking-tight text-xs">
            Return to Dashboard
          </Text></TouchableOpacity></View>
    );
  }

  const isServing = status?.token?.status === 'serving';
  const hasOperatorStarted =
    isServing || status?.preview?.some((t: any) => t.status === 'serving');

  return (
      <View className="flex-1 bg-[#0C0A09]"><View className="px-6 pt-16 flex-row items-center justify-between mb-12"><TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800 shadow-xl shadow-black/10 elevation-md"><ArrowLeft color="#78716C" size={24} strokeWidth={3} /></TouchableOpacity><Text className="text-orange-600 text-xs font-bold tracking-tight ml-4">
          Live Monitor
        </Text><TouchableOpacity
          onPress={onRefresh}
          className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800"><RefreshCw color="#EA580C" size={20} strokeWidth={2.5} /></TouchableOpacity></View><ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 80}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }>
        {/* Consolidated Token Status Card */}
        <View className="mx-4 mt-12 mb-10 shadow-2xl shadow-orange-600/20 elevation-2xl"><Animated.View style={{transform: [{scale: pulseAnim}]}}><View className="bg-[#171412] border-2 border-orange-600/30 rounded-[40px] p-6 items-center relative overflow-hidden"><View className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/[0.05] rounded-full -mr-48 -mt-48 pointer-events-none" /><View className="items-center mb-8 w-full"><Text className="text-textPrimary text-xl font-bold tracking-tight mb-2">
                    {status?.token?.service?.name || '---'}
                  </Text><View className="flex-row items-center gap-4 self-start"><View className="flex-row items-center bg-stone-900/60 px-4 py-2 rounded-xl border border-stone-800"><MapPin color="#EA580C" size={10} strokeWidth={3} /><Text className="text-orange-600 text-[10px] font-bold tracking-tight ml-2 uppercase">
                TAG: {status?.token?.service?.prefix?.toUpperCase() || '---'}
              </Text></View>
              {status?.token?.service?.venue && (
                <View className="flex-row items-center bg-stone-900/60 px-4 py-2 rounded-xl border border-stone-800"><Text className="text-stone-500 text-[10px] font-bold tracking-tight uppercase">
                  {status?.token?.service?.venue}
                </Text></View>
              )}
              </View></View><Text
                  className="text-textPrimary text-6xl font-bold tracking-tight mb-8 leading-none"
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {activeToken.number}
                </Text><View className="flex-row items-center mb-10"><User color="#57534e" size={12} className="opacity-40" /><Text className="text-stone-600 text-[10px] font-bold tracking-tight ml-3 uppercase italic">
                    Operated by {status?.token?.counter?.staff?.name || 'Authorized Staff'}
                  </Text></View><View
                  className={`px-8 py-4 rounded-2xl border-2 flex-row items-center ${
                    isServing
                      ? 'bg-emerald-600/10 border-emerald-500/30'
                      : 'bg-orange-600/10 border-orange-600/30'
                  }`}><Activity
                    color={isServing ? '#10b981' : '#EA580C'}
                    size={16}
                    strokeWidth={3}
                  /><Text
                    className={`font-bold tracking-tight text-[10px] ml-4 uppercase ${
                      isServing ? 'text-emerald-500' : 'text-orange-600'
                    }`}>
                    {isServing ? 'Now Serving' : 'Waiting in Grid'}
                  </Text></View></View>{/* Queue Preview Sequence */}<View className="w-full mt-4 pt-10 border-t border-stone-800/40"><Text className="text-stone-500 text-[9px] font-bold tracking-tight mb-8 uppercase px-2 text-center">
                  Queue Sequence Preview
                </Text><View className="flex-row justify-between gap-3">
                  {[
                    {label: 'SERVING', idx: 0},
                    {label: 'NEXT', idx: 1},
                    {label: 'PREPARE', idx: 2},
                  ].map(slot => {
                    const token = status?.preview?.[slot.idx];
                    const isActive = token?.number === activeToken.number;
                    return (
                      <View
                        key={slot.label}
                        className={`flex-1 items-center p-3 rounded-2xl border ${
                          isActive
                            ? 'bg-orange-600/10 border-orange-600'
                            : 'bg-stone-900 border-stone-800'
                        }`}><Text
                          className={`text-[9px] font-bold tracking-tight mb-3 ${
                            isActive ? 'text-orange-600' : 'text-stone-700'
                          }`}>
                          {slot.label}
                        </Text><Text
                          className={`text-base font-bold tracking-tight tabular-nums ${
                            isActive
                              ? 'text-white'
                              : token
                              ? 'text-stone-300'
                              : 'text-stone-900'
                          }`}
                          numberOfLines={1}>
                          {token ? token.number : '---'}
                        </Text></View>
                    );
                  })}
                </View></View></Animated.View></View>
  
        {/* Queue Metrics & Tracker */}
        <View className="mx-4 mb-12 shadow-2xl shadow-black/20 elevation-xl"><View className="bg-[#171412] rounded-[32px] p-6 border border-stone-800/80 overflow-hidden relative"><View className="flex-row gap-x-6 mb-0"><View className="flex-1 bg-[#0C0A09] p-6 rounded-[24px] border border-stone-800 relative overflow-hidden"><View className="flex-row items-center gap-2 mb-3"><Users color="#EA580C" size={14} strokeWidth={3} /><Text className="text-stone-700 text-[9px] font-bold tracking-tight leading-none uppercase">
                    Queue Position
                  </Text></View><Text className="text-textPrimary text-3xl font-bold tracking-tight leading-none">
                  {hasOperatorStarted && status?.ahead !== undefined
                    ? status.ahead
                    : '--'}
                </Text><Text className="text-stone-800 text-[9px] font-bold tracking-tight mt-3 uppercase">
                  Units Ahead
                </Text></View><View className="flex-1 bg-[#0C0A09] p-6 rounded-[24px] border border-stone-800 relative overflow-hidden"><View className="flex-row items-center gap-2 mb-3"><Timer color="#EA580C" size={14} strokeWidth={3} /><Text className="text-stone-700 text-[9px] font-bold tracking-tight leading-none uppercase">
                    Est. Wait
                  </Text></View><Text className="text-textPrimary text-3xl font-bold tracking-tight leading-none">
                  {hasOperatorStarted && status?.wait !== undefined
                    ? status.wait
                    : '--'}
                </Text><Text className="text-stone-800 text-[9px] font-bold tracking-tight mt-3 uppercase">
                  Minutes Left
                </Text></View></View>
  
            {!hasOperatorStarted && (
              <View className="absolute inset-0 bg-[#171412]/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-[32px]"><Zap color="#EA580C" size={24} className="opacity-50 mb-2" /><Text className="text-orange-600 font-bold tracking-tight text-[10px] uppercase">
                  Awaiting Operator Start
                </Text></View>
            )}</View>
        </View>

        {/* Vertical Progress Registry */}
        <View className="mx-16 space-y-4">
          {[
            {
              label: 'Sequence Initialized',
              sub: 'Protocol recorded in grid',
              done: true,
              icon: <CheckCircle2 size={14} color="#10b981" />,
            },
            {
              label: 'Operator Handshake',
              sub: 'Handing over to workstation',
              active: status?.token?.status === 'waiting',
              done:
                status?.token?.status === 'serving' ||
                status?.token?.status === 'completed',
            },
            {
              label: 'Service Session',
              sub: 'Real-time transaction active',
              active: status?.token?.status === 'serving',
              done: status?.token?.status === 'completed',
            },
            {
              label: 'Registry Closed',
              sub: 'Session successfully archived',
              active: status?.token?.status === 'completed',
              done: status?.token?.status === 'completed',
            },
          ].map((step, idx) => (
            <React.Fragment key={idx}><View className="flex-row items-center gap-x-10"><View
                  className={`w-4 h-4 rounded-full border-2 ${
                    step.active
                      ? 'bg-orange-600 border-white'
                      : step.done
                      ? 'bg-emerald-500 border-emerald-950/20'
                      : 'bg-[#1C1917] border-stone-800'
                  }`}
                /><View className="flex-1"><Text
                    className={`font-bold tracking-tight text-xs ${
                      step.active ? 'text-white' : 'text-stone-800'
                    }`}>
                    {step.label}
                  </Text><Text className="text-stone-900 text-xs font-bold tracking-tight mt-1">
                    {step.sub}
                  </Text></View></View>
              {idx < 3 && (
                <View className="w-[2px] h-12 bg-stone-900 ml-[7px] my-1" />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Terminate Button */}
        <View className="mx-6 mt-16 shadow-xl shadow-black/20 elevation-xl"><TouchableOpacity
            onPress={handleCancel}
            activeOpacity={0.8}
            className="w-full bg-[#171412] py-6 rounded-3xl border border-red-900/30 flex-row items-center justify-center relative overflow-hidden"><View className="absolute inset-0 bg-red-600/[0.02]" /><XCircle color="#ef4444" size={20} strokeWidth={2.5} /><Text className="text-red-500 font-bold tracking-tight ml-4 text-xs uppercase">
              Terminate Sequence
            </Text></TouchableOpacity></View></ScrollView></View>
  );
};

export default LiveQueueScreen;
