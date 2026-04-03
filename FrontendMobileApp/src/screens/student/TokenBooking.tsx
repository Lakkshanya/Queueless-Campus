import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  Ticket,
  Clock,
  Info,
  CheckCircle,
  ArrowLeft,
  Calendar,
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

  const confirmBooking = async () => {
    if (!service?._id || !user?.token) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/tokens/book', {serviceId: service._id});
      setLoading(false); // Assuming setBooking was a typo for setLoading
      dispatch(setActiveToken(response.data));

      const newToken = response.data;

      Alert.alert(
        'Booking Confirmed!',
        `Your token ${newToken.number} has been booked.`,
        [
          {
            text: 'View Status',
            onPress: () =>
              navigation.navigate('LiveQueue', {tokenId: newToken._id}),
          },
        ],
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to book token. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <View className="w-24 h-24 rounded-full items-center justify-center mb-4">
            <Ticket color="#9A3412" size={48} />
          </View>
          <Text className="text-textPrimary text-2xl font-bold text-center">
            {service.name}
          </Text>
          <Text className="text-textSecondary text-sm uppercase tracking-widest mt-1">
            Token Booking
          </Text>
        </View>

        <View className="bg-card rounded-3xl p-6 border border-stone-800 mb-8">
          <Text className="text-textPrimary font-bold mb-6 text-lg">
            Booking Details
          </Text>

          <View className="space-y-6">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-background rounded-xl items-center justify-center mr-4">
                <Clock color="#C2410C" size={20} />
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] uppercase">
                  Estimated Time
                </Text>
                <Text className="text-textPrimary font-bold text-lg">
                  {service.estimatedTimePerToken} mins
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-background rounded-xl items-center justify-center mr-4">
                <Calendar color="#9A3412" size={20} />
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] uppercase">
                  Preferred Slot
                </Text>
                <Text className="text-textPrimary font-bold text-lg">
                  Immediate (Next Available)
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-background rounded-xl items-center justify-center mr-4">
                <Info color="#FDBA74" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-textSecondary text-[10px] uppercase">
                  Requirement
                </Text>
                <Text className="text-textPrimary font-bold text-sm">
                  Valid Student ID is mandatory for service.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className=" rounded-2xl p-4 border border-stone-800 mb-10">
          <Text className="text-textSecondary text-xs leading-5">
            By confirming, you agree to visit the office once your token is
            within the next 5 positions. Failure to appear will result in token
            expiration.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        className="bg-buttonPrimary rounded-2xl py-5 items-center justify-center mb-10  "
        onPress={confirmBooking}
        disabled={loading}>
        {loading ? (
          <Text className="text-white font-bold text-lg">Loading...</Text>
        ) : (
          <View className="flex-row items-center">
            <CheckCircle color="#FFF" size={24} className="mr-3" />
            <Text className="text-white font-bold text-xl ml-3">
              Confirm Booking
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TokenBooking;
