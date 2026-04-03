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
          <Text className="text-textSecondary text-xs uppercase tracking-[3px] mb-2">
            Your Token
          </Text>
          <Animated.View
            style={{transform: [{scale: pulseAnim}]}}
            className=" border-2 border-primary rounded-3xl px-8 py-4">
            <Text className="text-primary text-5xl font-black">
              {status?.token?.number || '---'}
            </Text>
          </Animated.View>
        </View>

        {/* Live Status Board */}
        <View className="bg-card rounded-3xl p-6 border border-stone-800 ">
          <View className="flex-row justify-between mb-8">
            <View>
              <Text className="text-textSecondary text-[10px] uppercase">
                Now Serving
              </Text>
              <Text className="text-buttonSecondary text-2xl font-bold">
                {status?.servingNow?.number || '---'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-textSecondary text-[10px] uppercase">
                Service Counter
              </Text>
              {status?.token?.counter?.status === 'paused' ? (
                <Text className="text-red-400 text-sm font-bold uppercase">
                  Paused
                </Text>
              ) : (
                <Text className="text-textPrimary text-2xl font-bold">
                  {status?.token?.counter?.number || '...'}
                </Text>
              )}
            </View>
          </View>

          <View className="space-y-6">
            <View className="flex-row items-center bg-background p-4 rounded-xl border border-stone-800">
              <Users color="#9A3412" size={24} />
              <View className="ml-4">
                <Text className="text-textSecondary text-[10px] uppercase">
                  Waiting Count
                </Text>
                <Text className="text-textPrimary text-lg font-bold">
                  {status?.ahead ?? '--'} Students
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-background p-4 rounded-xl border border-stone-800">
              <Clock color="#C2410C" size={24} />
              <View className="ml-4">
                <Text className="text-textSecondary text-[10px] uppercase">
                  Estimated Time
                </Text>
                <Text className="text-textPrimary text-lg font-bold">
                  {status?.wait ?? '--'} mins
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-8 p-4 rounded-xl flex-row items-center">
            <ShieldAlert color="#FDBA74" size={20} />
            <Text className="text-textSecondary text-xs ml-3">
              We'll notify you when 5 students are ahead of you. Keep the app open for
              live updates.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row space-x-4 mt-8 mb-10">
          <TouchableOpacity
            onPress={fetchStatus}
            className="flex-1 bg-card border border-stone-800 py-4 rounded-xl items-center flex-row justify-center">
            <RefreshCw color="#D6D3D1" size={18} />
            <Text className="text-textSecondary font-bold ml-2">Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 border py-4 rounded-xl items-center flex-row justify-center">
            <XCircle color="#f87171" size={18} />
            <Text className="text-red-400 font-bold ml-2">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveQueueScreen;
