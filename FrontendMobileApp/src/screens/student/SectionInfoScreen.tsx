import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Info,
} from 'lucide-react-native';
import {useAppSelector} from '../../store';

const SectionInfoScreen = () => {
  const navigation = useNavigation<any>();
  const {user} = useAppSelector(state => state.auth);
  const section = user?.section;
  const advisor = section?.facultyAdvisor;

  return (
    <ScrollView className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-bold">
          Section Details
        </Text>
      </View>

      {/* Hero Card */}
      <View className="bg-card p-10 rounded-[40px] border border-stone-800 mb-8 items-center relative overflow-hidden">
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-6">
          <Users color="#C2410C" size={40} />
        </View>
        <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter">
          {section?.name || 'Not Assigned'}
        </Text>
        <Text className="text-primary font-bold text-sm tracking-[4px] mt-2 uppercase">
          {user?.yearOfStudy || 'Year N/A'}
        </Text>
      </View>

      {/* Advisor Info */}
      <View className="mb-8">
        <Text className="text-textSecondary text-[10px] uppercase font-black tracking-widest mb-4 ml-2">
          Faculty Advisor
        </Text>
        <View className="bg-card p-6 rounded-[32px] border border-stone-800">
          <View className="flex-row items-center mb-6">
            <View className="w-14 h-14 bg-background rounded-full items-center justify-center border border-stone-800">
              <ShieldCheck color="#9A3412" size={28} />
            </View>
            <View className="ml-4">
              <Text className="text-textPrimary font-bold text-lg">
                {advisor?.name || 'Assigning Advisor...'}
              </Text>
              <Text className="text-textSecondary text-xs">
                Official Mentor & Coordindator
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            <TouchableOpacity className="flex-row items-center bg-background/50 p-4 rounded-2xl border border-stone-800/50">
              <Mail color="#78716C" size={18} />
              <Text className="text-textPrimary text-xs font-bold ml-4">
                {advisor?.email || 'mentor@college.edu'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-background/50 p-4 rounded-2xl border border-stone-800/50">
              <Phone color="#78716C" size={18} />
              <Text className="text-textPrimary text-xs font-bold ml-4">
                {advisor?.phone || '+91 98765 43210'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Responsibilities */}
      <View className="mb-12">
        <Text className="text-textSecondary text-[10px] uppercase font-black tracking-widest mb-4 ml-2">
          Advisor Guidelines
        </Text>
        <View className="bg-stone-900/30 p-8 rounded-[32px] border border-stone-800 border-dashed">
          <View className="flex-row items-start mb-6">
            <Info color="#C2410C" size={18} className="mt-1" />
            <View className="ml-4">
              <Text className="text-textPrimary font-bold text-sm mb-1">
                Document Review
              </Text>
              <Text className="text-textSecondary text-[11px] leading-4">
                Your advisor is responsible for reviewing all uploaded student documents.
              </Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <Info color="#C2410C" size={18} className="mt-1" />
            <View className="ml-4">
              <Text className="text-textPrimary font-bold text-sm mb-1">
                Academic Approvals
              </Text>
              <Text className="text-textSecondary text-[11px] leading-4">
                Semester registrations and progress tracking are managed by your advisor.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-20 items-center">
        <Text className="text-stone-600 text-[10px] text-center">
          Placement: {user?.yearOfStudy} → {section?.name} → {advisor?.name}
        </Text>
      </View>
    </ScrollView>
  );
};

export default SectionInfoScreen;
