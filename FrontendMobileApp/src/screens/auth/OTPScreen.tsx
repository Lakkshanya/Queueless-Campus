import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {KeyRound, ArrowLeft} from 'lucide-react-native';
import api from '../../services/api';

const OTPScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {email} = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await api.post('auth/verify-otp', {
        email,
        otp: code,
      });

      Alert.alert(
        'Success',
        'Email verified successfully! You can now log in.',
      );
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error.response?.data?.message || 'Invalid OTP',
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

      <View className="items-center mb-10">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{backgroundColor: 'rgba(154, 52, 18, 0.1)'}}>
          <KeyRound color="#9A3412" size={40} />
        </View>
        <Text className="text-textPrimary text-3xl font-bold">
          Verification
        </Text>
        <Text className="text-textSecondary text-center mt-2">
          We've sent a 6-digit code to{'\n'}
          <Text className="text-primary font-bold">{email}</Text>
        </Text>
      </View>

      <View className="flex-row justify-between mb-10">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              inputs.current[index] = ref;
            }}
            className="w-12 h-14 bg-card border border-stone-800 rounded-xl text-textPrimary text-2xl text-center font-bold"
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={value => handleOtpChange(value, index)}
            onKeyPress={({nativeEvent}) => {
              if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                inputs.current[index - 1]?.focus();
              }
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        className="bg-buttonPrimary rounded-xl py-4 items-center "
        onPress={handleVerify}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-bold text-lg">VERIFY & PROCEED</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-8 items-center">
        <Text className="text-textSecondary">
          Didn't receive code?{' '}
          <Text className="text-primary font-bold">Resend</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPScreen;
