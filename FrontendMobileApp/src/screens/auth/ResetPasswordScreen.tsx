import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Lock, ShieldCheck, ArrowLeft, Eye, EyeOff} from 'lucide-react-native';
import api from '../../services/api';

const ResetPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {email} = route.params || {};

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      Alert.alert('Success', 'Password reset successfully! Please log in.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert(
        'Error',
        (err as any)?.response?.data?.message || 'Reset failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      className="bg-background px-6 pt-20">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8">
        <ArrowLeft color="#D6D3D1" size={24} />
      </TouchableOpacity>

      <View className="mb-10">
        <Text className="text-textPrimary text-3xl font-bold">
          New Password
        </Text>
        <Text className="text-textSecondary mt-2">
          Create a strong password to secure your account.
        </Text>
      </View>

      <View className="space-y-4">
        <View className="bg-card rounded-xl px-4 py-4 border border-stone-800">
          <TextInput
            placeholder="6-Digit Verification Code"
            placeholderTextColor="#78716C"
            className="text-textPrimary text-center text-lg font-bold"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <View className="bg-card rounded-xl px-4 py-4 flex-row items-center border border-stone-800 mt-4">
          <Lock color="#D6D3D1" size={20} />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#78716C"
            className="flex-1 ml-4 text-textPrimary text-base"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff color="#D6D3D1" size={20} />
            ) : (
              <Eye color="#D6D3D1" size={20} />
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-card rounded-xl px-4 py-4 flex-row items-center border border-stone-800 mt-4">
          <ShieldCheck color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#78716C"
            className="flex-1 ml-4 text-textPrimary text-base"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? (
              <EyeOff color="#D6D3D1" size={20} />
            ) : (
              <Eye color="#D6D3D1" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="bg-buttonPrimary rounded-xl py-4 items-center mt-10 "
        onPress={handleReset}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-bold text-lg">RESET PASSWORD</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ResetPasswordScreen;
