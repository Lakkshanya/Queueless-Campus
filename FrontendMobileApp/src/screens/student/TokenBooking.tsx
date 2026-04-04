import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Alert, Modal} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  Ticket,
  Clock,
  Info,
  CheckCircle,
  ArrowLeft,
  Calendar,
  X
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppSelector, useAppDispatch} from '../../store';
import {setActiveToken} from '../../store/slices/tokenSlice';

const TokenBooking = () => {
  const {user} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {service} = route.params || {
    service: {
      _id: 'default',
      name: 'General Service',
      estimatedTimePerToken: 15,
    },
  };

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookedToken, setBookedToken] = useState<any>(null);

  const confirmBooking = async () => {
    if (!service?._id || !user?.token) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/tokens/book', {serviceId: service._id});
      dispatch(setActiveToken(response.data));
      setBookedToken(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to book token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToQueue = () => {
    setShowModal(false);
    navigation.navigate('LiveQueue', {tokenId: bookedToken?._id});
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold ml-4">
          Confirm Booking
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-10">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-4 bg-primary/10 border border-primary/20 shadow-xl shadow-primary/30">
            <Ticket color="#C2410C" size={40} />
          </View>
          <Text className="text-textPrimary text-3xl font-black text-center tracking-tighter">
            {service.name}
          </Text>
          <Text className="text-stone-500 text-[10px] font-bold uppercase tracking-[4px] mt-2">
            Token Request
          </Text>
        </View>

        <View className="bg-[#1C1917] rounded-[32px] p-8 border border-stone-800 mb-8 shadow-xl">
          <Text className="text-stone-400 font-bold mb-8 text-[11px] uppercase tracking-widest border-b border-stone-800 pb-4">
            Booking Variables
          </Text>

          <View className="space-y-6">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800 mr-4 shadow-sm">
                <Clock color="#C2410C" size={20} />
              </View>
              <View>
                <Text className="text-stone-500 text-[9px] uppercase tracking-widest font-black">
                  Estimated Session Time
                </Text>
                <Text className="text-textPrimary font-bold text-lg">
                  {service.estimatedTimePerToken} mins
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800 mr-4 shadow-sm">
                <Calendar color="#f59e0b" size={20} />
              </View>
              <View>
                <Text className="text-stone-500 text-[9px] uppercase tracking-widest font-black">
                  Service Slot
                </Text>
                <Text className="text-textPrimary font-bold text-lg">
                  Immediate Mode
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800 mr-4 shadow-sm">
                <Info color="#3b82f6" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-stone-500 text-[9px] uppercase tracking-widest font-black">
                  Requirement
                </Text>
                <Text className="text-textPrimary font-bold text-xs mt-1 leading-5">
                  Valid Student ID is strictly mandatory for verification before processing.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-stone-900/50 rounded-2xl p-5 border border-stone-800 border-dashed mb-10">
          <Text className="text-stone-400 text-[10px] leading-5 font-medium italic">
            * By confirming, you agree to monitor the live queue. Failure to appear at the counter within your designated timeframe will result in token forfeiture.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        className={`bg-primary rounded-[32px] py-6 items-center justify-center mb-10 active:scale-95 transition-transform shadow-lg ${loading ? 'opacity-70' : ''}`}
        onPress={confirmBooking}
        disabled={loading}>
        {loading ? (
          <Text className="text-white font-black text-xs uppercase tracking-widest">Processing Request...</Text>
        ) : (
          <View className="flex-row items-center">
            <CheckCircle color="#FFF" size={20} className="mr-3" />
            <Text className="text-white font-black text-sm uppercase tracking-[2px]">
              Confirm Booking
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Success Modal Custom Popup */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/80 px-6">
          <View className="bg-[#1C1917] w-full max-w-sm rounded-[40px] p-8 border border-stone-800 items-center shadow-2xl relative">
            <TouchableOpacity 
              onPress={() => setShowModal(false)}
              className="absolute top-6 right-6 w-8 h-8 bg-stone-900 rounded-full items-center justify-center border border-stone-800"
            >
              <X color="#78716C" size={16} />
            </TouchableOpacity>

            <View className="w-20 h-20 bg-emerald-500/10 rounded-full items-center justify-center mb-6 pt-1">
              <CheckCircle color="#10b981" size={40} />
            </View>
            
            <Text className="text-textPrimary text-3xl font-black mb-2">Booked!</Text>
            <Text className="text-stone-400 text-xs text-center mb-8 px-4">
              Your session has been scheduled successfully.
            </Text>

            <View className="bg-stone-900 w-full rounded-3xl p-6 border border-stone-800 mb-8 items-center">
              <Text className="text-stone-500 text-[10px] uppercase tracking-[4px] font-black mb-2">Token Number</Text>
              <Text className="text-primary text-6xl font-black tracking-tighter">{bookedToken?.number}</Text>
              
              <View className="flex-row items-center mt-6 pt-6 border-t border-stone-800 w-full justify-center">
                <Clock color="#C2410C" size={14} />
                <Text className="text-textSecondary text-xs ml-2 font-bold">
                  Wait: {bookedToken?.estimatedWaitTime || 0}m
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGoToQueue}
              className="w-full bg-emerald-600 rounded-[24px] py-5 items-center justify-center"
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">Go to Live Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TokenBooking;
