import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store';
import {setServerUrl} from '../../store/slices/configSlice';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle,
  Info,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import api from '../../services/api';

const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const dispatch = useAppDispatch();
  const {serverUrl} = useAppSelector(state => state.config);

  React.useEffect(() => {
    setNewUrl(serverUrl);
  }, [serverUrl]);

  const handleUpdateServer = () => {
    if (!newUrl) return;
    dispatch(setServerUrl(newUrl));
    setShowConfigModal(false);
    Alert.alert('Success', 'Server URL updated successfully!');
  };

  const handleSignup = async () => {
    const {
      name,
      email,
      password,
      confirmPassword,
    } = formData;
    const requiredFields = [name, email, password, confirmPassword];

    if (requiredFields.some(field => !field)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('auth/signup', {
        name,
        email,
        password,
        role,
      });

      Alert.alert(
        'Success',
        'Registration successful! Please check your email for the OTP.',
      );
      navigation.navigate('OTP', {email});
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
      className="bg-background px-6 py-10">
      <TouchableOpacity 
        onLongPress={() => setShowConfigModal(true)}
        delayLongPress={2000}
        activeOpacity={1}>
        <View className="items-center mb-8">
          <Text className="text-primary text-3xl font-bold">Create Account</Text>
          <Text className="text-textSecondary mt-2">
            Join the QueueLess campus community
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showConfigModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfigModal(false)}>
        <View className="flex-1 justify-center items-center bg-black/80 px-6">
          <View className="bg-stone-900 w-full rounded-2xl p-6 border border-stone-800">
            <Text className="text-primary text-xl font-bold mb-2">Server Configuration</Text>
            <Text className="text-stone-400 text-sm mb-6">
              Update the backend API URL. This is used for Cloudflare tunnels.
            </Text>
            
            <View className="bg-stone-800 rounded-xl px-4 py-3 border border-stone-700 mb-6">
              <TextInput
                placeholder="https://your-tunnel.trycloudflare.com"
                placeholderTextColor="#78716C"
                className="text-stone-200 text-base"
                value={newUrl}
                onChangeText={setNewUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={() => setShowConfigModal(false)}
                className="flex-1 bg-stone-800 py-3 rounded-xl items-center mr-2">
                <Text className="text-stone-300 font-bold">CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleUpdateServer}
                className="flex-1 bg-primary py-3 rounded-xl items-center ml-2">
                <Text className="text-white font-bold">SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Selection */}
      <View className="mb-6">
        <Text className="text-textSecondary mb-3 ml-1">I am a...</Text>
        <View className="flex-row space-x-4">
          {['student', 'staff'].map(r => (
            <TouchableOpacity
              key={r}
              className={`flex-1 py-3 rounded-lg border items-center ${
                role === r ? 'border-primary' : 'bg-card border-stone-800'
              }`}
              style={
                role === r
                  ? {backgroundColor: 'rgba(154, 52, 18, 0.2)'}
                  : undefined
              }
              onPress={() => setRole(r)}>
              <Text
                className={`capitalize font-bold ${
                  role === r ? 'text-primary' : 'text-textSecondary'
                }`}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="space-y-4">
        {/* Name Field */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800">
          <User color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={formData.name}
            onChangeText={t => setFormData({...formData, name: t})}
          />
        </View>

        {/* Email Field */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4">
          <Mail color="#D6D3D1" size={20} />
          <TextInput
            placeholder="College Email"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={formData.email}
            onChangeText={t => setFormData({...formData, email: t})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4">
          <Lock color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={formData.password}
            onChangeText={t => setFormData({...formData, password: t})}
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

        {/* Confirm Password */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4">
          <ShieldCheck color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={formData.confirmPassword}
            onChangeText={t => setFormData({...formData, confirmPassword: t})}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? (
              <EyeOff color="#D6D3D1" size={20} />
            ) : (
              <Eye color="#D6D3D1" size={20} />
            )}
          </TouchableOpacity>
        </View>

      </View>

      {/* Rules Section */}
      <View
        className="rounded-xl p-4 mt-6 border"
        style={{
          backgroundColor: 'rgba(41, 37, 36, 0.5)',
          borderColor: 'rgba(28, 25, 23, 0.5)',
        }}>
        <View className="flex-row items-center mb-2">
          <Info color="#9A3412" size={16} />
          <Text className="text-primary font-bold ml-2">Official Guidelines</Text>
        </View>
        <Text className="text-textSecondary text-xs leading-5">
          • Use your official college email only.{'\n'}• One account per Student
          ID.{'\n'}
          ID.{'\n'}• Misuse of the booking system will lead to suspension.{'\n'}•
          Password must be at least 6 characters.{'\n'}• Be present at the
          counter 5 minutes before your turn.
        </Text>
      </View>

      {/* Signup Button */}
      <TouchableOpacity
        className="bg-buttonPrimary rounded-xl py-4 items-center mt-8 "
        onPress={handleSignup}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-lg mr-2">
              Create Account
            </Text>
            <ChevronRight color="#FFFFFF" size={20} />
          </View>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <View className="flex-row justify-center mt-6 mb-10">
        <Text className="text-textSecondary">Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-primary font-bold">Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;
