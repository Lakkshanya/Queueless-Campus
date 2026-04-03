import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store';
import {setAuth} from '../../store/slices/authSlice';
import {useAuth} from '../../context/AuthContext';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCcw,
} from 'lucide-react-native';
import {setServerUrl} from '../../store/slices/configSlice';
import {updateApiBaseURL} from '../../services/api';
import api from '../../services/api';
import {BASE_URL} from '../../constants/config';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {login: legacyLogin} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const {serverUrl, portalUrl} = useAppSelector(state => state.config);

  useEffect(() => {
    setNewUrl(serverUrl);
  }, [serverUrl]);

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
  };

  const handleLogin = async () => {
    if (!email || !password || !captchaInput) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    if (captchaInput.trim().toUpperCase() !== generatedCaptcha.trim()) {
      setLoading(false);
      Alert.alert(
        'Verification Failed',
        'The captcha code you entered is incorrect. Please try again.',
      );
      generateNewCaptcha();
      return;
    }
    try {
      const response = await api.post('auth/login', {
        email,
        password,
        captcha: captchaInput,
      });

      if (response.data.user?.role === 'admin') {
        setLoading(false);
        Alert.alert(
          'Admin Dashboard Required',
          'Administrators must use the desktop computer to access management tools. Redirecting to portal...',
          [
            {
              text: 'Launch Web Portal',
              onPress: () => Linking.openURL(`${portalUrl}`),
            },
          ],
        );
        return;
      }

      // Update Redux Store
      dispatch(setAuth({user: response.data.user, token: response.data.token}));

      // Update Legacy Context
      legacyLogin({...response.data.user, token: response.data.token});
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
      generateNewCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServer = () => {
    if (!newUrl) return;
    dispatch(setServerUrl(newUrl));
    setShowConfigModal(false);
    Alert.alert('Success', 'Server URL updated successfully!');
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
      className="bg-background px-6 py-10">
      <TouchableOpacity 
        onLongPress={() => setShowConfigModal(true)}
        delayLongPress={2000}
        activeOpacity={1}>
        <View className="items-center mb-10">
          <Text className="text-primary text-4xl font-bold">Welcome Back</Text>
          <Text className="text-textSecondary mt-2">
            Sign in to manage your tokens
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
            <TouchableOpacity
              onPress={() => setShowConfigModal(true)}
              className="mt-6 py-2 px-4 rounded-xl bg-orange-950/30 border border-orange-500/20 active:bg-orange-900/40">
              <Text className="text-orange-200/60 text-center text-sm font-medium">
                Troubleshoot Connection {' >'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="space-y-4">
        {/* Email Field */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800">
          <Mail color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Field */}
        <View className="bg-card rounded-xl px-4 py-3 flex-row items-center border border-stone-800 mt-4">
          <Lock color="#D6D3D1" size={20} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#78716C"
            className="flex-1 ml-3 text-textPrimary text-base"
            value={password}
            onChangeText={setPassword}
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

        {/* Captcha Section */}
        <View className="mt-6">
          <Text className="text-textSecondary mb-2 mb-2 ml-1">
            Verification Captcha
          </Text>
          <View className="flex-row items-center space-x-3">
            <View className="bg-stone-800 rounded-lg px-4 py-3 flex-row items-center justify-between flex-1 border ">
              <Text
                className="text-primary text-xl font-bold tracking-widest"
                style={{textDecorationLine: 'line-through'}}>
                {generatedCaptcha}
              </Text>
              <TouchableOpacity onPress={generateNewCaptcha}>
                <RefreshCcw color="#9A3412" size={20} />
              </TouchableOpacity>
            </View>
            <View className="bg-card rounded-lg px-4 py-3 flex-1 border border-stone-800 ml-3">
              <TextInput
                placeholder="Enter Code"
                placeholderTextColor="#78716C"
                className="text-textPrimary text-center font-bold text-lg"
                value={captchaInput}
                onChangeText={setCaptchaInput}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="bg-buttonPrimary rounded-xl py-4 items-center mt-10 "
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-lg">LOG IN</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          className="mt-4 items-center"
          onPress={() => navigation.navigate('ForgotPassword')}>
          <Text className="text-buttonSecondary text-sm">Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-12 mb-8">
          <Text className="text-textSecondary">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-primary font-bold uppercase tracking-widest">
              Student Registration
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
