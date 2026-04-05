import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store';
import {clearAuth} from '../../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
  GraduationCap,
} from 'lucide-react-native';
import api from '../../services/api';

const ProfileScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({served: 0, missed: 0});
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/tokens/stats');
      setStats(response.data);
    } catch (e) {
      console.error('Failed to fetch stats', e);
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
    Alert.alert('Logout', 'Are you sure you want to end your session?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(clearAuth());
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#C2410C"
        />
      }>
      <View className="items-center mb-8">
        <View className="relative">
          <View className="w-24 h-24 bg-stone-800 rounded-full border-2 border-primary items-center justify-center overflow-hidden">
            <User color="#9A3412" size={50} />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            className="absolute bottom-0 right-0 bg-buttonPrimary p-2 rounded-full border-2 border-background">
            <Edit color="#FFF" size={14} />
          </TouchableOpacity>
        </View>
        <Text className="text-textPrimary text-2xl font-bold mt-4">
          {user?.name}
        </Text>
        <Text className="text-textSecondary text-sm mb-2">{user?.email}</Text>
        
        {user?.role === 'student' && (
          <View className="items-center mt-2 px-4">
            <View className="flex-row items-center mt-3 bg-stone-900/50 px-3 py-1 rounded-full border border-stone-800">
              <GraduationCap color="#C2410C" size={12} />
              <Text className="text-textSecondary text-[10px] font-bold ml-2 uppercase">
                CGPA: {user?.cgpa || '0.00'}
              </Text>
            </View>
          </View>
        )}

        {user?.role === 'staff' && (
          <View className="items-center mt-2 px-4">
             <Text className="text-stone-500 text-[10px] text-center uppercase font-black tracking-[3px] leading-4">
              Staff ID: {user?.staffId || 'STF-001'}
            </Text>
            <View className="flex-row items-center mt-3 bg-stone-900/50 px-4 py-1 rounded-full border border-stone-800">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-textSecondary text-[10px] font-bold uppercase">
                {user?.position || 'Academic Staff'}
              </Text>
            </View>
          </View>
        )}

        <View className="bg-primary/10 px-4 py-1.5 rounded-full mt-4 border border-primary/20">
          <Text className="text-primary text-[10px] font-black uppercase tracking-[2px]">
            {user?.role || 'STUDENT'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-8 gap-x-4">
        <View className="bg-[#1C1917] flex-1 p-5 rounded-2xl items-center border border-stone-800 shadow-xl">
          <Text className="text-primary text-3xl font-black tracking-tighter">{stats.served || 0}</Text>
          <Text className="text-stone-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Processed
          </Text>
        </View>
        <View className="bg-[#1C1917] flex-1 p-5 rounded-2xl items-center border border-stone-800 shadow-xl">
          <Text className="text-buttonSecondary text-3xl font-black tracking-tighter">
            {stats.missed || 0}
          </Text>
          <Text className="text-stone-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Missed
          </Text>
        </View>
      </View>

      <View className="space-y-4">
        {[
          {
            label: 'Account Settings',
            icon: <Settings color="#D6D3D1" size={20} />,
            screen: 'Settings',
          },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => item.screen && navigation.navigate(item.screen)}
            className="bg-[#1C1917] rounded-3xl p-5 flex-row items-center justify-between border border-stone-800 mb-4 active:scale-95 transition-transform shadow-lg">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-stone-900 rounded-full items-center justify-center border border-stone-800 mr-4 shadow-sm">
                {item.icon}
              </View>
              <Text className="text-textPrimary font-bold text-[15px]">{item.label}</Text>
            </View>
            <ChevronRight color="#44403C" size={18} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          className="bg-red-500/10 rounded-3xl p-5 flex-row items-center border border-red-500/20 mt-6 active:scale-95 transition-transform shadow-lg"
          onPress={handleLogout}>
          <View className="w-12 h-12 bg-stone-900 rounded-full items-center justify-center border border-stone-800 mr-4 shadow-sm">
            <LogOut color="#ef4444" size={20} />
          </View>
          <Text className="text-red-500 font-bold text-[15px]">Sign Out of Account</Text>
        </TouchableOpacity>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
