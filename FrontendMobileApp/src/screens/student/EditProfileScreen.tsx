import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  User,
  Phone,
  BookOpen,
  Calendar,
  Save,
  ArrowLeft,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppDispatch, useAppSelector} from '../../store';
import {setAuth} from '../../store/slices/authSlice';
const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user, token} = useAppSelector(state => state.auth);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [yearOfStudy, setYearOfStudy] = useState(
    user?.yearOfStudy?.toString() || '',
  );
  const [semester, setSemester] = useState(user?.semester?.toString() || '');
  const [specialization, setSpecialization] = useState(
    user?.specialization || '',
  );
  const [cgpa, setCgpa] = useState(user?.cgpa?.toString() || '');
  const [loading, setLoading] = useState(false);
  const handleUpdate = async () => {
    if (!name || !department || !yearOfStudy || !semester) {
      Alert.alert(
        'Error',
        'Please fill in Name, Department, Year, and Semester',
      );
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/complete-profile', {
        name,
        phone,
        department,
        yearOfStudy: parseInt(yearOfStudy),
        semester: parseInt(semester),
        specialization: specialization || 'Nil',
        cgpa: parseFloat(cgpa) || 0,
        collegeId: user?.collegeId,
      });
      const updatedUser = {...user, ...response.data.user};
      dispatch(setAuth({user: updatedUser, token: token!}));
      Alert.alert('Success', 'Profile updated successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-16"
      contentContainerStyle={{paddingBottom: 60}}
      showsVerticalScrollIndicator={false}><View className="flex-row items-center justify-between mb-10"><TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"><ArrowLeft color="#D6D3D1" size={24} /></TouchableOpacity><Text className="text-textPrimary text-xl font-bold tracking-tight ">
          Profile Form
        </Text><View className="w-10" /></View><View className="space-y-4">
        
        {/* Name */}
        <View className="mb-6"><Text className="text-stone-500 text-xs font-bold tracking-tight mb-2 ml-2">
            Full Name
          </Text><View className="bg-card rounded-2xl px-4 py-4 flex-row items-center border border-stone-800"><User color="#C2410C" size={18} /><TextInput
              placeholder="Name"
              placeholderTextColor="#78716C"
              className="flex-1 ml-3 text-textPrimary text-base font-bold tracking-tight"
              value={name}
              onChangeText={setName}
            /></View></View>
        {/* Phone */}
        <View className="mb-6"><Text className="text-stone-500 text-xs font-bold tracking-tight mb-2 ml-2">
            Contact Number
          </Text><View className="bg-card rounded-2xl px-4 py-4 flex-row items-center border border-stone-800"><Phone color="#C2410C" size={18} /><TextInput
              placeholder="Phone"
              placeholderTextColor="#78716C"
              className="flex-1 ml-3 text-textPrimary text-base font-bold tracking-tight"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            /></View></View>
        {/* Department */}
        <View className="mb-6"><Text className="text-stone-500 text-xs font-bold tracking-tight mb-2 ml-2">
            Department
          </Text><View className="bg-card rounded-2xl px-4 py-4 flex-row items-center border border-stone-800"><BookOpen color="#C2410C" size={18} /><TextInput
              placeholder="e.g. Computer Science"
              placeholderTextColor="#78716C"
              className="flex-1 ml-3 text-textPrimary text-base font-bold tracking-tight"
              value={department}
              onChangeText={setDepartment}
            /></View></View><View className="flex-row gap-x-4 mb-6">
          
          {/* Year */}
          <View className="flex-1"><Text className="text-stone-500 text-xs font-bold tracking-tight mb-2 ml-2">
              Year
            </Text><View className="bg-card rounded-2xl px-4 py-4 flex-row items-center border border-stone-800"><Calendar color="#C2410C" size={18} /><TextInput
                placeholder="Year"
                placeholderTextColor="#78716C"
                className="flex-1 ml-3 text-textPrimary text-base font-bold tracking-tight"
                value={yearOfStudy}
                onChangeText={setYearOfStudy}
                keyboardType="numeric"
              /></View></View>
          {/* Semester */}
          <View className="flex-1"><Text className="text-stone-500 text-xs font-bold tracking-tight mb-2 ml-2">
              Semester
            </Text><View className="bg-card rounded-2xl px-4 py-4 flex-row items-center border border-stone-800"><Layers color="#C2410C" size={18} /><TextInput
                placeholder="Sem"
                placeholderTextColor="#78716C"
                className="flex-1 ml-3 text-textPrimary text-base font-bold tracking-tight"
                value={semester}
                onChangeText={setSemester}
                keyboardType="numeric"
              /></View></View></View>
        {/* Specialization */}
        <View className="mb-6"><Text className="text-stone-500 text-xs font-bold tracking-tight mb-2 ml-2">
            Specialization
          </Text><View className="bg-card rounded-2xl px-4 py-4 flex-row items-center border border-stone-800"><GraduationCap color="#C2410C" size={18} /><TextInput
              placeholder="Nil"
              placeholderTextColor="#78716C"
              className="flex-1 ml-3 text-textPrimary text-base font-bold tracking-tight"
              value={specialization}
              onChangeText={setSpecialization}
            /></View></View>
        {/* CGPA */}
        <View className="mb-6"><Text className="text-stone-500 text-xs font-bold tracking-tight mb-2 ml-2">
            Current CGPA
          </Text><View className="bg-card rounded-2xl px-4 py-4 flex-row items-center border border-stone-800"><Award color="#C2410C" size={18} /><TextInput
              placeholder="0.00"
              placeholderTextColor="#78716C"
              className="flex-1 ml-3 text-textPrimary text-base font-bold tracking-tight"
              value={cgpa}
              onChangeText={setCgpa}
              keyboardType="numeric"
            /></View></View><TouchableOpacity
          className="bg-primary rounded-[20px] py-5 items-center mt-10 active:scale-95 transition-transform shadow-xl shadow-orange-600/30 elevation-8"
          onPress={handleUpdate}
          disabled={loading}>
          
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View className="flex-row items-center"><Save color="#FFF" size={20} /><Text className="text-white font-bold tracking-tight text-xs ml-3">
                
                Update Profile
              </Text></View>
          )}
        </TouchableOpacity></View></ScrollView>
  );
};
export default EditProfileScreen;
