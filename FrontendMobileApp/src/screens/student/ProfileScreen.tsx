import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useAppDispatch, useAppSelector, updateUser} from '../../store';
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
  Building,
} from 'lucide-react-native';
import api from '../../services/api';
const ProfileHeader = ({user}: any) => {
  return (
    <View className="items-center mt-8 mb-12">
      <View className="relative">
        <View className="shadow-2xl shadow-orange-600/20 elevation-10">
          <View className="w-32 h-32 bg-[#171412] rounded-[48px] border-2 border-orange-600/30 items-center justify-center overflow-hidden">
            {user?.profilePhoto ? (
              <Image source={{uri: user.profilePhoto}} className="w-full h-full" />
            ) : (
              <Text className="text-orange-600 text-4xl font-bold tracking-tight">
                {user?.name?.charAt(0)}
              </Text>
            )}
          </View>
        </View>
        <View className="absolute -bottom-2 -right-2 shadow-lg shadow-black/30 elevation-5">
          <TouchableOpacity className="bg-orange-600 w-12 h-12 rounded-2xl border-4 border-[#0C0A09] items-center justify-center">
            <Edit color="#FFF" size={16} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="items-center mt-8">
        <Text className="text-textPrimary text-3xl font-bold tracking-tight leading-none mb-3">
          {user?.name || 'Agent Unknown'}
        </Text>
        <Text className="text-stone-600 text-xs font-bold tracking-tight opacity-80 mb-6">
          {user?.email}
        </Text>
        <View className="flex-row items-center gap-4">
          <View className="bg-orange-600/10 px-4 py-1.5 rounded-full border border-orange-600/20 flex-row items-center">
            <Activity color="#EA580C" size={12} strokeWidth={3} />
            <Text className="text-orange-600 text-xs font-bold tracking-tight ml-2">
              {user?.role?.toUpperCase() || 'EXTERNAL'}
            </Text>
          </View>
          <View className="bg-stone-900/50 px-4 py-1.5 rounded-full border border-stone-800 flex-row items-center">
            <Calendar color="#78716C" size={12} strokeWidth={2.5} />
            <Text className="text-stone-500 text-xs font-bold tracking-tight ml-2">
              SINCE_{new Date(user?.createdAt || Date.now()).getFullYear()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
const MetricCard = ({label, value, icon, color}: any) => (
  <View className="flex-1 shadow-2xl shadow-black/30 elevation-8"><View className="bg-[#171412] p-8 rounded-[40px] items-center border border-stone-800/80 relative overflow-hidden">
      
      {icon}
      <Text className="text-textPrimary text-4xl font-bold tracking-tight tabular-nums mt-4 leading-none">
        {value}
      </Text><Text className="text-stone-700 text-xs font-bold tracking-tight mt-3">
        
        {label}
      </Text></View></View>
);
const ProfileScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({served: 0, missed: 0});
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    yearOfStudy: user?.yearOfStudy || '',
    semester: user?.semester || '',
    specialization: user?.specialization || '',
    cgpa: user?.cgpa || '',
  });
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
  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile/update', formData);
      dispatch(updateUser(response.data.user));
      setIsEditing(false);
      Alert.alert(
        'Registry Success',
        'Academic protocol updated successfully.',
      );
    } catch (e: any) {
      Alert.alert(
        'Sync Error',
        e.response?.data?.message || 'Failed to update registry.',
      );
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    Alert.alert(
      'Protocol Termination',
      'Terminate active session and clear grid authorization?',
      [
        {text: 'Maintain Hold', style: 'cancel'},
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: () => {
            dispatch(clearAuth());
          },
        },
      ],
    );
  };
  const infoFields = [
    {
      key: 'name',
      label: 'FullName',
      value: formData.name,
      icon: <User color="#EA580C" size={14} />,
      placeholder: 'Full Personnel Name',
    },
    {
      key: 'department',
      label: 'Department',
      value: formData.department,
      icon: <Building color="#EA580C" size={14} />,
      placeholder: 'Departmental Branch',
    },
    {
      key: 'yearOfStudy',
      label: 'AcademicYear',
      value: formData.yearOfStudy,
      icon: <Calendar color="#EA580C" size={14} />,
      placeholder: 'Year of Study',
    },
    {
      key: 'semester',
      label: 'Semester',
      value: formData.semester,
      icon: <Layers color="#EA580C" size={14} />,
      placeholder: 'Current Semester',
    },
    {
      key: 'specialization',
      label: 'Specialization',
      value: formData.specialization,
      icon: <Activity color="#EA580C" size={14} />,
      placeholder: 'Field Specialization',
    },
    {
      key: 'cgpa',
      label: 'CumulCGPA',
      value: formData.cgpa,
      icon: <Award color="#EA580C" size={14} />,
      placeholder: '0.00',
    },
  ];
  return (
    <View className="flex-1 bg-[#0C0A09]"><ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }><View className="px-6 pt-16"><View className="items-center mt-8 mb-16"><View className="relative"><View className="shadow-2xl shadow-orange-600/20 elevation-10"><View className="w-32 h-32 bg-[#171412] rounded-[48px] border-2 border-orange-600/30 items-center justify-center overflow-hidden">
                  
                  {user?.profilePhoto ? (
                    <Image
                      source={{uri: user.profilePhoto}}
                      className="w-full h-full"
                    />
                  ) : (
                    <Text className="text-orange-600 text-5xl font-bold tracking-tight">
                      {user?.name?.charAt(0)}
                    </Text>
                  )}
                </View></View>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="absolute -bottom-2 -right-2 bg-orange-600 w-12 h-12 rounded-2xl border-4 border-[#0C0A09] items-center justify-center shadow-lg shadow-black/30 elevation-5"><Edit color="#FFF" size={16} strokeWidth={3} /></TouchableOpacity>
              )}
            </View><Text className="text-textPrimary text-4xl font-bold tracking-tight leading-none mt-10">
              
              {user?.name}
            </Text><View className="bg-orange-600/10 px-5 py-2 rounded-full border border-orange-600/20 flex-row items-center mt-6"><Activity color="#EA580C" size={14} strokeWidth={2.5} /><Text className="text-orange-600 text-xs font-bold tracking-tight ml-3">
                
                AUTHORIZED_{user?.role?.toUpperCase()}
              </Text></View></View><View className="flex-row justify-between mb-16 gap-x-6"><MetricCard
              label="Processed"
              value={stats.served || 0}
              icon={<Zap color="#EA580C" size={24} strokeWidth={2.5} />}
            /><MetricCard
              label="Record GPA"
              value={user?.cgpa || '0.00'}
              icon={<Award color="#EA580C" size={24} strokeWidth={2.5} />}
            /></View>
          {/* Academic Registry Form */}
          <View className="bg-[#171412] rounded-[32px] p-10 border border-stone-800/80 mb-16 relative overflow-hidden"><View className="absolute top-0 right-0 w-64 h-64 bg-orange-600/[0.02] rounded-full pointer-events-none" /><View className="flex-row items-center justify-between mb-12 px-2"><View className="flex-row items-center gap-4"><GraduationCap color="#EA580C" size={20} strokeWidth={3} /><Text className="text-textPrimary text-sm font-bold tracking-tight uppercase">
                  Registry_Entry
                </Text></View>
              {isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(false)}><Text className="text-stone-700 text-xs font-bold tracking-tight uppercase">
                    Discard
                  </Text></TouchableOpacity>
              )}
            </View><View className="space-y-6">
              
              {infoFields.map((field, i) => (
                <View
                  key={i}
                  className={`py-4 ${
                    i !== infoFields.length - 1
                      ? 'border-b border-stone-800/40'
                      : ''
                  }`}><View className="flex-row items-center gap-4 mb-3"><View className="w-8 h-8 rounded-lg bg-[#0C0A09] items-center justify-center border border-stone-800">
                      
                      {field.icon}
                    </View><Text className="text-stone-700 text-xs font-bold tracking-tight uppercase">
                      {field.label}
                    </Text></View>
                  {isEditing ? (
                    <TextInput
                      placeholder={field.placeholder}
                      placeholderTextColor="#292524"
                      value={field.value?.toString()}
                      onChangeText={val =>
                        setFormData({...formData, [field.key]: val})
                      }
                      className="text-textPrimary text-base font-bold tracking-tight p-2 bg-[#0C0A09] rounded-xl border border-stone-800"
                    />
                  ) : (
                    <Text className="text-textPrimary text-lg font-bold tracking-tight ml-2">
                      {field.value || 'Not Specified'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className="mt-12 bg-orange-600 py-6 rounded-[32px] flex-row items-center justify-center active:scale-95 transition-all">
                
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <><ShieldCheck color="#FFF" size={20} strokeWidth={3} /><Text className="text-white font-bold tracking-tight text-xs ml-4 uppercase">
                      SAVE_REGISTRY_ENTRY
                    </Text></>
                )}
              </TouchableOpacity>
            )}
          </View><View className="mb-20 shadow-2xl shadow-red-500/10 elevation-5"><TouchableOpacity
              className="bg-red-950/10 rounded-[48px] p-10 flex-row items-center border border-red-950/20 active:scale-[0.98] transition-all relative overflow-hidden"
              onPress={handleLogout}><View className="absolute top-0 left-0 w-2 h-full bg-red-900/40" /><View className="w-16 h-16 bg-[#0C0A09] rounded-[32px] items-center justify-center border border-stone-800 mr-8"><LogOut color="#ef4444" size={28} strokeWidth={2.5} /></View><View className="flex-1"><Text className="text-red-500 font-bold tracking-tight text-xl mb-1 uppercase">
                  Terminate Session
                </Text><Text className="text-red-900/60 text-xs font-bold tracking-tight leading-none uppercase">
                  Clear operational grid link
                </Text></View></TouchableOpacity></View></View></ScrollView></View>
  );
};
export default ProfileScreen;
