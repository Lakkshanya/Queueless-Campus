import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Bell,
  Lock,
  Smartphone,
  Shield,
  Info,
  ChevronRight,
  Moon,
  X,
  Globe,
  Server,
} from 'lucide-react-native';
import {useAppDispatch, useAppSelector} from '../../store';
import {clearAuth} from '../../store/slices/authSlice';
import {useAuth} from '../../context/AuthContext';
import {setServerUrl} from '../../store/slices/configSlice';
import {updateApiBaseURL} from '../../services/api';
const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [isNotificationsEnabled, setIsNotificationsEnabled] =
    React.useState(true);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const {serverUrl} = useAppSelector(state => state.config);
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [newServerUrl, setNewServerUrl] = React.useState(serverUrl);
  const toggleNotifications = () => {
    setIsNotificationsEnabled(previousState => !previousState);
    Alert.alert(
      'Notifications',
      `Push notifications ${!isNotificationsEnabled ? 'enabled' : 'disabled'}`,
    );
  };
  const saveServerConfig = () => {
    if (!newServerUrl.startsWith('http')) {
      Alert.alert(
        'Invalid URL',
        'Please enter a valid URL starting with http:// or https://',
      );
      return;
    }
    dispatch(setServerUrl(newServerUrl));
    updateApiBaseURL(newServerUrl);
    setShowConfigModal(false);
    Alert.alert('Success', 'Server configuration updated!');
  };
  const handleAction = (label: string) => {
    switch (label) {
      case 'Security & Password':
        Alert.alert(
          'Security',
          'To update your password, we will send a reset link to your official email.',
          [
            {text: 'Cancel'},
            {
              text: 'Send Link',
              onPress: () => navigation.navigate('ForgotPassword'),
            },
          ],
        );
        break;
      case 'Privacy Policy':
        setShowPrivacy(true);
        break;
      case 'App Theme':
        Alert.alert(
          'Theme',
          'Dark Mode is currently the standard for QueueLess Premium. Light mode coming soon!',
        );
        break;
      case 'Data Export':
        Alert.alert(
          'Data',
          'Your activity report has been requested. Check your email shortly.',
        );
        break;
      case 'Connection Settings':
        setShowConfigModal(true);
        break;
      default:
        break;
    }
  };
  const settingsOptions = [
    {
      label: 'Push Notifications',
      icon: <Bell color="#D6D3D1" size={20} />,
      type: 'switch',
      sub: 'Receive queue alerts',
    },
    {
      label: 'Security & Password',
      icon: <Lock color="#D6D3D1" size={20} />,
      type: 'link',
      sub: 'Update passkey',
    },
    {
      label: 'Privacy Policy',
      icon: <Shield color="#D6D3D1" size={20} />,
      type: 'link',
      sub: 'Data protection',
    },
    {
      label: 'App Theme',
      icon: <Moon color="#D6D3D1" size={20} />,
      type: 'link',
      value: 'Dark',
      sub: 'System default',
    },
  ];
  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12"
      contentContainerStyle={{paddingBottom: 120}}><View className="flex-row items-center mb-8"><TouchableOpacity onPress={() => navigation.goBack()} className="mr-4"><ArrowLeft color="#D6D3D1" size={24} /></TouchableOpacity><Text className="text-textPrimary text-2xl font-bold tracking-tight">
          
          Account Settings
        </Text></View><View className="space-y-4">
        
        {settingsOptions.map((item, i) => (
          <View
            key={i}
            className="bg-card rounded-xl p-4 flex-row items-center justify-between border border-stone-800 mb-4"><View className="flex-row items-center"><View className="w-10 h-10 bg-background rounded-lg items-center justify-center mr-4">
                
                {item.icon}
              </View><View><Text className="text-textPrimary font-bold tracking-tight">
                  {item.label}
                </Text><Text className="text-[#78716C] text-xs">{item.sub}</Text>
                {item.value ? (
                  <Text className="text-primary text-xs font-bold tracking-tight mt-1">
                    
                    {item.value}
                  </Text>
                ) : null}
              </View></View>
            {item.type === 'switch' ? (
              <Switch
                trackColor={{false: '#44403C', true: '#9A3412'}}
                thumbColor={isNotificationsEnabled ? '#FB923C' : '#D6D3D1'}
                onValueChange={toggleNotifications}
                value={isNotificationsEnabled}
              />
            ) : (
              <TouchableOpacity onPress={() => handleAction(item.label)}><ChevronRight color="#44403C" size={18} /></TouchableOpacity>
            )}
          </View>
        ))}
      </View><Modal
        animationType="slide"
        transparent={true}
        visible={showPrivacy}
        onRequestClose={() => setShowPrivacy(false)}><View className="flex-1 justify-end bg-black/60"><View className="bg-card rounded-t-[40px] p-8 border-t border-stone-800 h-3/4"><View className="flex-row justify-between items-center mb-6"><Text className="text-textPrimary text-2xl font-bold tracking-tight">
                
                Privacy Policy
              </Text><TouchableOpacity
                onPress={() => setShowPrivacy(false)}
                className="bg-stone-800 p-2 rounded-full"><X color="#D6D3D1" size={20} /></TouchableOpacity></View><ScrollView showsVerticalScrollIndicator={false}><Text className="text-textSecondary leading-6 mb-4">
                
                At QueueLess, we prioritize your data security. Your college
                credentials are encrypted and used solely for student
                verification within the secure system.
              </Text><Text className="text-primary font-bold tracking-tight mb-2">
                
                1. Data Collection
              </Text><Text className="text-textSecondary leading-6 mb-4">
                
                We store your name, email, and department to facilitate service
                tokens and administrative communication.
              </Text><Text className="text-primary font-bold tracking-tight mb-2">
                
                2. Real-time Service
              </Text><Text className="text-textSecondary leading-6 mb-4">
                
                Live queue data is processed using high-performance systems to
                ensure immediate updates without compromising privacy.
              </Text><View className="h-10" /></ScrollView></View></View></Modal><View className="mt-10 items-center"><Text className="text-textSecondary text-xs">
          
          QueueLess Campus • Version 1.0.0
        </Text></View></ScrollView>
  );
};
export default SettingsScreen;
