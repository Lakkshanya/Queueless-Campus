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
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store';
import {clearAuth} from '../../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import {
  User,
  LogOut,
  ShieldCheck,
  Activity,
  Zap,
  Monitor,
  Settings,
  ChevronRight,
} from 'lucide-react-native';
import api from '../../services/api';

const StaffProfileScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
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
    Alert.alert(
      'Sign Out Protocol',
      'Are you sure you want to de-authorize this station and end your current session?',
      [
        {text: 'Stay Active', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(clearAuth());
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 150}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }>
        <View className="px-8 pt-4">
          
          {/* Header */}
          <View className="flex-row items-center justify-between mb-12">
            <View>
              <View className="flex-row items-center gap-3 mb-4">
                <ShieldCheck color="#EA580C" size={14} strokeWidth={3} />
                <Text className="text-orange-600 text-[10px] font-bold tracking-widest uppercase opacity-60">
                  Authorized Access
                </Text>
              </View>
              <Text className="text-white text-4xl font-bold tracking-tight leading-none">
                Identity
              </Text>
            </View>
            <TouchableOpacity className="w-16 h-16 bg-[#171412] rounded-[24px] items-center justify-center border border-stone-800 shadow-xl">
              <Settings color="#EA580C" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Identity Card */}
          <View style={styles.cardShadow}>
            <View className="bg-[#171412] rounded-[48px] p-10 border border-stone-800/60 relative overflow-hidden mb-12">
              <View className="absolute top-0 right-0 w-80 h-80 bg-orange-600/[0.03] rounded-full pointer-events-none" />
              
              <View className="items-center mb-12">
                <View style={styles.innerCardShadow}>
                  <View className="w-44 h-44 bg-[#0C0A09] rounded-[48px] border-2 border-orange-600/30 items-center justify-center overflow-hidden">
                    <User color="#EA580C" size={72} strokeWidth={1} />
                  </View>
                </View>
                <Text className="text-white text-4xl font-bold tracking-tight mt-10 text-center leading-none">
                  {user?.name || 'Staff Member'}
                </Text>
                <Text className="text-stone-500 text-xs font-bold tracking-widest opacity-60 mt-4 uppercase">
                  {user?.email}
                </Text>
              </View>

              <View className="bg-orange-600/5 p-8 rounded-[40px] border border-orange-600/10 mb-10">
                <View className="flex-row items-center gap-4 mb-8">
                  <Activity color="#EA580C" size={16} strokeWidth={3} />
                  <Text className="text-orange-600 text-[10px] font-bold tracking-widest uppercase">
                    Authorized Staff Node
                  </Text>
                </View>
                
                <View className="space-y-6">
                  <View className="flex-row justify-between items-center py-3 border-b border-white/5">
                    <Text className="text-stone-700 text-[10px] font-bold tracking-widest uppercase">Department</Text>
                    <Text className="text-white text-sm font-bold tracking-tight">{user?.department || 'Operations'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-3 border-b border-white/5">
                    <Text className="text-stone-700 text-[10px] font-bold tracking-widest uppercase">Workstation ID</Text>
                    <Text className="text-white text-sm font-bold tracking-tight uppercase">
                      TERM-{user?.assignedCounter?.number?.toString().padStart(2, '0') || 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center py-3">
                    <Text className="text-stone-700 text-[10px] font-bold tracking-widest uppercase">Security</Text>
                    <Text className="text-emerald-500 text-sm font-bold tracking-tight">Active Matrix</Text>
                  </View>
                </View>
              </View>

              {/* Operational Metrics */}
              <View className="flex-row gap-6 mb-4">
                <View className="flex-1 bg-[#0C0A09] rounded-[32px] p-8 border border-stone-800 shadow-inner">
                  <Activity color="#10B981" size={20} strokeWidth={2.5} className="mb-4 opacity-70" />
                  <Text className="text-white text-4xl font-bold tracking-tighter mb-2">
                    {stats.served}
                  </Text>
                  <Text className="text-stone-800 text-[9px] font-bold tracking-widest uppercase">
                    Served Today
                  </Text>
                </View>
                <View className="flex-1 bg-[#0C0A09] rounded-[32px] p-8 border border-stone-800 shadow-inner">
                  <Zap color="#EA580C" size={20} strokeWidth={2.5} className="mb-4 opacity-70" />
                  <Text className="text-white text-4xl font-bold tracking-tighter mb-2">
                    {stats.active || '00'}
                  </Text>
                  <Text className="text-stone-800 text-[9px] font-bold tracking-widest uppercase">
                    Stack Density
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Secure Logout */}
          <TouchableOpacity
            style={styles.innerCardShadow}
            onPress={handleLogout}
            activeOpacity={0.8}
            className="bg-red-950/10 rounded-[48px] p-12 flex-row items-center border border-red-900/20 mb-20">
            <View className="w-16 h-16 bg-[#171412] rounded-3xl items-center justify-center border border-stone-800 mr-8">
              <LogOut color="#EF4444" size={28} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-red-500 font-bold tracking-tight text-2xl mb-1 uppercase">
                Account Termination
              </Text>
              <Text className="text-red-900/40 text-[10px] font-bold tracking-widest uppercase">
                End Operational Protocol
              </Text>
            </View>
            <ChevronRight color="#EF4444" size={24} opacity={0.2} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 30},
        shadowOpacity: 0.25,
        shadowRadius: 40,
      },
      android: {
        elevation: 30,
      },
    }),
  },
  innerCardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: {width: 0, height: 15},
        shadowOpacity: 0.15,
        shadowRadius: 25,
      },
      android: {
        elevation: 15,
      },
    }),
  },
});

export default StaffProfileScreen;

