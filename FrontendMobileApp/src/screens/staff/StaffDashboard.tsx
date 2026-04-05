import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useAppSelector} from '../../store';
import {
  LogOut,
  Clock,
  Monitor,
  Bell,
  ArrowUpRight,
} from 'lucide-react-native';
import {useAuth} from '../../context/AuthContext';

const AssignedServiceCard = ({name, counter, timeLimit}: {name: string, counter: string, timeLimit: string}) => (
  <View className="bg-card rounded-[40px] p-8 border border-stone-800 mb-8 shadow-2xl relative overflow-hidden">
    <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
    
    <View className="mb-8">
      <Text className="text-stone-500 text-[10px] uppercase tracking-[4px] font-black mb-2">Active Node</Text>
      <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter shadow-sm">{name}</Text>
    </View>

    <View className="flex-row gap-x-4">
      <View className="flex-1 bg-stone-900 px-6 py-6 rounded-[32px] border border-stone-800">
        <Monitor color="#C2410C" size={20} className="mb-3" />
        <Text className="text-stone-500 text-[8px] font-black uppercase tracking-widest mb-1">Terminal</Text>
        <Text className="text-textPrimary text-2xl font-black">#{counter}</Text>
      </View>
      <View className="flex-1 bg-stone-900 px-6 py-6 rounded-[32px] border border-stone-800">
        <Clock color="#C2410C" size={20} className="mb-3" />
        <Text className="text-stone-500 text-[8px] font-black uppercase tracking-widest mb-1">Session Limit</Text>
        <Text className="text-textPrimary text-2xl font-black">{timeLimit}m</Text>
      </View>
    </View>

    <TouchableOpacity className="mt-8 bg-stone-900 py-5 rounded-3xl flex-row items-center justify-center border border-stone-800 border-dashed">
      <Text className="text-stone-500 font-bold text-xs uppercase tracking-widest">System Telemetry</Text>
      <ArrowUpRight color="#78716C" size={14} className="ml-2" />
    </TouchableOpacity>
  </View>
);

const StaffDashboard = () => {
  const {user} = useAppSelector(state => state.auth);
  const {logout} = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-12">
          <View>
            <Text className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Station Console</Text>
            <Text className="text-textPrimary text-2xl font-black tracking-tighter">
              Welcome, {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="w-12 h-12 bg-card rounded-2xl items-center justify-center border border-stone-800 active:scale-90 transition-transform">
            <LogOut color="#9A3412" size={20} />
          </TouchableOpacity>
        </View>

        <AssignedServiceCard 
          name={user?.assignedService?.name || 'Academic Office'}
          counter={user?.assignedCounter || '05'}
          timeLimit={user?.assignedService?.timeLimit || '10'}
        />

        <View className="flex-row gap-x-4 mb-8">
           <View className="flex-1 bg-stone-900/50 border border-stone-800 rounded-[32px] p-6 items-center">
              <Text className="text-textPrimary text-3xl font-black">24</Text>
              <Text className="text-stone-600 text-[8px] font-black uppercase tracking-widest mt-1">Processed</Text>
           </View>
           <View className="flex-1 bg-stone-900/50 border border-stone-800 rounded-[32px] p-6 items-center">
              <Text className="text-primary text-3xl font-black">02</Text>
              <Text className="text-stone-600 text-[8px] font-black uppercase tracking-widest mt-1">Live Queue</Text>
           </View>
        </View>

        <View className="space-y-4 mb-40">
          <TouchableOpacity className="bg-stone-900/50 rounded-[32px] p-6 flex-row items-center border border-stone-800 mb-4 items-center">
            <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20 mr-4">
               <Bell color="#C2410C" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-bold text-sm mb-1 uppercase tracking-tighter">System Notices</Text>
              <Text className="text-stone-500 text-[10px] font-bold">Real-time administrative broadcasts</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffDashboard;
