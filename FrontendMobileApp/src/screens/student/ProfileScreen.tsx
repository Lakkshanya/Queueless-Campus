import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store';
import {clearAuth} from '../../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import {
  User,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Award,
  Edit,
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
      {/* ... header remains same ... */}
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
        <Text className="text-textSecondary text-sm">{user?.email}</Text>
        {user?.role === 'student' && (
          <View className="items-center mt-3">
            <Text className="text-stone-500 text-[10px] items-center uppercase font-black tracking-[4px]">
              {user?.collegeId || '---'} • {user?.department || 'N/A'} • Year{' '}
              {user?.yearOfStudy || '-'}
            </Text>
          </View>
        )}
        <View className=" px-3 py-1 rounded-full mt-2 border ">
          <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">
            {user?.role || 'STUDENT'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-8">
        <View className="bg-card flex-1 p-4 rounded-xl items-center mr-2 border border-stone-800">
          <Text className="text-primary text-xl font-bold">{stats.served}</Text>
          <Text className="text-textSecondary text-[10px] uppercase">
            Served
          </Text>
        </View>
        <View className="bg-card flex-1 p-4 rounded-xl items-center ml-2 border border-stone-800">
          <Text className="text-buttonSecondary text-xl font-bold">
            {stats.missed}
          </Text>
          <Text className="text-textSecondary text-[10px] uppercase">
            Missed
          </Text>
        </View>
      </View>

      <View className="space-y-4">
        {[
          {
            label: 'My History',
            icon: <History color="#D6D3D1" size={20} />,
            screen: 'History',
          },
          {
            label: 'Academic Records',
            icon: <Award color="#D6D3D1" size={20} />,
            screen: 'Records',
          },
          {
            label: 'Document Records',
            icon: <User color="#D6D3D1" size={20} />,
            screen: 'Documents',
          },
          {
            label: 'Account Settings',
            icon: <Settings color="#D6D3D1" size={20} />,
            screen: 'Settings',
          },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => item.screen && navigation.navigate(item.screen)}
            className="bg-card rounded-xl p-4 flex-row items-center justify-between border border-stone-800 mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-background rounded-lg items-center justify-center mr-4">
                {item.icon}
              </View>
              <Text className="text-textPrimary font-bold">{item.label}</Text>
            </View>
            <ChevronRight color="#44403C" size={18} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          className=" rounded-xl p-4 flex-row items-center border mt-6"
          onPress={handleLogout}>
          <View className="w-10 h-10 bg-background rounded-lg items-center justify-center mr-4">
            <LogOut color="#f87171" size={20} />
          </View>
          <Text className="text-red-400 font-bold">Logout</Text>
        </TouchableOpacity>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
