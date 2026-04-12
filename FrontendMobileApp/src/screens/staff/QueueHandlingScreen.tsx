import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useAppSelector} from '../../store';
import {
  Play,
  CheckCircle,
  Clock,
  Users,
  ChevronRight,
  Timer as TimerIcon,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  XCircle,
  ArrowRightCircle,
  Zap,
} from 'lucide-react-native';
import api from '../../services/api';

const QueueHandlingScreen = ({navigation}: any) => {
  const {user} = useAppSelector((state: any) => state.auth);
  const isAssigned = !!user?.assignedCounter;
  const [isServing, setIsServing] = useState(false);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [waitingQueue, setWaitingQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  const fetchData = async () => {
    if (!isAssigned) {
        setLoading(false);
        return;
    }
    try {
      const response = await api.get('/tokens/staff/queue');
      setWaitingQueue(response.data.waiting || []);
      setActiveToken(response.data.serving || null);
      setIsServing(!!response.data.serving);
      
      if (response.data.serving) {
          // Calculate time spent since token started
          const start = new Date(response.data.serving.startTime).getTime();
          const now = new Date().getTime();
          setTimer(Math.floor((now - start) / 1000));
      } else {
          setTimer(0);
      }
    } catch (e) {
      console.error('Failed to sync operator queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const inv = setInterval(fetchData, 10000);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isServing) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isServing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartNext = async () => {
      if (waitingQueue.length === 0) {
          Alert.alert('Queue Empty', 'No pending units in the grid allocation.');
          return;
      }
      try {
          setLoading(true);
          const nextTokenId = waitingQueue[0]._id;
          const response = await api.post(`/tokens/start/${nextTokenId}`);
          setActiveToken(response.data.token);
          setIsServing(true);
          fetchData();
      } catch (e: any) {
          Alert.alert('Protocol Error', e.response?.data?.message || 'Failed to initialize session.');
      } finally {
          setLoading(false);
      }
  };

  const handleComplete = async () => {
      if (!activeToken) return;
      try {
          setLoading(true);
          await api.post(`/tokens/complete/${activeToken._id}`);
          setActiveToken(null);
          setIsServing(false);
          setTimer(0);
          fetchData();
      } catch (e) {
          Alert.alert('Protocol Error', 'Failed to close session.');
      } finally {
          setLoading(false);
      }
  };

  if (loading) {
      return (
          <View className="flex-1 bg-[#0C0A09] items-center justify-center">
              <ActivityIndicator color="#EA580C" size="large" />
          </View>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center justify-between mb-12">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800 shadow-2xl">
                <ArrowLeft color="#78716C" size={24} strokeWidth={3} />
            </TouchableOpacity>
            <Text className="text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] ml-4">Queue Handler</Text>
            <TouchableOpacity onPress={fetchData} className="w-14 h-14 bg-[#171412] rounded-2xl items-center justify-center border border-stone-800">
                <RefreshCw color="#EA580C" size={20} strokeWidth={2.5} />
            </TouchableOpacity>
        </View>

        {!isAssigned ? (
          <View className="flex-1 items-center justify-center mb-10">
            <View className="w-32 h-32 bg-[#171412] border-2 border-stone-800/60 rounded-[3rem] flex items-center justify-center mb-8 shadow-inner">
               <Monitor color="#292524" size={56} strokeWidth={1} />
            </View>
            <Text className="text-stone-700 text-2xl font-black uppercase tracking-widest mb-4">Sync Disabled</Text>
            <Text className="text-stone-800 text-[10px] font-black uppercase tracking-widest text-center px-12 leading-relaxed">
               Terminal linkage is inactive. Return to dashboard and wait for administrative allocation protocol.
            </Text>
          </View>
        ) : (
          <>
            {/* Active Serving Card */}
            <View className="bg-[#171412] rounded-[60px] p-12 border border-stone-800/60 mb-12 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <View className="absolute top-0 right-0 w-80 h-80 bg-orange-600/[0.02] rounded-full -mr-40 -mt-40 pointer-events-none" />
              
              <View className="items-center mb-10">
                <Text className="text-stone-600 text-[10px] uppercase font-black tracking-[0.6em] mb-6">
                  {isServing ? 'OPERATIONAL_UNIT_ACTIVE' : 'GRID_READY'}
                </Text>
                <Text className="text-textPrimary text-9xl font-black tracking-tighter leading-none mb-4">
                  {activeToken ? activeToken.number : '---'}
                </Text>
                
                {isServing && (
                  <View className="flex-row items-center mt-6 bg-[#0C0A09] px-6 py-2.5 rounded-full border border-orange-600/20 shadow-inner">
                    <TimerIcon color="#EA580C" size={18} strokeWidth={3} />
                    <Text className="text-orange-600 font-black text-2xl ml-4 tabular-nums tracking-tighter">{formatTime(timer)}</Text>
                  </View>
                )}
              </View>

              <View className="flex-row gap-6 w-full">
                {!isServing ? (
                  <TouchableOpacity
                    onPress={handleStartNext}
                    disabled={waitingQueue.length === 0}
                    className={`flex-1 ${waitingQueue.length > 0 ? 'bg-orange-600 shadow-[0_30px_60px_-10px_rgba(234,88,12,0.4)]' : 'bg-stone-900 border border-stone-800'} py-6 rounded-[32px] flex-row items-center justify-center active:scale-95 transition-all overflow-hidden`}>
                    {waitingQueue.length > 0 && <View className="absolute top-0 left-0 w-1.5 h-full bg-white opacity-20" />}
                    <Play color={waitingQueue.length > 0 ? "#FFF" : "#44403C"} size={22} strokeWidth={3} />
                    <Text className={`${waitingQueue.length > 0 ? 'text-white' : 'text-stone-800'} font-black ml-4 tracking-[0.3em] text-[10px] uppercase`}>START NEXT</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleComplete}
                    className="flex-1 bg-emerald-600 shadow-[0_30px_60px_-10px_rgba(16,185,129,0.4)] py-6 rounded-[32px] flex-row items-center justify-center active:scale-95 transition-all overflow-hidden">
                     <View className="absolute top-0 left-0 w-1.5 h-full bg-white opacity-20" />
                    <CheckCircle color="#FFF" size={22} strokeWidth={3} />
                    <Text className="text-white font-black ml-4 tracking-[0.3em] text-[10px] uppercase">DONE</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Queue List section */}
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-10 px-2">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-[#171412] rounded-2xl flex items-center justify-center border border-stone-800 mr-5 shadow-inner">
                     <Users color="#EA580C" size={24} strokeWidth={2.5} />
                  </View>
                  <Text className="text-textPrimary text-2xl font-black uppercase tracking-tighter">Waiting Grid</Text>
                </View>
                <View className="bg-[#171412] px-5 py-2 rounded-full border border-stone-800 shadow-inner">
                  <Text className="text-stone-500 text-[10px] font-black uppercase tracking-widest">{waitingQueue.length} Pending</Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {waitingQueue.length > 0 ? waitingQueue.map((item, idx) => (
                  <View key={item._id} className="bg-[#171412] rounded-[32px] p-6 mb-6 border border-stone-800/40 flex-row items-center shadow-xl group">
                    <View className="w-16 h-16 bg-[#0C0A09] rounded-2xl items-center justify-center border border-orange-600/20 mr-6 shadow-inner">
                      <Text className="text-orange-600 font-black text-xl tracking-tighter tabular-nums">{item.number}</Text>
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="text-textPrimary font-black text-base uppercase tracking-tighter mb-1">{item.user?.name || 'Protocol Unknown'}</Text>
                      <View className="flex-row items-center">
                         <Clock color="#44403C" size={10} />
                         <Text className="text-stone-700 text-[9px] font-black uppercase tracking-widest ml-1.5">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} SYNC_TIME</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                        className="w-12 h-12 rounded-full bg-[#0C0A09] border border-stone-800 flex items-center justify-center"
                        onPress={() => Alert.alert('Protocol Options', 'Execute sequence skip or manual override?', [{text: 'Skip', style: 'destructive'}, {text: 'Cancel', style: 'cancel'}])}
                    >
                        <ArrowRightCircle color="#292524" size={22} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                )) : (
                    <View className="py-20 items-center opacity-20 filter grayscale">
                        <Zap color="#292524" size={64} strokeWidth={1} />
                        <Text className="text-[10px] font-black uppercase tracking-[1em] mt-8 text-center ml-10">Communications_Idle</Text>
                    </View>
                )}
                <View className="h-40" />
              </ScrollView>
            </View>

            {/* Footer Emergency Alert */}
            <TouchableOpacity className="mx-2 bg-red-950/10 py-5 rounded-[32px] items-center border border-stone-800 mb-10 flex-row justify-center border-dashed">
                <AlertCircle color="#ef4444" size={18} strokeWidth={2.5} opacity={0.6} />
                <Text className="text-stone-700 font-black text-[9px] ml-4 uppercase tracking-[0.3em]">
                    Report Operational Disruption
                </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default QueueHandlingScreen;
