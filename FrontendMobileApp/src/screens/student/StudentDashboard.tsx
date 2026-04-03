import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import {setActiveToken as setReduxToken} from '../../store/slices/tokenSlice';
import {useNavigation} from '@react-navigation/native';
import {
  Clock,
  Users,
  Activity,
  ChevronRight,
  AlertCircle,
  User as UserIcon,
  LayoutDashboard,
  History,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react-native';
import api from '../../services/api';

const StudentDashboard = () => {
  const {user} = useAppSelector(state => state.auth);
  const {activeToken} = useAppSelector(state => state.tokens);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user?.token) {
      return;
    }
    try {
      const [tokenRes, servicesRes] = await Promise.all([
        api.get('/tokens/status'),
        api.get('/services'),
      ]);
      dispatch(setReduxToken(tokenRes.data));
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-textSecondary text-sm">Welcome back,</Text>
          <Text className="text-textPrimary text-2xl font-bold">
            {user?.name || 'Student'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          className="w-12 h-12 bg-card rounded-2xl items-center justify-center border border-stone-800 overflow-hidden shadow-sm">
          {user?.profilePhoto ? (
            <Image
              source={{uri: user.profilePhoto}}
              className="w-full h-full"
            />
          ) : (
            <UserIcon color="#C2410C" size={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* Role Badge & Section Summary */}
      <View className="flex-row items-center mb-6">
        <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex-row items-center">
          <GraduationCap color="#C2410C" size={12} />
          <Text className="text-primary text-[10px] font-black uppercase ml-1.5 tracking-widest">
            {user?.role}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('SectionInfo')}
          className="ml-3 bg-stone-900/50 px-3 py-1 rounded-full border border-stone-800 flex-row items-center">
          <ShieldCheck color="#78716C" size={12} />
          <Text className="text-textSecondary text-[10px] font-bold ml-1.5">
            {user?.section?.name || 'Not Assigned'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Token Card */}
      {activeToken ? (
        <View className=" border rounded-2xl p-5 mb-8 ">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary font-bold uppercase tracking-widest text-xs">
              Active Token
            </Text>
            <View
              className={`bg-primary px-2 py-1 rounded ${
                activeToken.status === 'serving' ? 'bg-green-600' : 'bg-primary'
              }`}>
              <Text className="text-white text-[10px] font-bold">
                {activeToken.status === 'serving' ? 'IN PROGRESS' : 'WAITING'}
              </Text>
            </View>
          </View>

          <View className="items-center py-2">
            <Text className="text-textSecondary text-xs">Token Number</Text>
            <Text className="text-textPrimary text-5xl font-extrabold my-1">
              {activeToken.number}
            </Text>
            <View className="flex-row items-center mt-2">
              <Clock color="#C2410C" size={14} />
              <Text className="text-textSecondary text-xs ml-1">
                Est. Time: {activeToken.estimatedWaitTime || '--'} mins
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-6 pt-4 border-t ">
            <View className="items-center flex-1">
              <Text className="text-textSecondary text-[10px] uppercase">
                Service
              </Text>
              <Text
                className="text-textPrimary font-bold text-xs"
                numberOfLines={1}>
                {activeToken.service?.name}
              </Text>
            </View>
            <View className="items-center flex-1 border-x ">
              <Text className="text-textSecondary text-[10px] uppercase">
                Counter
              </Text>
              <Text className="text-textPrimary font-bold text-xs">
                {activeToken.counter?.number || '--'}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-textSecondary text-[10px] uppercase">
                Position
              </Text>
              <Text className="text-textPrimary font-bold text-xs">
                {activeToken.queuePosition || '0'} Ahead
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="bg-card border border-stone-800 rounded-2xl p-8 mb-8 items-center justify-center">
          <Text className="text-textSecondary text-sm mb-2">
            You have no active tokens
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ServiceSelection')}
            className=" px-6 py-2 rounded-full border ">
            <Text className="text-primary font-bold">Book a Service</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions / Active Queues */}
      <Text className="text-textPrimary text-lg font-bold mb-4">
        Current Services
      </Text>

      <View className="space-y-4">
        {services.length > 0 ? (
          services.slice(0, 3).map((item, i) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => navigation.navigate('ServiceSelection')}
              className="bg-card rounded-3xl p-5 flex-row items-center border border-stone-800 mb-4 shadow-sm">
              <View className="w-12 h-12 bg-background rounded-2xl items-center justify-center mr-4 border border-stone-800/50">
                <Users color={i % 2 === 0 ? '#C2410C' : '#78716C'} size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-bold text-base">
                  {item.name}
                </Text>
                <Text className="text-textSecondary text-xs">
                  {item.count || 0} students waiting
                </Text>
              </View>
              <View className="items-end">
                <View className="bg-stone-900 px-2 py-0.5 rounded-md mb-1">
                  <Text className="text-primary font-black text-[9px] uppercase tracking-tighter">
                    {item.estimatedTimePerToken}m
                  </Text>
                </View>
                <ChevronRight color="#44403C" size={18} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-card/30 border border-stone-800 border-dashed rounded-3xl p-10 items-center">
            <LayoutDashboard color="#44403C" size={40} />
            <Text className="text-textSecondary text-xs mt-3 text-center uppercase font-black tracking-widest opacity-50">
              No Active Services
            </Text>
          </View>
        )}
      </View>

      {/* Grid Utility */}
      <View className="flex-row gap-4 mt-8 mb-12">
        <TouchableOpacity
          onPress={() => navigation.navigate('SectionInfo')}
          className="flex-1 bg-card rounded-[32px] p-6 border border-stone-800 items-center">
          <View className="w-10 h-10 bg-blue-500/10 rounded-2xl items-center justify-center mb-3">
            <ShieldCheck color="#3b82f6" size={20} />
          </View>
          <Text className="text-textPrimary font-bold text-xs uppercase tracking-widest">
            My Section
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('History')}
          className="flex-1 bg-card rounded-[32px] p-6 border border-stone-800 items-center">
          <View className="w-10 h-10 bg-emerald-500/10 rounded-2xl items-center justify-center mb-3">
            <History color="#10b981" size={20} />
          </View>
          <Text className="text-textPrimary font-bold text-xs uppercase tracking-widest">
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Alerts Space (Empty for now until real alerts are added) */}
      <View className="mb-10" />
    </ScrollView>
  );
};

export default StudentDashboard;
