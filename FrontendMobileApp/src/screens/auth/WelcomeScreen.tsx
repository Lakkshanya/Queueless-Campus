import React from 'react';
import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChevronRight} from 'lucide-react-native';
const {width} = Dimensions.get('window');
const WelcomeScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView className="flex-1 bg-background"><View className="flex-1 justify-center items-center px-6">
        
        {/* Responsive sizing based on standard proportions */}
        <Image
          source={require('../../assets/logo.png')}
          style={{
            width: width * 0.45,
            height: width * 0.45,
            maxWidth: 220,
            maxHeight: 220,
          }}
          resizeMode="contain"
        /><Text className="text-textPrimary text-4xl font-extrabold mt-8 text-center">
          
          QUEUELESS
        </Text><Text className="text-primary text-sm mt-2 text-center font-bold tracking-tight">
          
          Campus Office
        </Text><Text className="text-textSecondary text-lg mt-12 text-center leading-relaxed px-4">
          
          The smartest way to manage queues and track your campus services in
          real-time. Wait less, do more.
        </Text><TouchableOpacity
          className="w-full bg-buttonPrimary py-4 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-600/40 elevation-8"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login')}><Text className="text-white font-bold tracking-tight text-lg mr-2">
            
            Get Started
          </Text><ChevronRight color="#FFFFFF" size={24} /></TouchableOpacity></View></SafeAreaView>
  );
};
export default WelcomeScreen;
