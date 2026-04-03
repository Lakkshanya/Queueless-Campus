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
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Camera,
  Save,
  ArrowLeft,
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
  const [yearOfStudy, setYearOfStudy] = useState(user?.yearOfStudy || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name || !phone || !department || !yearOfStudy) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/complete-profile', {
        name,
        phone,
        department,
        yearOfStudy,
        collegeId: user?.collegeId, // Keep existing
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
      className="flex-1 bg-background px-6 pt-12"
      contentContainerStyle={{paddingBottom: 40}}>
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-bold">
          Edit Profile
        </Text>
      </View>

      <View className="items-center mb-10">
        <TouchableOpacity className="w-24 h-24 bg-card rounded-full border-2 border-primary items-center justify-center overflow-hidden">
          <User color="#9A3412" size={50} />
          <View className="absolute bottom-0 w-full bg-primary/80 py-1">
            <Text className="text-white text-[8px] text-center font-bold">
              CHANGE
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800">
          <User color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4">
          <Phone color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4">
          <BookOpen color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Department / Course"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={department}
            onChangeText={setDepartment}
          />
        </View>

        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4">
          <Calendar color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Year of Study"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={yearOfStudy}
            onChangeText={setYearOfStudy}
          />
        </View>

        <TouchableOpacity
          className="bg-buttonPrimary rounded-xl py-4 items-center mt-10"
          onPress={handleUpdate}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View className="flex-row items-center">
              <Save color="#FFF" size={20} />
              <Text className="text-white font-bold text-lg ml-2">
                UPDATE PROFILE
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
