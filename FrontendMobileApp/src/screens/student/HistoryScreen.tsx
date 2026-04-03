import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Calendar,
  History,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import api from '../../services/api';
import {useAppSelector} from '../../store';

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const {user} = useAppSelector(state => state.auth);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await api.get('/tokens/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-5">
          <View className="w-10 h-10 bg-card rounded-2xl items-center justify-center border border-stone-800">
            <ChevronLeft color="#D6D3D1" size={24} />
          </View>
        </TouchableOpacity>
        <View>
          <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter">
            Activity
          </Text>
          <Text className="text-stone-500 text-[10px] uppercase font-black tracking-widest mt-0.5">
            Your past tokens
          </Text>
        </View>
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
        {loading && (
          <ActivityIndicator color="#C2410C" size="large" className="mt-10" />
        )}

        {history.map(token => (
          <View
            key={token._id}
            className="bg-card rounded-[32px] p-6 mb-6 border border-stone-800 shadow-sm">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View
                  className={
                    'w-12 h-12 rounded-2xl items-center justify-center mr-4 bg-stone-900 border border-stone-800'
                  }>
                  <History
                    color={token.status === 'completed' ? '#10b981' : '#f43f5e'}
                    size={20}
                  />
                </View>
                <View>
                  <Text className="text-textPrimary font-black text-lg tracking-tighter">
                    {token.number}
                  </Text>
                  <Text className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                    {token.service?.name}
                  </Text>
                </View>
              </View>
              <View
                className={`px-3 py-1 rounded-full border ${
                  token.status === 'completed'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                <Text
                  className={`text-[9px] font-black uppercase tracking-widest ${
                    token.status === 'completed'
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}>
                  {token.status}
                </Text>
              </View>
            </View>

            <View className="space-y-3 bg-stone-900/30 p-4 rounded-2xl border border-stone-800/50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar color="#78716C" size={14} />
                  <Text className="text-textSecondary text-[11px] font-bold ml-2">
                    Booked On
                  </Text>
                </View>
                <Text className="text-textPrimary text-[11px] font-black">
                  {formatDate(token.bookedAt)}
                </Text>
              </View>
              {token.servedAt && (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Clock color="#78716C" size={14} />
                    <Text className="text-textSecondary text-[11px] font-bold ml-2">
                      Served At
                    </Text>
                  </View>
                  <Text className="text-emerald-500 text-[11px] font-black">
                    {formatDate(token.servedAt)}
                  </Text>
                </View>
              )}
            </View>

            {token.status === 'completed' && (
              <TouchableOpacity className="mt-6 flex-row justify-between items-center bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
                <View className="flex-row items-center">
                  <CheckCircle color="#C2410C" size={16} />
                  <Text className="text-primary text-[10px] font-black uppercase tracking-widest ml-2">
                    Service Rated
                  </Text>
                </View>
                <Text className="text-primary text-xs font-black">
                  EXCELLENT
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {!loading && history.length === 0 && (
          <View className="mt-20 items-center bg-card/50 p-10 rounded-[40px] border border-stone-800 border-dashed">
            <History color="#44403C" size={64} />
            <Text className="text-textPrimary text-lg font-black mt-6 uppercase tracking-widest">
              No Past Tokens
            </Text>
            <Text className="text-textSecondary text-xs mt-2 text-center leading-5 uppercase tracking-[2px]">
              You haven't completed any campus services yet. Start by booking a
              token!
            </Text>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
