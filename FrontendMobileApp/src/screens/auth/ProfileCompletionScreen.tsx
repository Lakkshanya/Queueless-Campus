import React, {useState, useEffect} from 'react';
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
import api from '../../services/api';
import {useAppDispatch} from '../../store';
import {setAuth} from '../../store/slices/authSlice';
import {useAuth} from '../../context/AuthContext';
import {
  User,
  Phone,
  BookOpen,
  Calendar,
  Camera,
  Save,
  Info,
  Briefcase,
  Layers,
} from 'lucide-react-native';

const ProfileCompletionScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user, login: legacyLogin} = useAuth();

  // Common Fields
  const [collegeId, setCollegeId] = useState(user?.collegeId || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');

  // Student Specific
  const [yearOfStudy, setYearOfStudy] = useState(user?.yearOfStudy || '');
  const [batch, setBatch] = useState(user?.academicRecords?.batch || '');
  const [section, setSection] = useState(user?.section || '');

  // Staff Specific
  const [designation, setDesignation] = useState(user?.designation || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation based on role
    if (!collegeId || !phone || !department) {
      Alert.alert('Error', 'Please fill in all common fields');
      return;
    }
    if (user?.role === 'student' && (!yearOfStudy || !batch)) {
      Alert.alert('Error', 'Please fill in your Year and Batch');
      return;
    }
    if (user?.role === 'staff' && !designation) {
      Alert.alert('Error', 'Please fill in your Designation');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        collegeId,
        phone,
        department,
      };

      if (user?.role === 'student') {
        payload.yearOfStudy = yearOfStudy;
        payload.academicRecords = {
          ...user?.academicRecords,
          batch,
        };
      } else if (user?.role === 'staff') {
        payload.designation = designation;
      }

      const response = await api.post('/auth/complete-profile', payload);

      // Update local Redux store
      const updatedUser = {
        ...user,
        ...response.data.user,
        token: user?.token,
      };
      dispatch(setAuth({user: updatedUser, token: user?.token || ''}));

      // Update legacy context for safety
      await legacyLogin(updatedUser);

      Alert.alert('Success', 'Profile completed successfully!', [{text: 'OK'}]);
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
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 100,
      }}><View className="items-center mb-8"><Text className="text-primary text-3xl font-bold tracking-tight">
          Complete Profile
        </Text><Text className="text-textSecondary mt-2">
          Providing specialized details for {user?.role?.toUpperCase()} access
        </Text></View><View className="items-center mb-8 text-center"><TouchableOpacity className="w-24 h-24 bg-card rounded-full border-2 border-primary items-center justify-center border-dashed"><Camera color="#9A3412" size={32} /><Text className="text-primary text-xs font-bold tracking-tight mt-1">
            UPLOAD
          </Text></TouchableOpacity><Text className="text-textSecondary text-xs mt-2">
          Profile Photo (Optional)
        </Text></View><View className="space-y-4">
        {/* Common Field: Phone */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4"><Phone color="#D6D3D1" size={20} /><TextInput
            placeholder="Phone Number"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          /></View>

        {/* Common Field: College/Employee ID */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4"><Info color="#D6D3D1" size={20} /><TextInput
            placeholder={
              user?.role === 'staff' ? 'Employee ID' : 'College ID / Reg No.'
            }
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={collegeId}
            onChangeText={setCollegeId}
            autoCapitalize="characters"
          /></View>

        {/* Common Field: Department */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4"><BookOpen color="#D6D3D1" size={20} /><TextInput
            placeholder="Department"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={department}
            onChangeText={setDepartment}
          /></View>

        {/* STUDENT SPECIFIC FIELDS */}
        {user?.role === 'student' && (
          <><View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4"><Calendar color="#D6D3D1" size={20} /><TextInput
                placeholder="Year of Study (e.g. 3rd Year)"
                placeholderTextColor="#78716C"
                className="flex-1 ml-3 text-textPrimary text-base"
                value={yearOfStudy}
                onChangeText={setYearOfStudy}
              /></View><View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4"><Layers color="#D6D3D1" size={20} /><TextInput
                placeholder="Admission Batch (e.g. 2021)"
                placeholderTextColor="#78716C"
                className="flex-1 ml-3 text-textPrimary text-base"
                value={batch}
                onChangeText={setBatch}
                keyboardType="numeric"
              /></View></>
        )}

        {/* STAFF SPECIFIC FIELDS */}
        {user?.role === 'staff' && (
          <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4"><Briefcase color="#D6D3D1" size={20} /><TextInput
              placeholder="Designation (e.g. Professor)"
              placeholderTextColor="#78716C"
              className="flex-1 ml-3 text-textPrimary text-base"
              value={designation}
              onChangeText={setDesignation}
            /></View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          className="bg-buttonPrimary rounded-xl py-4 items-center mt-10"
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View className="flex-row items-center"><Save color="#FFF" size={20} /><Text className="text-white font-bold tracking-tight text-lg ml-2">
                Finalize Profile
              </Text></View>
          )}
        </TouchableOpacity><View className="h-10" /></View></ScrollView>
  );
};

export default ProfileCompletionScreen;
