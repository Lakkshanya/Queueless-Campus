import './global.css';
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import api from './src/services/api';
import {Provider} from 'react-redux';
import {store, useAppSelector, useAppDispatch} from './src/store';
import {AuthProvider} from './src/context/AuthContext';
import {fcmService} from './src/services/fcmService';
import SplashScreen from './src/screens/auth/SplashScreen';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import OTPScreen from './src/screens/auth/OTPScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import LiveQueueScreen from './src/screens/student/LiveQueueScreen';
import StudentTabs from './src/navigation/StudentTabs';
import StaffTabs from './src/navigation/StaffTabs';
import EditProfileScreen from './src/screens/student/EditProfileScreen';
import SettingsScreen from './src/screens/student/SettingsScreen';
import {ActivityIndicator, View, Alert, Text, SafeAreaView, TouchableOpacity, Modal, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setAuth, setLoading} from './src/store/slices/authSlice';
import {setServerUrl} from './src/store/slices/configSlice';
import {socketService} from './src/services/socket';
import ProfileCompletionScreen from './src/screens/auth/ProfileCompletionScreen';
import InactivityOverlay from './src/components/InactivityOverlay';

const Stack = createStackNavigator();

const AppContent = () => {
  const {user, token, loading} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [serverStatus, setServerStatus] = useState<'testing' | 'online' | 'offline'>('testing');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [tunnelNameInput, setTunnelNameInput] = useState('');

  // SERVER STATUS CHECK: Critical for final "Rectification" UI
  useEffect(() => {
    let interval: any;
    const checkServer = async () => {
      try {
        const response = await api.get('/ping', {timeout: 3000});
        if (response.status === 200) setServerStatus('online');
        else setServerStatus('offline');
      } catch (err) {
        setServerStatus('offline');
      }
    };

    checkServer();
    interval = setInterval(checkServer, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (!tunnelNameInput) return;
    
    // Auto-Format: converts "mold-farms-sandwich" to full URL
    const cleanName = tunnelNameInput.trim().toLowerCase();
    const finalUrl = `https://${cleanName}.trycloudflare.com/api`;
    
    dispatch(setServerUrl(finalUrl));
    setShowSyncModal(false);
    setServerStatus('testing');
    Alert.alert('Sync Successful', `Connecting to: ${cleanName}`);
  };

  React.useEffect(() => {
    if (user && token) {
      fcmService.register();
      socketService.connect(token);
      socketService.joinUser(user._id);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user, token]);

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const tokenToken = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');

        if (tokenToken && userJson) {
          try {
            const response = await api.get('/auth/me');
            dispatch(
              setAuth({
                token: tokenToken,
                user: response.data,
              }),
            );
          } catch (e) {
            // IF USER NOT FOUND (DELETED): Clear storage and show Login
            await AsyncStorage.multiRemove(['token', 'user']);
            dispatch(setAuth({ token: '', user: null }));
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#1C1917',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#C2410C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      {/* STATUS BAR: Definitive "Rectified" UI */}
      {!user && (
        <TouchableOpacity 
          onPress={() => setShowSyncModal(true)}
          style={{
            backgroundColor: serverStatus === 'online' ? '#065F46' : serverStatus === 'offline' ? '#991B1B' : '#78350F',
            paddingVertical: 6,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>
             SERVER: {serverStatus.toUpperCase()} {serverStatus === 'online' ? '✅' : '❌ Tap to Sync'}
          </Text>
        </TouchableOpacity>
      )}

      {/* SYNC MODAL: The manual fallback that never fails */}
      <Modal visible={showSyncModal} transparent animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20}}>
            <View style={{backgroundColor: '#262626', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#444'}}>
                <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>Sync Cloud Tunnel</Text>
                <Text style={{color: '#A3A3A3', fontSize: 12, marginBottom: 20}}>Type the 4-word tunnel name from your terminal (e.g. mold-farms-sandwich)</Text>
                
                <TextInput
                    style={{backgroundColor: '#171717', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20}}
                    placeholder="Enter Tunnel Name..."
                    placeholderTextColor="#555"
                    value={tunnelNameInput}
                    onChangeText={setTunnelNameInput}
                    autoCapitalize="none"
                />

                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <TouchableOpacity onPress={() => setShowSyncModal(false)} style={{marginRight: 20}}>
                        <Text style={{color: '#A3A3A3', fontWeight: 'bold'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleManualSync}>
                        <Text style={{color: '#C2410C', fontWeight: 'bold'}}>SYNC NOW</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
      
      {user && <InactivityOverlay />}

      <Stack.Navigator id="root" screenOptions={{headerShown: false}}>
        {user ? (
          !user.profileCompleted ? (
            <Stack.Screen
              name="ProfileCompletion"
              component={ProfileCompletionScreen}
            />
          ) : user.role === 'staff' ? (
            <>
              <Stack.Screen name="StaffHome" component={StaffTabs} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="StudentHome" component={StudentTabs} />
              <Stack.Screen name="LiveQueue" component={LiveQueueScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        )}
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
}
