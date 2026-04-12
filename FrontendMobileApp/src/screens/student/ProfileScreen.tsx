import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
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
  ShieldCheck,
  Calendar,
  Layers,
  Activity,
  Zap,
  Award,
} from 'lucide-react-native';
import api from '../../services/api';

const ProfileHeader = ({user}: any) => {
    return (
        <View className="items-center mt-8 mb-12">
            <View className="relative">
                <View className="w-32 h-32 bg-[#171412] rounded-[48px] border-2 border-orange-600/30 items-center justify-center overflow-hidden shadow-2xl shadow-orange-950/20">
                    {user?.profilePhoto ? (
                        <Image source={{uri: user.profilePhoto}} className="w-full h-full" />
                    ) : (
                        <Text className="text-orange-600 text-4xl font-black">{user?.name?.charAt(0)}</Text>
                    )}
                </View>
                <TouchableOpacity
                    className="absolute -bottom-2 -right-2 bg-orange-600 w-12 h-12 rounded-2xl border-4 border-[#0C0A09] items-center justify-center shadow-lg">
                    <Edit color="#FFF" size={16} strokeWidth={3} />
                </TouchableOpacity>
            </View>
            
            <View className="items-center mt-8">
                <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter leading-none mb-3">
                    {user?.name || 'Agent Unknown'}
                </Text>
                <Text className="text-stone-600 text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-6">
                    {user?.email}
                </Text>
                
                <View className="flex-row items-center gap-4">
                    <View className="bg-orange-600/10 px-4 py-1.5 rounded-full border border-orange-600/20 flex-row items-center">
                        <Activity color="#EA580C" size={12} strokeWidth={3} />
                        <Text className="text-orange-600 text-[9px] font-black uppercase tracking-widest ml-2">
                            {user?.role?.toUpperCase() || 'EXTERNAL'}
                        </Text>
                    </View>
                    <View className="bg-stone-900/50 px-4 py-1.5 rounded-full border border-stone-800 flex-row items-center">
                        <Calendar color="#78716C" size={12} strokeWidth={2.5} />
                        <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest ml-2">
                            SINCE_{new Date(user?.createdAt || Date.now()).getFullYear()}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const MetricCard = ({label, value, icon, color}: any) => (
    <View className="bg-[#171412] flex-1 p-8 rounded-[40px] items-center border border-stone-800/80 shadow-2xl relative overflow-hidden">
        {icon}
        <Text className="text-textPrimary text-4xl font-bold tracking-tighter tabular-nums mt-4 leading-none font-serif" style={{ fontFamily: 'Times New Roman' }}>{value}</Text>
        <Text className="text-stone-700 text-[10px] font-black uppercase tracking-[0.3em] mt-3 font-serif" style={{ fontFamily: 'Times New Roman' }}>
            {label}
        </Text>
    </View>
);

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
      console.error('Failed to fetch stats');
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
    Alert.alert('Protocol Termination', 'Do you wish to end the session and clear local authorization?', [
      {text: 'Maintain Session', style: 'cancel'},
      {
        text: 'Terminate',
        style: 'destructive',
        onPress: () => {
          dispatch(clearAuth());
        },
      },
    ]);
  };

  const infoFields = [
    { label: 'Full Personnel Name', value: user?.name || 'Unassigned', icon: <User color="#EA580C" size={14} /> },
    { label: 'Departmental Branch', value: user?.department || 'General Grid', icon: <Building color="#EA580C" size={14} /> },
    { label: 'Academic Year', value: user?.yearOfStudy || 'Pre-Enrolled', icon: <Calendar color="#EA580C" size={14} /> },
    { label: 'Current Semester', value: user?.semester || 'N/A', icon: <Layers color="#EA580C" size={14} /> },
    { label: 'Field Specialization', value: user?.specialization || 'Not Specified', icon: <Activity color="#EA580C" size={14} /> },
    { label: 'Cumulative GPA (Stats)', value: user?.cgpa || '0.00', icon: <Award color="#EA580C" size={14} /> },
  ];

  return (
    <View className="flex-1 bg-[#0C0A09]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }>
        <View className="px-6 pt-16">
            <View className="items-center mt-8 mb-16">
                <View className="w-32 h-32 bg-[#171412] rounded-[48px] border-2 border-orange-600/30 items-center justify-center overflow-hidden shadow-2xl">
                    {user?.profilePhoto ? (
                        <Image source={{uri: user.profilePhoto}} className="w-full h-full" />
                    ) : (
                        <Text className="text-orange-600 text-5xl font-bold font-serif" style={{ fontFamily: 'Times New Roman' }}>{user?.name?.charAt(0)}</Text>
                    )}
                </View>
                <Text className="text-textPrimary text-4xl font-bold uppercase tracking-tighter leading-none mt-10 font-serif" style={{ fontFamily: 'Times New Roman' }}>
                    {user?.name}
                </Text>
                <Text className="text-stone-700 text-[10px] font-black uppercase tracking-[0.5em] mt-4 font-serif" style={{ fontFamily: 'Times New Roman' }}>
                    Grid_Authorized: {user?.role}
                </Text>
            </View>

            <View className="flex-row justify-between mb-16 gap-x-6">
                <MetricCard 
                    label="Tokens Served" 
                    value={stats.served || 0} 
                    icon={<Zap color="#EA580C" size={24} strokeWidth={2.5} />} 
                    color="orange"
                />
                <MetricCard 
                    label="Current CGPA" 
                    value={user?.cgpa || '0.00'} 
                    icon={<Award color="#EA580C" size={24} strokeWidth={2.5} />} 
                    color="orange"
                />
            </View>

            {/* Comprehensive Academic Protocol */}
            <View className="bg-[#171412] rounded-[56px] p-10 border border-stone-800/80 mb-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
               <View className="flex-row items-center gap-4 mb-12 px-2">
                  <GraduationCap color="#EA580C" size={20} strokeWidth={3} />
                  <Text className="text-textPrimary text-sm font-black uppercase tracking-[0.4em] font-serif" style={{ fontFamily: 'Times New Roman' }}>Academic Registry</Text>
               </View>

               <View className="space-y-10">
                  {infoFields.map((field, i) => (
                    <View key={i} className={`flex-row justify-between items-center py-4 ${i !== infoFields.length - 1 ? 'border-b border-stone-800/40' : ''}`}>
                       <View className="flex-row items-center gap-4">
                          <View className="w-8 h-8 rounded-lg bg-stone-900 items-center justify-center border border-stone-800">
                             {field.icon}
                          </View>
                          <Text className="text-stone-700 text-[10px] font-black uppercase tracking-widest font-serif" style={{ fontFamily: 'Times New Roman' }}>{field.label}</Text>
                       </View>
                       <Text className="text-textPrimary text-sm font-bold uppercase tracking-tighter text-right font-serif" style={{ fontFamily: 'Times New Roman' }}>{field.value}</Text>
                    </View>
                  ))}
               </View>
            </View>

            <View className="space-y-6 mb-20">
                <View className="flex-row items-center gap-3 mb-4 px-2">
                    <Settings color="#292524" size={16} strokeWidth={2.5} />
                    <Text className="text-stone-700 text-[10px] font-black uppercase tracking-[0.5em]">System_Controls</Text>
                </View>

                {[
                {
                    label: 'Security & Access',
                    icon: <ShieldCheck color="#EA580C" size={24} strokeWidth={2} />,
                    sub: 'Update credentials and two-factor sync',
                    screen: 'Settings',
                },
                ].map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => item.screen && navigation.navigate(item.screen)}
                        className="bg-[#171412] rounded-[40px] p-8 flex-row items-center justify-between border border-stone-800/60 shadow-2xl active:scale-[0.98] transition-all">
                        <View className="flex-row items-center flex-1">
                            <View className="w-16 h-16 bg-[#0C0A09] rounded-[24px] items-center justify-center border border-stone-800 mr-6 shadow-inner">
                                {item.icon}
                            </View>
                            <View className="flex-1">
                                <Text className="text-textPrimary font-black text-lg uppercase tracking-tighter mb-1">{item.label}</Text>
                                <Text className="text-stone-600 text-[10px] font-bold uppercase tracking-widest leading-none" numberOfLines={1}>{item.sub}</Text>
                            </View>
                        </View>
                        <ChevronRight color="#292524" size={20} strokeWidth={3} />
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    className="bg-red-950/10 rounded-[40px] p-8 flex-row items-center border border-red-950/20 mt-10 active:scale-[0.98] transition-all shadow-2xl relative overflow-hidden"
                    onPress={handleLogout}>
                    <View className="absolute top-0 left-0 w-1.5 h-full bg-red-900/40" />
                    <View className="w-16 h-16 bg-[#0C0A09] rounded-[24px] items-center justify-center border border-stone-800 mr-6 shadow-inner">
                        <LogOut color="#ef4444" size={24} strokeWidth={2.5} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-red-500 font-black text-lg uppercase tracking-tighter mb-1">Terminate Session</Text>
                        <Text className="text-red-900/60 text-[10px] font-bold uppercase tracking-widest leading-none">Flush local grid authorization</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
        <View className="h-40" />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
