import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useAppSelector} from '../../store';
import {
  Send,
  Users,
  ShieldCheck,
  Bell,
  MessageSquare,
  ChevronRight,
  Zap,
  Activity,
  ArrowLeft,
} from 'lucide-react-native';
import api from '../../services/api';

const StaffNotificationScreen = ({navigation}: any) => {
  const {user} = useAppSelector(state => state.auth);
  const [target, setTarget] = useState('student'); // 'student' or 'admin'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDispatch = async () => {
    if (!message.trim()) {
      Alert.alert('Protocol Error', 'Verification failed: Message buffer is empty.');
      return;
    }

    setLoading(true);
    try {
      if (target === 'student') {
        const serviceId = user?.assignedService?._id || user?.assignedServices?.[0]?._id;
        if (!serviceId) {
            Alert.alert('Scope Error', 'No assigned service node detected for targeted broadcast.');
            return;
        }
        await api.post('/notifications/staff/broadcast', {
            serviceId,
            message
        });
        Alert.alert('Dispatch Synchronized', 'Your message has been broadcasted to all students in the current grid.');
      } else {
        await api.post('/notifications/admin/notify', { message });
        Alert.alert('Alert Transmitted', 'The Administrative Node has been notified of your request.');
      }
      setMessage('');
    } catch (error: any) {
      Alert.alert('Dispatch Failed', error.response?.data?.message || 'Network authorization error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mb-16">
          <View className="flex-1">
             <View className="flex-row items-center gap-2 mb-3">
                <Bell color="#EA580C" size={12} strokeWidth={3} />
                <Text className="text-orange-600 text-[10px] font-black uppercase tracking-[0.5em]">Communication_Control</Text>
             </View>
             <Text className="text-textPrimary text-4xl font-black tracking-tighter uppercase leading-none">Console</Text>
          </View>
          <View className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800 shadow-inner">
             <Zap color="#EA580C" size={20} strokeWidth={2.5} />
          </View>
        </View>

        <View className="bg-[#171412] rounded-[48px] p-10 border border-stone-800/60 mb-10 shadow-2xl relative overflow-hidden">
           <View className="absolute top-0 right-0 w-32 h-32 bg-orange-600/[0.03] rounded-full -mr-16 -mt-16 pointer-events-none" />
           
           <Text className="text-stone-600 text-[9px] font-black uppercase tracking-[0.4em] mb-8">Target Allocation</Text>
           
           <View className="flex-row gap-4 mb-10">
              <TouchableOpacity 
                onPress={() => setTarget('student')}
                className={`flex-1 p-6 rounded-3xl border-2 flex-row items-center justify-center ${target === 'student' ? 'bg-orange-600/10 border-orange-600' : 'bg-[#0C0A09] border-stone-800'}`}>
                 <Users color={target === 'student' ? '#EA580C' : '#44403C'} size={18} />
                 <Text className={`font-black text-[10px] uppercase tracking-widest ml-3 ${target === 'student' ? 'text-orange-600' : 'text-stone-700'}`}>STUDENTS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setTarget('admin')}
                className={`flex-1 p-6 rounded-3xl border-2 flex-row items-center justify-center ${target === 'admin' ? 'bg-orange-600/10 border-orange-600' : 'bg-[#0C0A09] border-stone-800'}`}>
                 <ShieldCheck color={target === 'admin' ? '#EA580C' : '#44403C'} size={18} />
                 <Text className={`font-black text-[10px] uppercase tracking-widest ml-3 ${target === 'admin' ? 'text-orange-600' : 'text-stone-700'}`}>ADMIN</Text>
              </TouchableOpacity>
           </View>

           <Text className="text-stone-600 text-[9px] font-black uppercase tracking-[0.4em] mb-6">Protocol Message</Text>
           <View className="bg-[#0C0A09] rounded-3xl p-6 border border-stone-800 min-h-[160px] mb-10">
              <TextInput
                multiline
                numberOfLines={6}
                placeholder="Initialize dispatch sequence..."
                placeholderTextColor="#292524"
                className="text-textPrimary font-bold text-base text-stone-300"
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />
           </View>

           <TouchableOpacity 
             onPress={handleDispatch}
             disabled={loading}
             className="bg-orange-600 py-6 rounded-3xl flex-row items-center justify-center shadow-xl active:scale-[0.98] transition-all">
             {loading ? <ActivityIndicator color="#FFF" /> : (
               <>
                 <Send color="#FFF" size={20} strokeWidth={3} />
                 <Text className="text-white font-black ml-4 uppercase tracking-[0.4em] text-[11px]">INITIALIZE_DISPATCH</Text>
               </>
             )}
           </TouchableOpacity>
        </View>

        <View className="bg-[#171412]/50 border border-stone-800/40 rounded-[40px] p-8 mb-40">
           <View className="flex-row items-center mb-6">
              <Activity color="#EA580C" size={14} />
              <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest ml-3">Node Operational Status</Text>
           </View>
           <Text className="text-stone-600 text-[10px] font-medium leading-relaxed italic">
             Broadcasts are encrypted and logged for security auditing. Students currently in positions 1-3 of the grid will receive high-priority push notifications.
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffNotificationScreen;
