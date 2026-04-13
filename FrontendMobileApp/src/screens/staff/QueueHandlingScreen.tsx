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
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import {useAppSelector} from '../../store';
import {
  Play,
  CheckCircle,
  Clock,
  Users,
  Timer as TimerIcon,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Zap,
  Monitor,
  ChevronRight,
} from 'lucide-react-native';
import api from '../../services/api';

const QueueHandlingScreen = ({navigation}: any) => {
  const {user} = useAppSelector((state: any) => state.auth);
  const isAssigned = !!user?.assignedCounter;
  const [isServing, setIsServing] = useState(false);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [waitingQueue, setWaitingQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalServed, setTotalServed] = useState(0);

  const fetchData = async (isManual = false) => {
    if (!isAssigned) {
      setLoading(false);
      return;
    }
    if (isManual) setSyncing(true);
    
    try {
      const response = await api.get('/counters/my-counter');
      const counterData = response.data.counter || response.data;
      const waiting = response.data.waitingTokens || [];
      const current = counterData?.currentToken;
      
      setWaitingQueue(waiting);
      setActiveToken(current || null);
      setIsServing(!!current);
      setTotalServed(response.data.stats?.todayTotal || 0);

      if (current && current.startTime) {
        const start = new Date(current.startTime).getTime();
        const now = new Date().getTime();
        setTimer(Math.floor((now - start) / 1000));
      } else if (!current) {
        setTimer(0);
      }
    } catch (e) {
      console.error('Failed to sync operator queue', e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const inv = setInterval(() => fetchData(false), 8000);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isServing) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
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
      Alert.alert('Queue Empty', 'No students currently waiting in the operating matrix.');
      return;
    }
    try {
      setSyncing(true);
      const nextTokenId = waitingQueue[0]._id;
      const response = await api.put('/tokens/start', { tokenId: nextTokenId });
      
      if (response.data.token) {
        setActiveToken(response.data.token);
        setIsServing(true);
        // Reset timer based on server start time
        const start = new Date(response.data.token.startTime || new Date()).getTime();
        setTimer(Math.floor((new Date().getTime() - start) / 1000));
      }
      fetchData();
    } catch (e: any) {
      Alert.alert(
        'Protocol Error',
        e.response?.data?.message || 'Failed to initialize session.',
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleComplete = async () => {
    if (!activeToken) return;
    try {
      setSyncing(true);
      await api.put('/tokens/complete', { tokenId: activeToken._id });
      setActiveToken(null);
      setIsServing(false);
      setTimer(0);
      fetchData();
    } catch (e: any) {
      Alert.alert(
        'Protocol Error', 
        e.response?.data?.message || 'Failed to close session.'
      );
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0C0A09] items-center justify-center">
        <ActivityIndicator color="#EA580C" size="large" />
        <Text className="text-stone-500 text-[10px] font-bold tracking-widest uppercase mt-6 animate-pulse">
          Syncing Matrix...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-8 pt-4">
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-12">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-14 h-14 bg-[#171412] rounded-[20px] items-center justify-center border border-stone-800 shadow-lg">
            <ArrowLeft color="#78716C" size={24} strokeWidth={3} />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-1 opacity-60">
              Operational Unit
            </Text>
            <Text className="text-white text-2xl font-bold tracking-tight">
              STATION-{user?.assignedCounter?.number?.toString().padStart(2, '0') || '00'}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => fetchData(true)}
            disabled={syncing}
            className="w-14 h-14 bg-[#171412] rounded-[20px] items-center justify-center border border-stone-800 shadow-lg">
            {syncing ? (
              <ActivityIndicator color="#EA580C" size="small" />
            ) : (
              <RefreshCw color="#EA580C" size={20} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        {!isAssigned ? (
          <View className="flex-1 items-center justify-center mb-20">
            <View className="w-32 h-32 bg-[#171412] border-2 border-dashed border-stone-800 rounded-[40px] flex items-center justify-center mb-10">
              <Monitor color="#292524" size={56} strokeWidth={1} />
            </View>
            <Text className="text-stone-700 text-3xl font-bold tracking-tight mb-4 uppercase">
              Offline
            </Text>
            <Text className="text-stone-800 text-xs font-bold tracking-tight text-center px-12 leading-relaxed opacity-60">
              Terminal linkage is currently inactive. System waiting for administrative allocation protocol.
            </Text>
          </View>
        ) : (
          <>
            {/* Active Token Module */}
            <View style={styles.mainCardShadow}>
              <View className="bg-[#171412] rounded-[48px] p-10 border border-stone-800/60 relative overflow-hidden mb-12">
                <View className="absolute top-0 right-0 w-80 h-80 bg-orange-600/[0.03] rounded-full pointer-events-none" />
                
                <View className="items-center mb-10">
                  <View className="bg-orange-600/10 px-6 py-2 rounded-full border border-orange-600/20 mb-10">
                    <Text className="text-orange-600 text-[10px] font-bold tracking-widest uppercase">
                      {isServing ? 'Process in Progress' : waitingQueue.length > 0 ? 'Protocol Ready' : 'Inert State'}
                    </Text>
                  </View>
                  
                  <Text className="text-white text-8xl font-bold tracking-tighter leading-none mb-4">
                    {activeToken ? activeToken.number : waitingQueue[0]?.number || '---'}
                  </Text>
                  
                  <Text className="text-stone-500 text-xl font-bold tracking-tight mb-8">
                    {activeToken?.user?.name || activeToken?.student?.name || waitingQueue[0]?.user?.name || waitingQueue[0]?.student?.name || 'Protocol Unknown'}
                  </Text>
                  
                  {isServing && (
                    <View className="items-center">
                      <View className="flex-row items-center bg-[#0C0A09] px-8 py-4 rounded-[28px] border border-orange-600/30 shadow-inner">
                        <TimerIcon
                          color={timer > 600 ? '#EF4444' : '#EA580C'}
                          size={24}
                          strokeWidth={3}
                        />
                        <Text
                          className={`font-bold tracking-tight text-5xl ml-5 tabular-nums ${
                            timer > 600 ? 'text-red-500' : 'text-orange-600'
                          }`}>
                          {formatTime(timer)}
                        </Text>
                      </View>
                      <Text className="text-stone-700 text-[10px] font-bold tracking-tight mt-4 uppercase opacity-60">
                        Session Duration
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-5">
                  {!isServing ? (
                    <TouchableOpacity
                      onPress={handleStartNext}
                      disabled={waitingQueue.length === 0 || syncing}
                      className={`flex-1 py-7 rounded-[28px] flex-row items-center justify-center ${
                        waitingQueue.length > 0
                          ? 'bg-orange-600 shadow-xl shadow-orange-600/40'
                          : 'bg-stone-900 border border-stone-800 opacity-50'
                      }`}>
                      <Play
                        color={waitingQueue.length > 0 ? '#FFF' : '#44403C'}
                        size={22}
                        strokeWidth={3}
                      />
                      <Text
                        className={`${
                          waitingQueue.length > 0 ? 'text-white' : 'text-stone-700'
                        } font-bold tracking-tight ml-4 text-xs uppercase`}>
                        Start Session
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleComplete}
                      disabled={syncing}
                      className="flex-1 py-7 bg-emerald-600 rounded-[28px] flex-row items-center justify-center shadow-xl shadow-emerald-500/40">
                      <CheckCircle color="#FFF" size={22} strokeWidth={3} />
                      <Text className="text-white font-bold tracking-tight ml-4 text-xs uppercase">
                        End Session
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Queue Registry */}
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-10 px-2">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-[#171412] rounded-[18px] flex items-center justify-center border border-stone-800 mr-5 shadow-inner">
                    <Users color="#EA580C" size={22} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-white text-2xl font-bold tracking-tight">
                      Queue Preview
                    </Text>
                    <Text className="text-stone-600 text-[9px] font-bold tracking-widest uppercase mt-1 opacity-60">
                      Total Served: {totalServed}
                    </Text>
                  </View>
                </View>
                <View className="bg-[#171412] px-5 py-2 rounded-full border border-stone-800">
                  <Text className="text-stone-500 text-[10px] font-bold tracking-widest uppercase">
                    {waitingQueue.length} Pending
                  </Text>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{paddingBottom: 100}}>
                
                {waitingQueue.length > 0 ? (
                  waitingQueue.map((item, idx) => {
                    // Determine Protocol Label
                    let protocolLabel = null;
                    let protocolColor = '#78716C';
                    
                    if (isServing) {
                      if (idx === 0) { protocolLabel = 'NEXT'; protocolColor = '#EA580C'; }
                      else if (idx === 1) { protocolLabel = 'PREPARE'; protocolColor = '#7C2D12'; }
                    } else {
                      if (idx === 0) { protocolLabel = 'SERVING'; protocolColor = '#10B981'; }
                      else if (idx === 1) { protocolLabel = 'NEXT'; protocolColor = '#EA580C'; }
                      else if (idx === 2) { protocolLabel = 'PREPARE'; protocolColor = '#7C2D12'; }
                    }

                    return (
                      <View
                        key={item._id}
                        className={`bg-[#171412] rounded-[36px] p-8 mb-6 border ${
                          protocolLabel ? 'border-orange-600/40' : 'border-stone-800/40'
                        } flex-row items-center shadow-2xl`}>
                        
                        <View className={`w-16 h-16 ${protocolLabel ? 'bg-orange-600/10 border-orange-600/20' : 'bg-[#0C0A09] border-stone-800'} rounded-[20px] items-center justify-center border mr-6 shadow-inner`}>
                          <Text className={`font-bold tracking-tighter text-2xl tabular-nums ${protocolLabel ? 'text-orange-600' : 'text-stone-600'}`}>
                            {item.number}
                          </Text>
                        </View>
                        
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1.5">
                            <Text className="text-white font-bold tracking-tight text-lg mr-3 uppercase">
                              {item.user?.name || 'Authorized'}
                            </Text>
                            {protocolLabel && (
                              <View style={{backgroundColor: protocolColor}} className="px-2 py-0.5 rounded-md">
                                <Text className="text-white text-[7px] font-bold tracking-widest uppercase">{protocolLabel}</Text>
                              </View>
                            )}
                          </View>
                          <View className="flex-row items-center opacity-60">
                            <Clock color="#44403C" size={10} />
                            <Text className="text-stone-700 text-[10px] font-bold tracking-widest ml-1.5 uppercase">
                              Entry: {new Date(item.bookedAt || item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </Text>
                          </View>
                        </View>
                        
                        <TouchableOpacity
                          className="w-12 h-12 rounded-full bg-[#0C0A09] border border-stone-800 items-center justify-center active:bg-stone-900"
                          onPress={() =>
                            Alert.alert(
                              'Sequence Protocol',
                              `Initiate priority shift for Token ${item.number}?`,
                              [
                                {text: 'Execute Shift', style: 'destructive'},
                                {text: 'Cancel', style: 'cancel'},
                              ],
                            )
                          }>
                          <ChevronRight color="#44403C" size={20} strokeWidth={3} />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <View className="py-24 items-center opacity-10">
                    <Zap color="#292524" size={64} strokeWidth={1} />
                    <Text className="text-[10px] font-bold tracking-[0.8em] mt-8 text-center uppercase">
                      Grid_Clear
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Error Reporting */}
            <TouchableOpacity className="mt-4 bg-red-950/5 py-5 rounded-[28px] items-center border border-stone-800/40 border-dashed flex-row justify-center mb-8">
              <AlertCircle color="#ef4444" size={16} strokeWidth={2.5} opacity={0.4} />
              <Text className="text-stone-800 font-bold tracking-widest text-[9px] ml-4 uppercase opacity-40">
                Log Operational Disruption
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainCardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: {width: 0, height: 30},
        shadowOpacity: 0.15,
        shadowRadius: 40,
      },
      android: {
        elevation: 25,
      },
    }),
  },
});

export default QueueHandlingScreen;

