import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import api from '../../services/api';
import {useAppSelector} from '../../store';
import {useAuth} from '../../context/AuthContext';
import {
  Play,
  CheckCircle,
  Pause,
  ChevronRight,
  User,
  LogOut,
  Megaphone,
  Bell,
  Activity,
} from 'lucide-react-native';
import {socketService} from '../../services/socket';

interface Token {
  _id: string;
  number: string;
  student?: {name: string};
  service?: {name: string};
}

interface Counter {
  _id: string;
  number: number;
  status: string;
  services: {name: string}[];
}

const StaffDashboard = () => {
  const {user} = useAppSelector(state => state.auth);
  const {logout} = useAuth();
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [counter, setCounter] = useState<Counter | null>(null);
  const [queue, setQueue] = useState<Token[]>([]);
  const [counterStatus, setCounterStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    if (!user?.token) {
      setRefreshing(false);
      return;
    }
    try {
      const [statusRes, notifRes] = await Promise.all([
        api.get('/counters/my-counter'),
        api.get('/notifications'),
      ]);
      setCurrentToken(statusRes.data.counter.currentToken);
      setQueue(statusRes.data.waitingTokens);
      setCounterStatus(statusRes.data.counter.status);
      setCounter(statusRes.data.counter);
      setAnnouncements(
        notifRes.data.filter((n: any) => n.type === 'broadcast').slice(0, 2),
      );
    } catch (error) {
      console.error('Error fetching counter status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  useEffect(() => {
    fetchStatus();

    if (user?.token && counter?._id) {
      socketService.connect(user.token);
      socketService.joinQueue(counter._id);

      socketService.onQueueUpdate(() => {
        console.log('Staff: Queue update received');
        fetchStatus();
      });
    }

    return () => {
      socketService.off('queueUpdated');
    };
  }, [user?.token, counter?._id]);

  const handleNext = async () => {
    if (!counter || !user?.token) {
      return;
    }
    try {
      const response = await api.post('/counters/call-next', {
        counterId: counter._id,
      });
      if (response.data.token) {
        setCurrentToken(response.data.token);
        fetchStatus(); // Refresh queue
      } else {
        Alert.alert('Empty Queue', 'No more students in line.');
        setCurrentToken(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to call next token.');
    }
  };

  const handleComplete = async () => {
    // Calling handleNext again will mark current as complete in our logic
    handleNext();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-primary text-2xl font-black">
              Counter {counter?.number?.toString().padStart(2, '0') || '--'}
            </Text>
            <Text className="text-textSecondary text-sm font-medium">
              Staff: {user?.name}
            </Text>
            <Text className="text-primary text-[10px] uppercase font-bold mt-1">
              Services: {counter?.services.map(s => s.name).join(', ') || 'N/A'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="w-12 h-12 bg-card rounded-2xl items-center justify-center border border-stone-800">
            <LogOut color="#9A3412" size={20} />
          </TouchableOpacity>
        </View>

        {/* Serving Section */}
        <View className="bg-card rounded-[40px] p-8 items-center justify-center border border-stone-800 mb-6 shadow-2xl relative overflow-hidden">
          <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          
          <Text className="text-textSecondary text-[10px] uppercase tracking-[4px] font-black mb-4">
            Currently Serving
          </Text>
          <Text className="text-textPrimary text-7xl font-black mb-10 tracking-widest shadow-sm">
            {currentToken ? currentToken.number : '---'}
          </Text>

          <View className="flex-row gap-4 w-full">
            <TouchableOpacity
              onPress={handleComplete}
              className="flex-1 bg-primary px-4 py-5 rounded-3xl flex-row items-center justify-center shadow-lg shadow-orange-950/20 active:scale-95">
              <CheckCircle color="#FFF" size={20} />
              <Text className="text-white font-black ml-2 tracking-tighter">COMPLETE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 border-2 border-primary/30 bg-stone-900/50 px-4 py-5 rounded-3xl flex-row items-center justify-center active:scale-95">
              <Play color="#9A3412" size={20} />
              <Text className="text-primary font-black ml-2 tracking-tighter">CALL NEXT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Token Preview & stats */}
        <View className="flex-row gap-4 mb-8">
           <View className="flex-1 bg-stone-900/50 border border-stone-800 rounded-[32px] p-6">
              <Text className="text-stone-500 text-[8px] font-black uppercase tracking-widest mb-2">Next in Line</Text>
              <Text className="text-textPrimary text-2xl font-black">{queue[0]?.number || 'NONE'}</Text>
              <Text className="text-stone-600 text-[8px] font-bold uppercase mt-1" numberOfLines={1}>{queue[0]?.student?.name || 'Empty'}</Text>
           </View>
           <View className="flex-1 bg-stone-900/50 border border-stone-800 rounded-[32px] p-6">
              <Text className="text-stone-500 text-[8px] font-black uppercase tracking-widest mb-2">Queue Load</Text>
              <Text className="text-primary text-2xl font-black">{queue.length}</Text>
              <Text className="text-stone-600 text-[8px] font-bold uppercase mt-1">Pending Tokens</Text>
           </View>
        </View>

        {/* Queue List */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-6 px-2">
            <Text className="text-textPrimary text-xl font-black uppercase tracking-tighter italic">
              Upcoming Queue
            </Text>
            <View className="bg-stone-900 px-4 py-1.5 rounded-full border border-stone-800">
              <Activity color="#9A3412" size={12} />
            </View>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#C2410C"
              />
            }>
            {queue.map((item, index) => (
              <View
                key={index}
                className=" p-5 rounded-2xl mb-3 border border-stone-800 flex-row justify-between items-center">
                <View>
                  <Text className="text-textPrimary font-bold text-lg">
                    {item.number}
                  </Text>
                  <Text className="text-textSecondary text-xs">
                    Student: {item.student?.name || 'Unknown'}
                  </Text>
                  <Text className="text-primary text-[10px] uppercase font-bold">
                    {item.service?.name}
                  </Text>
                </View>
                <ChevronRight color="#44403C" size={20} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Announcements Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Megaphone color="#C2410C" size={16} />
            <Text className="text-textPrimary font-bold text-sm ml-2 uppercase tracking-widest">
              Campus Announcements
            </Text>
          </View>
          {announcements.length > 0 ? (
            announcements.map((ann, i) => (
              <View
                key={i}
                className="bg-stone-900/50 p-4 rounded-2xl border border-stone-800 mb-2">
                <Text className="text-textPrimary font-bold text-xs">
                  {ann.title}
                </Text>
                <Text
                  className="text-textSecondary text-[10px] mt-1"
                  numberOfLines={1}>
                  {ann.message}
                </Text>
              </View>
            ))
          ) : (
            <View className="p-4 border border-stone-800 border-dashed rounded-2xl items-center">
              <Text className="text-stone-600 text-[10px] font-bold">
                No new admin broadcasts
              </Text>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <TouchableOpacity className="bg-stone-900 py-4 rounded-2xl items-center border border-stone-800 mb-10 flex-row justify-center mt-auto">
          <Pause color="#FDBA74" size={18} />
          <Text className="text-buttonSecondary font-bold text-base ml-3 uppercase tracking-tighter">
            PAUSE COUNTER SERVICE
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StaffDashboard;
