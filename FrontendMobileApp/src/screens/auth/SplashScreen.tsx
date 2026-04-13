import React, {useEffect} from 'react';
import {View, Image, Animated, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View className="flex-1 bg-background justify-center items-center"><Animated.View
        style={{opacity: fadeAnim, transform: [{scale: scaleAnim}]}}
        className="items-center"><Image
          source={require('../../assets/logo.png')}
          className="w-40 h-40"
          resizeMode="contain"
        /><Text className="text-primary text-3xl font-bold tracking-tight mt-4">
          
          QUEUELESS
        </Text><Text className="text-textSecondary text-sm mt-1">
          
          Campus Office
        </Text></Animated.View></View>
  );
};
export default SplashScreen;
