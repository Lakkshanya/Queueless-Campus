import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  ShieldAlert,
  Clock,
  Users,
  ArrowLeft,
  RefreshCw,
  XCircle,
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppSelector, useAppDispatch} from '../../store';
import {clearTokenData} from '../../store/slices/tokenSlice';
import {socketService} from '../../services/socket';

interface TokenStatus {
  token: {
    number: string;
    counter?: {
      number: string;
      status: string;
    };
  };
  servingNow: {
    number: string;
  };
  ahead: number;
  wait: number;
}

const LiveQueueScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const {activeToken} = useAppSelector(state => state.tokens);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [pulseAnim] = useState(new Animated.Value(1));
  const [status, setStatus] = useState<TokenStatus | null>(null);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  useEffect(() => {
    fetchStatus();

    if (user?.token && activeToken?.counter?._id) {
      socketService.connect(user.token);
      socketService.joinQueue(activeToken.counter._id);

      socketService.onQueueUpdate(() => {
        console.log('Real-time queue update received');
        fetchStatus();
      });

      socketService.onTurnApproaching(data => {
        Alert.alert(data.title || 'Your Turn!', data.message);
        fetchStatus();
      });
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      socketService.off('queueUpdated');
      socketService.off('turnApproaching');
    };
  }, [activeToken?._id, activeToken?.counter?._id]);

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
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel token');
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold ml-4">
          Live Queue
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C2410C"
          />
        }>
        {/* Token Highlights */}
        <View className="items-center mb-10">
          <Text className="text-stone-500 text-[10px] font-black uppercase tracking-[4px] mb-4">
            Your Token
          </Text>
          <Animated.View
            style={{transform: [{scale: pulseAnim}]}}
            className="bg-primary/10 border border-primary/30 rounded-full w-48 h-48 items-center justify-center shadow-2xl shadow-primary/20">
            <Text className="text-primary text-6xl font-black tracking-tighter">
              {status?.token?.number || '---'}
            </Text>
            <View className="absolute bottom-5 bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
              <Text className="text-primary text-[8px] font-black uppercase tracking-widest">Active</Text>
            </View>
          </Animated.View>
        </View>

        {/* Live Status Board */}
        <View className="bg-[#1C1917] rounded-[32px] p-8 border border-stone-800 shadow-2xl relative overflow-hidden">
          <View className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <View className="flex-row justify-between mb-8 border-b border-stone-800/50 pb-6">
            <View>
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1">
                Now Serving
              </Text>
              <Text className="text-buttonSecondary text-4xl font-black tracking-tighter">
                {status?.servingNow?.number || '---'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1">
                Counter
              </Text>
              {status?.token?.counter?.status === 'paused' ? (
                <View className="bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 mt-1">
                  <Text className="text-red-500 text-[10px] font-black uppercase tracking-widest">
                    Paused
                  </Text>
                </View>
              ) : (
                <Text className="text-textPrimary text-4xl font-black tracking-tighter">
                  {status?.token?.counter?.number || '...'}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row mb-6 gap-x-4">
            <View className="flex-1 bg-stone-900/50 p-5 rounded-2xl border border-stone-800">
              <Users color="#9A3412" size={24} className="mb-3" />
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest">
                Waiting List
              </Text>
              <Text className="text-textPrimary text-2xl font-black mt-1">
                {status?.ahead ?? '--'} <Text className="text-stone-500 text-xs tracking-normal">ahead</Text>
              </Text>
            </View>

            <View className="flex-1 bg-stone-900/50 p-5 rounded-2xl border border-stone-800">
              <Clock color="#C2410C" size={24} className="mb-3" />
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest">
                Est. Time
              </Text>
              <Text className="text-textPrimary text-2xl font-black mt-1">
                {status?.wait ?? '--'} <Text className="text-stone-500 text-xs tracking-normal">mins</Text>
              </Text>
            </View>
          </View>

          <View className="bg-orange-500/10 p-4 rounded-2xl flex-row items-center border border-orange-500/20 mt-2">
            <ShieldAlert color="#FDBA74" size={24} />
            <Text className="text-orange-400/90 text-[10px] font-medium leading-4 ml-3 flex-1">
              We'll instantly notify you when your turn is approaching. Keep the app open for live reliable updates.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row space-x-4 mt-8 mb-10 gap-x-4">
          <TouchableOpacity
            onPress={fetchStatus}
            className="flex-1 bg-stone-900 border border-stone-800 py-4 rounded-xl items-center flex-row justify-center active:scale-95 transition-transform">
            <RefreshCw color="#D6D3D1" size={16} />
            <Text className="text-textPrimary font-bold text-[10px] uppercase tracking-widest ml-2">Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 bg-red-500/10 border border-red-500/20 py-4 rounded-xl items-center flex-row justify-center active:scale-95 transition-transform">
            <XCircle color="#f87171" size={16} />
            <Text className="text-red-500 font-bold text-[10px] uppercase tracking-widest ml-2">Drop Position</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveQueueScreen;
