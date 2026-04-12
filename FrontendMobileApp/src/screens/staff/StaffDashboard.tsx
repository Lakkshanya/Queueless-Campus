import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import {updateUser} from '../../store/slices/authSlice';
import {
  LogOut,
  Clock,
  Monitor,
  Activity,
  Zap,
  Users,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  Circle,
} from 'lucide-react-native';
import {useAuth} from '../../context/AuthContext';
import api from '../../services/api';

const AssignedNodeCard = ({serviceName, counterNumber, timeLimit, isAssigned, isOnline, onToggle}: any) => {
  if (!isAssigned) {
    return (
      <View 
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}
        className="bg-[#171412] rounded-[48px] p-10 border-2 border-dashed border-stone-800 mb-10 items-center justify-center py-20"
      >
        <Monitor color="#292524" size={64} strokeWidth={1} className="mb-6" />
        <Text className="text-stone-700 text-xl font-black uppercase tracking-[0.2em] mb-4 text-center leading-none">Terminal_Standby</Text>
        <Text className="text-stone-800 text-[10px] font-black uppercase tracking-widest text-center px-8 leading-relaxed">
          Waiting for administrative assignment protocol. Please remain available for grid allocation.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-[#171412] rounded-[56px] p-10 border border-stone-800/60 mb-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden">
      <View className="absolute top-0 right-0 w-48 h-48 bg-orange-600/[0.03] rounded-full -mr-24 -mt-24 pointer-events-none" />
      
      <View className="flex-row justify-between items-start mb-10">
         <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-3">
               <Activity color="#EA580C" size={12} strokeWidth={3} />
               <Text className="text-orange-600 text-[9px] font-black uppercase tracking-[0.4em]">Active_Allocation</Text>
            </View>
            <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter leading-none">{serviceName}</Text>
         </View>
         <TouchableOpacity 
           onPress={onToggle}
           className={`px-6 py-2.5 rounded-full border-2 flex-row items-center ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <View className={`w-2 h-2 rounded-full mr-3 ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
            <Text className={`font-black text-[9px] uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
              {isOnline ? 'LIVE' : 'BREAK'}
            </Text>
         </TouchableOpacity>
      </View>

      <View className="flex-row gap-x-6">
        <View className="flex-1 bg-[#0C0A09] p-8 rounded-[40px] border border-stone-800/80 shadow-inner relative overflow-hidden">
          <View className="absolute -top-4 -right-4 bg-orange-600/5 w-16 h-16 rounded-full" />
          <Monitor color="#EA580C" size={20} strokeWidth={3} className="mb-4" />
          <Text className="text-stone-600 text-[8px] font-black uppercase tracking-widest mb-1.5 leading-none">Terminal ID</Text>
          <Text className="text-textPrimary text-3xl font-black tabular-nums tracking-tighter">-{counterNumber.toString().padStart(2, '0')}</Text>
        </View>
        <View className="flex-1 bg-[#0C0A09] p-8 rounded-[40px] border border-stone-800/80 shadow-inner relative overflow-hidden">
          <View className="absolute -top-4 -right-4 bg-orange-600/5 w-16 h-16 rounded-full" />
          <Clock color="#EA580C" size={20} strokeWidth={3} className="mb-4" />
          <Text className="text-stone-600 text-[8px] font-black uppercase tracking-widest mb-1.5 leading-none">Sync_Limit</Text>
          <Text className="text-textPrimary text-3xl font-black tabular-nums tracking-tighter">{timeLimit}<Text className="text-xs text-stone-800 ml-1">M</Text></Text>
        </View>
      </View>

      <View className="mt-10 pt-10 border-t border-stone-800/40 flex-row items-center justify-between px-2">
         <View className="flex-row items-center gap-4">
            <ShieldCheck color="#EA580C" size={18} strokeWidth={2.5} />
            <Text className="text-stone-500 text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Session Active</Text>
         </View>
         <Zap color="#292524" size={18} />
      </View>
    </View>
  );
};

const StaffDashboard = ({navigation}: any) => {
  const {user} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const {logout} = useAuth();
  const [stats, setStats] = useState({served: 0, pending: 0});
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tokens/staff/today-stats');
        setStats(response.data);
      } catch (e) {
        console.error('Failed to fetch staff metrics');
      }
    };
    fetchStats();
    const inv = setInterval(fetchStats, 60000);
    return () => clearInterval(inv);
  }, []);

  const handleToggleStatus = async () => {
    try {
      const newStatus = !isOnline;
      await api.post('/auth/staff-status', {isOnline: newStatus});
      setIsOnline(newStatus);
    } catch (e) {
      Alert.alert('System Error', 'Failed to synchronize operational status.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-16">
          <View>
            <View className="flex-row items-center gap-2 mb-3">
               <View className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
               <Text className="text-stone-600 text-[10px] font-black uppercase tracking-[0.5em]">OPERATOR_CONSOLE</Text>
            </View>
            <Text className="text-textPrimary text-4xl font-black tracking-tighter leading-none uppercase">
              Agent {user?.name?.split(' ')[0] || 'Unknown'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800 shadow-inner active:scale-90 transition-transform">
            <LogOut color="#EA580C" size={22} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <AssignedNodeCard 
          serviceName={user?.assignedService?.name || 'Departmental Node'}
          counterNumber={user?.assignedCounter ? user.assignedCounter : 'N/A'}
          timeLimit={user?.assignedService?.timePerStudent || '15'}
          isAssigned={!!user?.assignedCounter}
          isOnline={isOnline}
          onToggle={handleToggleStatus}
        />

        {!!user?.assignedCounter && (
          <>
            <View className="flex-row gap-x-6 mb-12">
               <View className="flex-1 bg-[#171412] border border-stone-800/60 rounded-[40px] p-8 items-center relative overflow-hidden">
                  <View className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full -mr-12 -mt-12" />
                  <Text className="text-textPrimary text-4xl font-black tabular-nums tracking-tighter mb-2">{stats.served}</Text>
                  <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest leading-none">Processed_Units</Text>
               </View>
               <View className="flex-1 bg-[#171412] border border-stone-800/60 rounded-[40px] p-8 items-center relative overflow-hidden">
                  <View className="absolute top-0 right-0 w-24 h-24 bg-orange-600/[0.02] rounded-full -mr-12 -mt-12" />
                  <Text className="text-orange-600 text-4xl font-black tabular-nums tracking-tighter mb-2">{stats.pending.toString().padStart(2, '0')}</Text>
                  <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest leading-none">Waiting_In_Grid</Text>
               </View>
            </View>

            <View className="space-y-6 mb-40">
              <View className="mb-8">
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Queue Handling')}
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 15 }}
                  className="bg-[#171412] rounded-[40px] p-8 flex-row items-center border border-stone-800/60 active:scale-[0.98] transition-all">
                <View className="w-16 h-16 bg-[#0C0A09] rounded-3xl items-center justify-center border border-orange-600/20 mr-6 shadow-inner">
                   <Zap color="#EA580C" size={28} strokeWidth={2.5} fill="#EA580C" fillOpacity={0.1} />
                </View>
                <View className="flex-1">
                  <Text className="text-textPrimary font-black text-lg uppercase tracking-tighter mb-1">Queue Management</Text>
                  <Text className="text-stone-600 text-[10px] font-bold uppercase tracking-widest leading-none">Initialize operator workflow</Text>
                </View>
                <ChevronRight color="#292524" size={20} strokeWidth={3} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="bg-[#171412] rounded-[40px] p-8 flex-row items-center border border-stone-800/60 opacity-50">
                <View className="w-16 h-16 bg-[#0C0A09] rounded-3xl items-center justify-center border border-stone-800 mr-6">
                   <ShieldCheck color="#78716C" size={28} />
                </View>
                <View className="flex-1">
                  <Text className="text-stone-400 font-black text-lg uppercase tracking-tighter mb-1">Security Audit</Text>
                  <Text className="text-stone-700 text-[10px] font-bold uppercase tracking-widest leading-none">Protocol logs & session history</Text>
                </View>
                <ChevronRight color="#292524" size={20} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffDashboard;
