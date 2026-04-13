import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import {updateUser} from '../../store/slices/authSlice';
import {
  LogOut,
  Monitor,
  Activity,
  Zap,
  Users,
  ChevronRight,
  Circle,
  LayoutDashboard,
} from 'lucide-react-native';
import {useAuth} from '../../context/AuthContext';
import api from '../../services/api';

const AssignedServiceCard = ({
  serviceName,
  counterNumber,
  staffName,
  liveTokens,
  maxTokens,
  isAssigned,
  isOnline,
  venue,
  onToggle,
}: any) => {
  if (!isAssigned) {
    return (
      <View style={styles.cardShadow}>
        <View className="bg-[#171412] rounded-[48px] p-10 border-2 border-dashed border-stone-800 items-center justify-center py-24 mb-10 overflow-hidden relative">
          <View className="absolute top-0 right-0 w-80 h-80 bg-orange-600/[0.02] blur-3xl rounded-full" />
          <View className="w-24 h-24 bg-stone-900/50 rounded-3xl flex items-center justify-center mb-8 border border-stone-800">
            <Monitor color="#292524" size={40} strokeWidth={1.5} />
          </View>
          <Text className="text-stone-700 text-3xl font-bold tracking-tight mb-4 text-center leading-none uppercase">
            Standby Mode
          </Text>
          <View className="bg-orange-600/5 px-6 py-2 rounded-full border border-orange-600/10 mb-8">
            <Text className="text-orange-600 text-[10px] font-bold tracking-tight uppercase">
              Awaiting Administrative Link
            </Text>
          </View>
          <Text className="text-stone-800 text-xs font-bold tracking-tight text-center px-12 leading-relaxed opacity-60">
            Dashboard linkage is inactive. Return to settings or wait for administrative station allocation to initialize processing.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardShadow}>
      <View className="bg-[#171412] rounded-[48px] p-8 border border-stone-800/60 relative overflow-hidden mb-10">
        <View className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/[0.04] blur-[100px] rounded-full pointer-events-none" />
        
        <View className="flex-col mb-12">
          <View className="flex-row justify-between items-start mb-10">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center gap-3 mb-4">
                <Activity color="#EA580C" size={16} strokeWidth={3} />
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest uppercase">
                  Active Station
                </Text>
              </View>
              <Text className="text-white text-3xl font-bold tracking-tight leading-tight mb-2">
                {serviceName}
              </Text>
              <Text className="text-stone-600 text-[11px] font-semibold tracking-tight italic opacity-70">
                Assigned to {staffName}
              </Text>
              {venue && (
                <View className="mt-6 flex-row items-center bg-orange-600/10 px-5 py-2.5 border border-orange-600/20 rounded-full self-start">
                  <Text className="text-orange-600 text-[11px] font-bold tracking-tight uppercase">{venue}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              onPress={onToggle}
              className={`px-6 py-3 rounded-2xl border-2 flex-row items-center ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
               <View className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
               <Text className={`font-bold tracking-tight text-[11px] uppercase ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isOnline ? 'Live' : 'Break'}
               </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-6">
            <View style={styles.innerCardShadow} className="flex-1">
              <View className="bg-[#0C0A09] rounded-[32px] p-6 border border-stone-800/80 items-center justify-center relative overflow-hidden">
                <View className="absolute -top-6 -right-6 bg-orange-600/5 w-20 h-20 rounded-full blur-xl" />
                <Monitor color="#EA580C" size={20} strokeWidth={2.5} className="mb-3" />
                <Text className="text-stone-600 text-[9px] font-bold tracking-tight mb-2 uppercase opacity-70">
                  Workstation ID
                </Text>
                <Text className="text-white text-2xl font-bold tracking-tight tabular-nums">
                  {counterNumber.toString().padStart(2, '0')}
                </Text>
              </View>
            </View>

            <View style={styles.innerCardShadow} className="flex-1">
              <View className="bg-[#0C0A09] rounded-[32px] p-6 border border-stone-800/80 items-center justify-center relative overflow-hidden">
                <View className="absolute -top-6 -right-6 bg-orange-600/5 w-20 h-20 rounded-full blur-xl" />
                <Users color="#EA580C" size={20} strokeWidth={2.5} className="mb-3" />
                <Text className="text-stone-600 text-[9px] font-bold tracking-tight mb-2 uppercase opacity-70">
                  Queue Density
                </Text>
                <Text className="text-white text-2xl font-bold tracking-tight tabular-nums">
                  {liveTokens}<Text className="text-xs text-stone-800 ml-1 font-medium">/{maxTokens}</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const TokenStatsBar = ({ completed, remaining }: { completed: number; remaining: number }) => {
  const total = completed + remaining;
  const progress = total === 0 ? 0 : (completed / total) * 100;
  
  return (
    <View style={styles.cardShadow} className="mb-10">
      <View className="bg-[#171412] rounded-[48px] p-8 border border-stone-800/60 overflow-hidden relative shadow-2xl">
        <View className="flex-row justify-between items-end mb-8 px-1">
          <View>
            <Text className="text-stone-700 text-[11px] font-bold tracking-widest mb-4 uppercase opacity-60">
              Shift Progress
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-6xl font-bold tracking-tight leading-none bg-clip-text">
                {completed}
              </Text>
              <Text className="text-stone-600 text-[11px] font-bold tracking-tight ml-4 uppercase opacity-40">
                Served Today
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-orange-600 text-4xl font-bold tracking-tight leading-none">
              {remaining}
            </Text>
            <Text className="text-stone-700 text-[10px] font-bold tracking-tight uppercase mt-3 opacity-60 px-4 py-1.5 border border-stone-800 rounded-full">
              Waiting in Line
            </Text>
          </View>
        </View>
        
        <View className="w-full h-4 bg-[#0C0A09] rounded-full border border-stone-800/60 overflow-hidden shadow-inner">
          <View
            className="h-full bg-orange-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </View>
        
        <View className="flex-row justify-between items-center mt-6 px-2">
          <Text className="text-stone-800 text-[10px] font-bold tracking-tight uppercase bg-stone-900/50 px-4 py-1.5 rounded-xl border border-stone-800">
            Efficiency: {Math.round(progress)}%
          </Text>
          <View className="flex-row items-center gap-2 bg-orange-600/10 px-4 py-1.5 rounded-xl border border-orange-600/20">
            <Zap color="#EA580C" size={12} strokeWidth={3} />
            <Text className="text-orange-600 text-[10px] font-bold tracking-tight uppercase">
              System Active
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const StaffDashboard = ({ navigation }: any) => {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { logout } = useAuth();
  const [stats, setStats] = useState({ served: 0, pending: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const [statsRes, profileRes] = await Promise.all([
        api.get('/counters/my-counter'),
        api.get('/auth/me'),
      ]);
      setStats({
        served: statsRes.data.stats?.todayTotal || 0,
        pending: statsRes.data.waitingTokens?.length || 0,
      });
      if (profileRes.data) {
        dispatch(updateUser(profileRes.data));
      }
    } catch (e) {
      console.error('Failed to sync operator data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    const inv = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(inv);
  }, []);

  const handleToggleStatus = async () => {
    try {
      const newStatus = !isOnline;
      await api.post('/auth/staff-status', { isOnline: newStatus });
      setIsOnline(newStatus);
    } catch (e) {
      Alert.alert('System Error', 'Failed to synchronize operational status.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            tintColor="#EA580C"
          />
        }>
        
        <View className="flex-row justify-between items-center mb-12">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
              <Text className="text-stone-500 text-[10px] font-bold tracking-widest uppercase opacity-60">
                Dashboard
              </Text>
            </View>
            <Text className="text-white text-4xl font-bold tracking-tight leading-tight">
              {user?.name || 'Staff Member'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="w-14 h-14 bg-[#171412] rounded-[22px] items-center justify-center border border-stone-800 active:scale-90 transition-transform shadow-xl">
            <LogOut color="#EA580C" size={22} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <AssignedServiceCard
          serviceName={user?.assignedServices?.[0]?.name || 'Service Node'}
          counterNumber={user?.assignedCounter?.number || user?.assignedCounter || 'N/A'}
          staffName={user?.name || 'Authorized Staff'}
          liveTokens={stats.pending}
          maxTokens={user?.assignedServices?.[0]?.maxTokenLimit || 50}
          isAssigned={!!user?.assignedCounter}
          isOnline={isOnline}
          venue={user?.assignedServices?.[0]?.venue || ''}
          onToggle={handleToggleStatus}
        />

        {!!user?.assignedCounter && (
          <>
            <TokenStatsBar completed={stats.served} remaining={stats.pending} />
            
            <View className="mb-10">
              <TouchableOpacity
                onPress={() => navigation.navigate('Queue Handling')}
                activeOpacity={0.8}
                className="bg-orange-600 rounded-[32px] p-8 flex-row items-center justify-between border border-orange-500 shadow-2xl shadow-orange-600/30">
                <View className="flex-row items-center gap-5">
                  <View className="bg-white/20 p-3.5 rounded-2xl">
                    <Activity color="#FFF" size={24} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-white font-bold tracking-tight text-lg mb-0.5 uppercase">
                      Queue Handling
                    </Text>
                    <Text className="text-orange-100 text-[10px] font-semibold tracking-tight opacity-80 uppercase">
                      Initialize active processing matrix
                    </Text>
                  </View>
                </View>
                <ChevronRight color="#FFF" size={24} strokeWidth={3} opacity={0.6} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  innerCardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});

export default StaffDashboard;

