import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store';
import {clearAuth} from '../../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Activity,
  Zap,
  Monitor,
  Clock,
} from 'lucide-react-native';
import api from '../../services/api';

const StaffProfileScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({served: 0, active: 0});
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/tokens/staff/today-stats');
      setStats(response.data);
    } catch (e) {
      console.error('Failed to fetch staff metrics');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleLogout = () => {
    Alert.alert('Protocol Termination', 'Terminate operational session and clear local authorization?', [
      {text: 'Maintain Link', style: 'cancel'},
      {
        text: 'Terminate',
        style: 'destructive',
        onPress: () => {
          dispatch(clearAuth());
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }>
        <View className="px-6 pt-10">
            {/* Header */}
            <View className="items-center mt-8 mb-16">
                <View className="w-32 h-32 bg-[#171412] rounded-[48px] border-2 border-orange-600/30 items-center justify-center shadow-2xl overflow-hidden relative">
                    <View className="absolute top-0 right-0 w-16 h-16 bg-orange-600/5 rounded-full -mr-8 -mt-8" />
                    <User color="#EA580C" size={48} strokeWidth={1} />
                </View>
                
                <View className="items-center mt-8">
                    <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter leading-none mb-3">
                        Operator_{user?.name?.split(' ')[0] || 'Unknown'}
                    </Text>
                    <Text className="text-stone-600 text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-6">
                        {user?.email}
                    </Text>
                    
                    <View className="bg-orange-600/10 px-5 py-2 rounded-full border border-orange-600/20 flex-row items-center">
                        <ShieldCheck color="#EA580C" size={14} strokeWidth={2.5} />
                        <Text className="text-orange-600 text-[9px] font-black uppercase tracking-widest ml-3">
                            AUTHORIZED_{user?.role?.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Performance Metrics */}
            <View className="flex-row gap-6 mb-12">
               <View className="flex-1 bg-[#171412] rounded-[48px] p-8 border border-stone-800/60 shadow-2xl relative overflow-hidden">
                  <View className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full -mr-12 -mt-12" />
                  <Activity color="#10B981" size={18} strokeWidth={2.5} className="mb-4" />
                  <Text className="text-textPrimary text-4xl font-black tabular-nums tracking-tighter mb-2">{stats.served}</Text>
                  <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest leading-none">Processed_Total</Text>
               </View>
               <View className="flex-1 bg-[#171412] rounded-[48px] p-8 border border-stone-800/60 shadow-2xl relative overflow-hidden">
                  <View className="absolute top-0 right-0 w-24 h-24 bg-orange-600/[0.02] rounded-full -mr-12 -mt-12" />
                  <Zap color="#EA580C" size={18} strokeWidth={2.5} className="mb-4" />
                  <Text className="text-orange-600 text-4xl font-black tabular-nums tracking-tighter mb-2">{stats.active || '00'}</Text>
                  <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest leading-none">Active_Grid</Text>
               </View>
            </View>

            <View className="bg-[#171412] rounded-[48px] p-10 border border-stone-800/60 mb-12 shadow-2xl">
               <View className="flex-row items-center gap-3 mb-8 px-2">
                  <Monitor color="#EA580C" size={16} strokeWidth={2.5} />
                  <Text className="text-stone-500 text-[10px] font-black uppercase tracking-[0.5em]">OPERATIONAL_SYNC</Text>
               </View>

               <View className="space-y-6">
                  <View className="flex-row justify-between items-center py-2 border-b border-stone-800/40">
                     <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest">Department</Text>
                     <Text className="text-textPrimary text-xs font-black uppercase tracking-tighter">{user?.department || 'Node Unknown'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-2 border-b border-stone-800/40">
                     <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest">Linked Unit</Text>
                     <Text className="text-orange-600 text-xs font-black uppercase tracking-tighter">TERM-{user?.assignedCounter?.number?.toString().padStart(2, '0') || 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-2">
                     <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest">Grid Status</Text>
                     <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <Text className="text-emerald-500 text-xs font-black uppercase tracking-tighter">ONLINE</Text>
                     </View>
                  </View>
               </View>
            </View>

            <View className="space-y-6 mb-20">
                <TouchableOpacity
                    className="bg-red-950/10 rounded-[40px] p-8 flex-row items-center border border-red-950/20 active:scale-[0.98] transition-all shadow-2xl relative overflow-hidden"
                    onPress={handleLogout}>
                    <View className="absolute top-0 left-0 w-1.5 h-full bg-red-900/40" />
                    <View className="w-16 h-16 bg-[#0C0A09] rounded-3xl items-center justify-center border border-stone-800 mr-6 shadow-inner">
                        <LogOut color="#ef4444" size={24} strokeWidth={2.5} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-red-500 font-black text-lg uppercase tracking-tighter mb-1">Terminate Session</Text>
                        <Text className="text-red-900/60 text-[10px] font-bold uppercase tracking-widest leading-none">Clear operational grid link</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffProfileScreen;
