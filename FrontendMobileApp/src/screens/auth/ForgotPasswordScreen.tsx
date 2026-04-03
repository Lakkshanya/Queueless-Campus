import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Mail, ArrowLeft, Send} from 'lucide-react-native';
import api from '../../services/api';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', {email});
      Alert.alert('Success', 'Verification code sent to your email.');
      navigation.navigate('ResetPassword', {email});
    } catch (err) {
      Alert.alert(
        'Error',
        (err as any)?.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-6 pt-20">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8">
        <ArrowLeft color="#D6D3D1" size={24} />
      </TouchableOpacity>

      <View className="mb-10">
        <Text className="text-textPrimary text-3xl font-bold">
          Reset Password
        </Text>
        <Text className="text-textSecondary mt-2">
          Enter your email address and we'll send you a code to reset your
          password.
        </Text>
      </View>

      <View className="bg-card rounded-xl px-4 py-4 flex-row items-center border border-stone-800">
        <Mail color="#D6D3D1" size={20} />
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#78716C"
          className="flex-1 ml-4 text-textPrimary text-base"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        className="bg-buttonPrimary rounded-xl py-4 items-center mt-10 "
        onPress={handleSendOtp}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-lg mr-2">SEND CODE</Text>
            <Send color="#FFFFFF" size={18} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;
