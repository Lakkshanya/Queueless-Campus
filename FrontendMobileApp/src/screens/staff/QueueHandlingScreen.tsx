import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  Play,
  CheckCircle,
  Clock,
  Users,
  ChevronRight,
  Timer as TimerIcon,
  AlertCircle,
} from 'lucide-react-native';

const QueueHandlingScreen = () => {
  const [isServing, setIsServing] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    let interval: any;
    if (isServing && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isServing, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mockQueue = [
    { id: '1', number: 'A-102', name: 'John Doe', service: 'Document Verification' },
    { id: '2', number: 'A-103', name: 'Jane Smith', service: 'Fee payment' },
    { id: '3', number: 'A-104', name: 'Robert Brown', service: 'Transcript Request' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-6 pt-6">
        <Text className="text-textPrimary text-2xl font-black uppercase tracking-tighter mb-8">Queue Handling</Text>

        {/* Active Serving Card */}
        <View className="bg-card rounded-[40px] p-8 border border-stone-800 mb-8 shadow-2xl relative overflow-hidden">
          <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          
          <View className="items-center mb-8">
            <Text className="text-stone-500 text-[10px] uppercase tracking-[4px] font-black mb-4">
              {isServing ? 'Now Serving' : 'Ready to Start'}
            </Text>
            <Text className="text-textPrimary text-6xl font-black tracking-widest">
              {isServing ? 'A-101' : '---'}
            </Text>
            {isServing && (
              <View className="flex-row items-center mt-4 bg-stone-900 px-4 py-2 rounded-full border border-stone-800">
                <TimerIcon color="#C2410C" size={16} />
                <Text className="text-primary font-black text-xl ml-3 tracking-tighter">{formatTime(timer)}</Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-4 w-full">
            {!isServing ? (
              <TouchableOpacity
                onPress={() => setIsServing(true)}
                className="flex-1 bg-primary px-4 py-5 rounded-3xl flex-row items-center justify-center shadow-lg shadow-orange-950/20 active:scale-95">
                <Play color="#FFF" size={20} />
                <Text className="text-white font-black ml-2 tracking-widest text-xs uppercase">Start Service</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {setIsServing(false); setTimer(600);}}
                className="flex-1 bg-emerald-500 px-4 py-5 rounded-3xl flex-row items-center justify-center shadow-lg shadow-emerald-950/20 active:scale-95">
                <CheckCircle color="#FFF" size={20} />
                <Text className="text-white font-black ml-2 tracking-widest text-xs uppercase">Mark Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Queue List section */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Users color="#C2410C" size={20} />
              <Text className="text-textPrimary text-lg font-black ml-3 uppercase tracking-tighter">Waiting Line</Text>
            </View>
            <View className="bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
              <Text className="text-stone-500 text-[10px] font-black">{mockQueue.length}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {mockQueue.map((item) => (
              <View key={item.id} className="bg-card/50 rounded-3xl p-5 mb-4 border border-stone-800 flex-row items-center">
                <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800 mr-4">
                  <Text className="text-primary font-black text-xs">{item.number}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-textPrimary font-bold text-base">{item.name}</Text>
                  <Text className="text-stone-500 text-xs mt-1">{item.service}</Text>
                </View>
                <ChevronRight color="#44403C" size={20} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Emergency Alert */}
        <TouchableOpacity className="bg-stone-900/50 py-4 rounded-2xl items-center border border-stone-800 mb-6 flex-row justify-center border-dashed">
          <AlertCircle color="#78716C" size={18} />
          <Text className="text-stone-500 font-bold text-xs ml-3 uppercase tracking-widest">
            Notify Admin of Availability Issue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default QueueHandlingScreen;
